-- Reglas funcionales para planes y beneficios temporales de promociones.

alter table public.platform_plans
add column if not exists entitlements jsonb not null default '{}'::jsonb
check (jsonb_typeof(entitlements) = 'object');

update public.platform_plans
set entitlements = case slug
  when 'gratis' then '{"max_published_services":3,"public_profile":true,"contact_clients":true,"monthly_featured_services":0,"featured_duration_days":0,"priority_results":false,"profile_boost":false}'::jsonb
  when 'estudiante' then '{"max_published_services":6,"public_profile":true,"contact_clients":true,"monthly_featured_services":1,"featured_duration_days":3,"priority_results":false,"profile_boost":true}'::jsonb
  when 'crecimiento' then '{"max_published_services":12,"public_profile":true,"contact_clients":true,"monthly_featured_services":2,"featured_duration_days":7,"priority_results":true,"profile_boost":true}'::jsonb
  when 'profesional' then '{"max_published_services":25,"public_profile":true,"contact_clients":true,"monthly_featured_services":4,"featured_duration_days":7,"priority_results":true,"profile_boost":true}'::jsonb
  else entitlements
end;

alter table public.platform_promotions
add column if not exists benefit_key text not null default 'featured_service'
check (benefit_key in ('featured_service', 'max_published_services'));

alter table public.platform_promotions
add column if not exists benefit_operation text not null default 'add'
check (benefit_operation in ('add', 'override'));

alter table public.platform_promotions
add column if not exists benefit_value integer not null default 1
check (benefit_value > 0);

update public.platform_promotions
set benefit_key = 'featured_service', benefit_operation = 'add', benefit_value = 1
where benefit_key is null;

create table if not exists public.provider_promotions (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references auth.users(id) on delete cascade,
  promotion_id uuid not null references public.platform_promotions(id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'expired', 'canceled')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint provider_promotions_valid_dates check (ends_at > starts_at)
);

create index if not exists provider_promotions_active_idx
  on public.provider_promotions(provider_id, status, starts_at, ends_at);

alter table public.provider_promotions enable row level security;

drop policy if exists "Providers can read their promotions" on public.provider_promotions;
create policy "Providers can read their promotions"
  on public.provider_promotions for select
  to authenticated using (provider_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage provider promotions" on public.provider_promotions;
create policy "Admins can manage provider promotions"
  on public.provider_promotions for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.provider_promotions to authenticated;
grant insert, update, delete on public.provider_promotions to authenticated;

create or replace function public.get_effective_plan_entitlements()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
  base_limit integer;
  bonus_limit integer;
  override_limit integer;
begin
  if auth.uid() is null then
    raise exception 'Autenticación requerida';
  end if;

  select plans.entitlements
  into result
  from public.provider_subscriptions subscriptions
  join public.platform_plans plans on plans.id = subscriptions.plan_id
  where subscriptions.provider_id = auth.uid()
    and subscriptions.status = 'active'
    and subscriptions.current_period_end > now()
  order by subscriptions.current_period_end desc
  limit 1;

  if result is null then
    select entitlements into result
    from public.platform_plans
    where slug = 'gratis' and is_active = true
    limit 1;
  end if;

  result := coalesce(result, '{}'::jsonb);
  base_limit := coalesce((result ->> 'max_published_services')::integer, 0);

  select coalesce(sum(
    case
      when promotions.benefit_key = 'max_published_services'
        and promotions.benefit_operation = 'add'
      then promotions.benefit_value
      else 0
    end
  ), 0), max(
    case
      when promotions.benefit_key = 'max_published_services'
        and promotions.benefit_operation = 'override'
      then promotions.benefit_value
      else null
    end
  )
  into bonus_limit, override_limit
  from public.provider_promotions assignments
  join public.platform_promotions promotions on promotions.id = assignments.promotion_id
  where assignments.provider_id = auth.uid()
    and assignments.status = 'active'
    and assignments.starts_at <= now()
    and assignments.ends_at >= now()
    and promotions.is_active = true;

  if override_limit is not null then
    base_limit := override_limit;
  end if;

  return jsonb_set(result, '{max_published_services}', to_jsonb(base_limit + bonus_limit), true);
end;
$$;

grant execute on function public.get_effective_plan_entitlements() to authenticated;

create or replace function public.enforce_service_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  limit_value integer;
  published_count integer;
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.status <> 'published' then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status = 'published' then
    return new;
  end if;

  limit_value := coalesce((public.get_effective_plan_entitlements() ->> 'max_published_services')::integer, 0);
  select count(*) into published_count
  from public.services
  where owner_id = new.owner_id and status = 'published';

  if published_count >= limit_value then
    raise exception 'Límite de publicaciones alcanzado. Tu plan permite % servicios publicados.', limit_value
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_service_plan_limit on public.services;
create trigger enforce_service_plan_limit
before insert or update of status, owner_id on public.services
for each row execute function public.enforce_service_plan_limit();
