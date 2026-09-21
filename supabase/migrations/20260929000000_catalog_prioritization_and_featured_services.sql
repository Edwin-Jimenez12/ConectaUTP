-- Prioridad pública del catálogo y servicios destacados por promoción.

alter table public.services
  add column if not exists is_featured boolean not null default false,
  add column if not exists featured_until timestamptz,
  add column if not exists featured_priority integer not null default 0;

alter table public.services
  drop constraint if exists services_featured_priority_check;

alter table public.services
  add constraint services_featured_priority_check check (featured_priority >= 0);

alter table public.provider_promotions
  add column if not exists service_id uuid references public.services(id) on delete cascade;

create index if not exists provider_promotions_service_idx
  on public.provider_promotions(service_id, status, starts_at, ends_at);

create or replace function public.refresh_service_featured_state(target_service_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  active_until timestamptz;
begin
  select max(assignments.ends_at)
  into active_until
  from public.provider_promotions assignments
  join public.platform_promotions promotions on promotions.id = assignments.promotion_id
  where assignments.service_id = target_service_id
    and assignments.status = 'active'
    and assignments.starts_at <= now()
    and assignments.ends_at >= now()
    and promotions.is_active = true
    and promotions.benefit_key = 'featured_service';

  update public.services
  set is_featured = active_until is not null,
      featured_until = active_until,
      featured_priority = case when active_until is not null then 1 else 0 end
  where id = target_service_id;
end;
$$;

create or replace function public.sync_service_featured_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_service_featured_state(old.service_id);
    return old;
  end if;

  perform public.refresh_service_featured_state(new.service_id);
  if tg_op = 'UPDATE' and old.service_id is distinct from new.service_id then
    perform public.refresh_service_featured_state(old.service_id);
  end if;
  return new;
end;
$$;

drop trigger if exists sync_service_featured_state on public.provider_promotions;
create trigger sync_service_featured_state
after insert or update or delete on public.provider_promotions
for each row execute function public.sync_service_featured_state();

drop view if exists public.public_services;
create view public.public_services as
select
  services.id,
  services.owner_id,
  services.title,
  services.category_id,
  service_categories.name as category_name,
  services.modality,
  services.price,
  services.rating,
  services.review_count,
  services.created_at,
  services.is_featured and (services.featured_until is null or services.featured_until >= now()) as is_featured,
  case
    when services.is_featured and (services.featured_until is null or services.featured_until >= now()) then services.featured_priority
    else 0
  end as featured_priority,
  coalesce(plan_entitlements.priority_results, false) as priority_results_enabled,
  coalesce(plan_entitlements.profile_boost, false) as profile_boost_enabled,
  coalesce(plan_entitlements.contact_clients, true) as contact_clients_enabled,
  case
    when profiles.identity_preference = 'username' and profiles.username is not null then '@' || profiles.username
    else trim(concat_ws(' ', profiles.first_name, profiles.last_name))
  end as provider_name,
  profiles.username as provider_username,
  profiles.avatar_url as provider_avatar_url,
  services.description
from public.services
join public.service_categories on service_categories.id = services.category_id
join public.profiles on profiles.id = services.owner_id
left join lateral (
  select
    coalesce((plans.entitlements ->> 'priority_results')::boolean, false) as priority_results,
    coalesce((plans.entitlements ->> 'profile_boost')::boolean, false) as profile_boost,
    coalesce((plans.entitlements ->> 'contact_clients')::boolean, true) as contact_clients
  from public.provider_subscriptions subscriptions
  join public.platform_plans plans on plans.id = subscriptions.plan_id
  where subscriptions.provider_id = services.owner_id
    and subscriptions.status = 'active'
    and subscriptions.current_period_end > now()
  order by subscriptions.current_period_end desc
  limit 1
) as plan_entitlements on true
where services.status = 'published' and profiles.profile_visible = true;

grant select on public.public_services to anon, authenticated;
