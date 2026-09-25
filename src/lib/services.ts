import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type {
  DatabaseService,
  PublicService,
  ServiceImage,
  ServiceModality,
  ServiceStatus,
} from '../types/service';
import type { PlanEntitlements } from './adminData';

export interface PlanFeaturedStatus {
  monthly_limit: number;
  used_count: number;
  remaining_count: number;
  duration_days: number;
  period_end?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
}

export interface NewServiceInput {
  owner_id: string;
  category_id: string;
  title: string;
  description: string;
  modality: ServiceModality;
  price: number | null;
  status: ServiceStatus;
}

export function listCategories() {
  return supabase
    .from('service_categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name') as unknown as Promise<PostgrestSingleResponse<ServiceCategory[]>>;
}

export function listPublicServices() {
  return supabase
    .from('public_services')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('is_interest_featured', { ascending: false })
    .order('priority_results_enabled', { ascending: false })
    .order('profile_boost_enabled', { ascending: false })
    .order('interest_score', { ascending: false })
    .order('created_at', { ascending: false }) as unknown as Promise<PostgrestSingleResponse<PublicService[]>>;
}

export function listOwnerServices(ownerId: string) {
  return supabase
    .from('services')
    .select('*')
    .eq('owner_id', ownerId)
    .order('updated_at', { ascending: false }) as unknown as Promise<PostgrestSingleResponse<DatabaseService[]>>;
}

export function getEffectivePlanEntitlements() {
  return supabase.rpc('get_effective_plan_entitlements') as unknown as Promise<PostgrestSingleResponse<PlanEntitlements>>;
}

export function getPlanFeaturedStatus() {
  return supabase.rpc('get_plan_featured_status') as unknown as Promise<PostgrestSingleResponse<PlanFeaturedStatus>>;
}

export function activatePlanFeaturedService(serviceId: string) {
  return supabase.rpc('activate_plan_featured_service', { target_service_id: serviceId }) as unknown as Promise<PostgrestSingleResponse<{ service_id: string; ends_at: string; monthly_limit: number; used_count: number; remaining_count: number }>>;
}

export function listOwnerPlanFeaturedServices(ownerId: string) {
  return supabase
    .from('provider_plan_featured_services')
    .select('service_id, ends_at, status')
    .eq('provider_id', ownerId)
    .eq('status', 'active')
    .gt('ends_at', new Date().toISOString()) as unknown as Promise<PostgrestSingleResponse<Array<{ service_id: string; ends_at: string; status: string }>>>;
}

const VISITOR_KEY = 'conectautp-visitor-key';

function getVisitorKey() {
  if (typeof window === 'undefined') return 'server';
  const existing = window.localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.localStorage.setItem(VISITOR_KEY, next);
  return next;
}

export function recordServiceView(serviceId: string) {
  return supabase.rpc('record_service_view', {
    target_service_id: serviceId,
    visitor_key: getVisitorKey(),
  });
}

export function getPublicService(serviceId: string) {
  return supabase
    .from('public_services')
    .select('*')
    .eq('id', serviceId)
    .maybeSingle() as unknown as Promise<PostgrestSingleResponse<PublicService>>;
}

export async function listRelatedPublicServices(service: Pick<PublicService, 'id' | 'category_id'>) {
  const result = await supabase
    .from('public_services')
    .select('*')
    .eq('category_id', service.category_id)
    .neq('id', service.id)
    .order('is_featured', { ascending: false })
    .order('is_interest_featured', { ascending: false })
    .order('featured_priority', { ascending: false })
    .order('priority_results_enabled', { ascending: false })
    .order('profile_boost_enabled', { ascending: false })
    .order('interest_score', { ascending: false })
    .order('created_at', { ascending: false });
  return result as unknown as PostgrestSingleResponse<PublicService[]>;
}

export async function listExplorePublicServices(excludeId?: string) {
  let query = supabase
    .from('public_services')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('is_interest_featured', { ascending: false })
    .order('featured_priority', { ascending: false })
    .order('priority_results_enabled', { ascending: false })
    .order('profile_boost_enabled', { ascending: false })
    .order('interest_score', { ascending: false })
    .order('created_at', { ascending: false });
  if (excludeId) query = query.neq('id', excludeId);
  return query as unknown as PostgrestSingleResponse<PublicService[]>;
}

export function getServiceImages(serviceId: string) {
  return supabase
    .from('service_images')
    .select('*')
    .eq('service_id', serviceId)
    .order('sort_order') as unknown as Promise<PostgrestSingleResponse<ServiceImage[]>>;
}

export async function getServiceCoverImages(serviceIds: string[]) {
  const covers = new Map<string, { url: string; altText: string; galleryImages: Array<{ url: string; altText: string }> }>();
  if (serviceIds.length === 0) return { data: covers, error: null };

  const result = await supabase
    .from('service_images')
    .select('*')
    .in('service_id', serviceIds)
    .order('sort_order') as unknown as PostgrestSingleResponse<ServiceImage[]>;

  if (result.error) return { data: covers, error: result.error };

  const imageRows = result.data ?? [];
  if (imageRows.length === 0) return { data: covers, error: null };
  const signedResult = await supabase.storage.from('service-images').createSignedUrls(imageRows.map((image) => image.storage_path), 600);
  if (signedResult.error) return { data: covers, error: signedResult.error };
  const urlsByPath = new Map((signedResult.data ?? []).flatMap((item) => item.path && item.signedUrl ? [[item.path, item.signedUrl] as const] : []));

  const galleries = new Map<string, Array<{ image: ServiceImage; url: string; altText: string }>>();
  for (const image of imageRows) {
    const url = urlsByPath.get(image.storage_path);
    if (!url) continue;
    const gallery = galleries.get(image.service_id) ?? [];
    gallery.push({ image, url, altText: image.alt_text });
    galleries.set(image.service_id, gallery);
  }
  for (const [serviceId, gallery] of galleries) {
    const cover = gallery.find(({ image }) => image.is_cover) ?? gallery[0];
    covers.set(serviceId, {
      url: cover.url,
      altText: cover.altText,
      galleryImages: gallery.map(({ url, altText }) => ({ url, altText })),
    });
  }

  return { data: covers, error: null };
}

export function createService(input: NewServiceInput) {
  return supabase
    .from('services')
    .insert(input)
    .select()
    .single() as unknown as Promise<PostgrestSingleResponse<DatabaseService>>;
}

export function deleteService(serviceId: string) {
  return supabase.from('services').delete().eq('id', serviceId);
}

export async function listFavoriteServiceIds(userId: string) {
  const result = await supabase
    .from('service_favorites')
    .select('service_id')
    .eq('user_id', userId);

  return {
    data: new Set((result.data ?? []).map((favorite) => favorite.service_id as string)),
    error: result.error,
  };
}

export function setServiceFavorite(userId: string, serviceId: string, isFavorite: boolean) {
  if (isFavorite) {
    return supabase
      .from('service_favorites')
      .upsert({ user_id: userId, service_id: serviceId }, { onConflict: 'user_id,service_id' });
  }

  return supabase
    .from('service_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('service_id', serviceId);
}

export async function listFavoriteServices(userId: string) {
  const favoriteIds = await listFavoriteServiceIds(userId);
  if (favoriteIds.error) return { data: null, error: favoriteIds.error };

  const ids = [...favoriteIds.data];
  if (ids.length === 0) return { data: [] as PublicService[], error: null };

  return supabase
    .from('public_services')
    .select('*')
    .in('id', ids)
    .order('created_at', { ascending: false }) as unknown as Promise<PostgrestSingleResponse<PublicService[]>>;
}
