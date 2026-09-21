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
    .order('featured_priority', { ascending: false })
    .order('priority_results_enabled', { ascending: false })
    .order('profile_boost_enabled', { ascending: false })
    .order('created_at', { ascending: false });
  return result as unknown as PostgrestSingleResponse<PublicService[]>;
}

export async function listExplorePublicServices(excludeId?: string) {
  let query = supabase
    .from('public_services')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('featured_priority', { ascending: false })
    .order('priority_results_enabled', { ascending: false })
    .order('profile_boost_enabled', { ascending: false })
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
  const covers = new Map<string, { url: string; altText: string }>();
  if (serviceIds.length === 0) return { data: covers, error: null };

  const result = await supabase
    .from('service_images')
    .select('*')
    .in('service_id', serviceIds)
    .order('sort_order') as unknown as PostgrestSingleResponse<ServiceImage[]>;

  if (result.error) return { data: covers, error: result.error };

  const firstImageByService = new Map<string, ServiceImage>();
  for (const image of result.data ?? []) {
    const current = firstImageByService.get(image.service_id);
    if (!current || image.is_cover) firstImageByService.set(image.service_id, image);
  }

  await Promise.all([...firstImageByService.values()].map(async (image) => {
    const { data, error } = await supabase.storage
      .from('service-images')
      .createSignedUrl(image.storage_path, 600);
    if (!error && data?.signedUrl) covers.set(image.service_id, { url: data.signedUrl, altText: image.alt_text });
  }));

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
