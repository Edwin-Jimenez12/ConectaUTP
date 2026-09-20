import { supabase } from './supabase';

export interface AdminMetrics {
  registered_users: number;
  active_providers: number;
  published_services: number;
  monthly_revenue: number;
  active_subscriptions: number;
}

export interface AdminProfileSummary {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
}

export interface PlanEntitlements {
  max_published_services: number;
  public_profile: boolean;
  contact_clients: boolean;
  monthly_featured_services: number;
  featured_duration_days: number;
  priority_results: boolean;
  profile_boost: boolean;
}

export const defaultPlanEntitlements: PlanEntitlements = {
  max_published_services: 3,
  public_profile: true,
  contact_clients: true,
  monthly_featured_services: 0,
  featured_duration_days: 0,
  priority_results: false,
  profile_boost: false,
};

export function normalizePlanEntitlements(value: Partial<PlanEntitlements> | null | undefined): PlanEntitlements {
  return { ...defaultPlanEntitlements, ...(value ?? {}) };
}

export function getPlanFeatureLabels(plan: { entitlements?: Partial<PlanEntitlements> | null; features?: string[] }) {
  const entitlements = normalizePlanEntitlements(plan.entitlements);
  const labels: string[] = [];
  if (entitlements.max_published_services > 0) labels.push(`Hasta ${entitlements.max_published_services} publicaciones`);
  if (entitlements.public_profile) labels.push('Perfil público');
  if (entitlements.contact_clients) labels.push('Contacto con clientes');
  if (entitlements.monthly_featured_services > 0) {
    const services = entitlements.monthly_featured_services === 1 ? '1 destacada' : `${entitlements.monthly_featured_services} destacadas`;
    labels.push(`${services} de ${entitlements.featured_duration_days} días al mes`);
  }
  if (entitlements.priority_results) labels.push('Prioridad en resultados');
  if (entitlements.profile_boost) labels.push('Perfil con mayor visibilidad');
  return labels.length > 0 ? labels : (plan.features ?? []);
}

function normalizePromotion(promotion: AdminPromotion): AdminPromotion {
  return {
    ...promotion,
    benefit_key: promotion.benefit_key ?? 'featured_service',
    benefit_operation: promotion.benefit_operation ?? 'add',
    benefit_value: Number(promotion.benefit_value ?? 1),
  };
}

export interface AdminPlan {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  billing_period: 'free' | 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  is_active: boolean;
  is_most_used: boolean;
  entitlements: PlanEntitlements;
  display_order: number;
}

export interface AdminPromotion {
  id: string;
  slug: string;
  name: string;
  description: string;
  duration_days: number;
  price: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  benefit_key: 'featured_service' | 'max_published_services';
  benefit_operation: 'add' | 'override';
  benefit_value: number;
}

export interface AdminUpdate {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string | null;
  category: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  published_at: string | null;
}

export interface AdminPayment {
  id: string;
  provider_id: string;
  plan_id: string | null;
  promotion_id: string | null;
  concept: string;
  amount: number;
  status: 'confirmed';
  payment_method: string;
  paid_at: string;
}

export interface AdminSubscription {
  id: string;
  provider_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired';
  billing_period: 'monthly' | 'quarterly' | 'yearly';
  current_period_end: string;
  next_billing_at: string | null;
}

export interface AdminData {
  metrics: AdminMetrics;
  profiles: AdminProfileSummary[];
  plans: AdminPlan[];
  promotions: AdminPromotion[];
  updates: AdminUpdate[];
  payments: AdminPayment[];
  subscriptions: AdminSubscription[];
}

async function listRows<T>(table: string, orderBy: string) {
  const { data, error } = await supabase.from(table).select('*').order(orderBy, { ascending: true });
  return { data: (data ?? []) as T[], error };
}

export async function loadAdminData(): Promise<AdminData> {
  const [metricsResult, profilesResult, plansResult, promotionsResult, updatesResult, paymentsResult, subscriptionsResult] = await Promise.all([
    supabase.rpc('get_admin_dashboard_metrics'),
    listRows<AdminProfileSummary>('profiles', 'created_at'),
    listRows<AdminPlan>('platform_plans', 'display_order'),
    listRows<AdminPromotion>('platform_promotions', 'starts_at'),
    listRows<AdminUpdate>('platform_updates', 'created_at'),
    listRows<AdminPayment>('provider_payments', 'paid_at'),
    listRows<AdminSubscription>('provider_subscriptions', 'next_billing_at'),
  ]);

  const error = metricsResult.error || profilesResult.error || plansResult.error || promotionsResult.error || updatesResult.error || paymentsResult.error || subscriptionsResult.error;
  if (error) throw error;

  return {
    metrics: (metricsResult.data ?? {}) as AdminMetrics,
    profiles: profilesResult.data,
    plans: plansResult.data.map((plan) => ({ ...plan, entitlements: normalizePlanEntitlements(plan.entitlements) })),
    promotions: promotionsResult.data.map(normalizePromotion),
    updates: updatesResult.data,
    payments: paymentsResult.data.filter((payment) => payment.status === 'confirmed'),
    subscriptions: subscriptionsResult.data,
  };
}

export async function listPublicPlans() {
  const { data, error } = await supabase
    .from('platform_plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  return { data: (data ?? []).map((plan) => ({ ...plan, entitlements: normalizePlanEntitlements(plan.entitlements) })) as AdminPlan[], error };
}

export async function listPublicPromotions() {
  const { data, error } = await supabase
    .from('platform_promotions')
    .select('*')
    .eq('is_active', true)
    .order('starts_at', { ascending: true });
  return { data: (data ?? []).map((promotion) => normalizePromotion(promotion as AdminPromotion)), error };
}

export async function listPublishedUpdates() {
  const { data, error } = await supabase
    .from('platform_updates')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return { data: (data ?? []) as AdminUpdate[], error };
}

export type AdminPlanInput = Omit<AdminPlan, 'id'>;
export type AdminPromotionInput = Omit<AdminPromotion, 'id'>;
export type AdminUpdateInput = Omit<AdminUpdate, 'id'>;

export async function saveAdminPlan(input: AdminPlanInput, id?: string) {
  const { is_most_used: markAsMostUsed, ...planInput } = input;
  let savedId = id;
  const query = id
    ? supabase.from('platform_plans').update({ ...planInput, is_most_used: false }).eq('id', id)
    : supabase.from('platform_plans').insert({ ...planInput, is_most_used: false }).select('id').single();
  const { data, error } = await query;
  if (error) throw error;
  savedId = savedId ?? data?.id;
  if (markAsMostUsed && savedId) await setAdminPlanMostUsed(savedId);
}

export async function setAdminPlanActive(id: string, isActive: boolean) {
  const { error } = await supabase.from('platform_plans').update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}

export async function setAdminPlanMostUsed(id: string) {
  const { error } = await supabase.rpc('set_most_used_plan', { target_plan_id: id });
  if (error) throw error;
}

export async function saveAdminPromotion(input: AdminPromotionInput, id?: string) {
  const query = id
    ? supabase.from('platform_promotions').update(input).eq('id', id)
    : supabase.from('platform_promotions').insert(input);
  const { error } = await query;
  if (error) throw error;
}

export async function setAdminPromotionActive(id: string, isActive: boolean) {
  const { error } = await supabase.from('platform_promotions').update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}

export async function saveAdminUpdate(input: AdminUpdateInput, id?: string) {
  const query = id
    ? supabase.from('platform_updates').update(input).eq('id', id)
    : supabase.from('platform_updates').insert(input);
  const { error } = await query;
  if (error) throw error;
}
