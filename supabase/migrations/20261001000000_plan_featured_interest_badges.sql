-- Destacadas incluidas en el plan, senales de interes y ranking publico.

create table if not exists public.provider_plan_featured_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  subscription_id uuid not null references public.provider_subscriptions(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'expired', 'canceled')),
  created_at timestamptz not null default now(),
  constraint provider_plan_featured_valid_dates check (ends_at > starts_at),
  unique (provider_id, service_id, period_start)
);

create index if not exists provider_plan_featured_period_idx
  on public.provider_plan_featured_services(provider_id, status, period_start, period_end);

create index if not exists provider_plan_featured_service_idx
  on public.provider_plan_featured_services(service_id, status, starts_at, ends_at);

alter table public.provider_plan_featured_services enable row level security;

drop policy if exists "Providers can read their plan featured services" on public.provider_plan_featured_services;
create policy "Providers can read their plan featured services"
  on public.provider_plan_featured_services for select
  to authenticated using (provider_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage plan featured services" on public.provider_plan_featured_services;
create policy "Admins can manage plan featured services"
  on public.provider_plan_featured_services for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.provider_plan_featured_services to authenticated;

create table if not exists public.service_views (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  viewer_key text not null check (char_length(viewer_key) between 1 and 128),
  viewer_id uuid references auth.users(id) on delete set null,
  viewed_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (service_id, viewer_key, viewed_on)
);

create index if not exists service_views_service_created_idx
  on public.service_views(service_id, created_at desc);

alter table public.service_views enable row level security;

create or replace function public.record_service_view(target_service_id uuid, visitor_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  safe_key text;
begin
  safe_key := left(coalesce(nullif(trim(visitor_key), ''), gen_random_uuid()::text), 128);

  if not exists (
    select 1 from public.services
    where id = target_service_id and status = 'published'
  ) then
    return;
  end if;

  if exists (
    select 1 from public.services
    where id = target_service_id and owner_id = auth.uid()
  ) then
    return;
  end if;

  insert into public.service_views(service_id, viewer_key, viewer_id)
  values (target_service_id, safe_key, auth.uid())
  on conflict (service_id, viewer_key, viewed_on) do nothing;
end;
$$;

grant execute on function public.record_service_view(uuid, text) to anon, authenticated;

create or replace function public.get_plan_featured_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  subscription_id uuid;
  period_start timestamptz;
  period_end timestamptz;
  monthly_limit integer := 0;
  duration_days integer := 0;
  used_count integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Autenticacion requerida';
  end if;

  select subscriptions.id,
    subscriptions.current_period_start,
    subscriptions.current_period_end,
    coalesce((plans.entitlements ->> 'monthly_featured_services')::integer, 0),
    coalesce((plans.entitlements ->> 'featured_duration_days')::integer, 0)
  into subscription_id, period_start, period_end, monthly_limit, duration_days
  from public.provider_subscriptions subscriptions
  join public.platform_plans plans on plans.id = subscriptions.plan_id
  where subscriptions.provider_id = auth.uid()
    and subscriptions.status = 'active'
    and subscriptions.current_period_end > now()
  order by subscriptions.current_period_end desc
  limit 1;

  if subscription_id is null then
    return jsonb_build_object('monthly_limit', 0, 'used_count', 0, 'remaining_count', 0, 'duration_days', 0);
  end if;

  select count(*)::integer into used_count
  from public.provider_plan_featured_services assignments
  where assignments.provider_id = auth.uid()
    and assignments.subscription_id = subscription_id
    and assignments.period_start = period_start
    and assignments.status <> 'canceled';

  return jsonb_build_object(
    'monthly_limit', monthly_limit,
    'used_count', used_count,
    'remaining_count', greatest(monthly_limit - used_count, 0),
    'duration_days', duration_days,
    'period_end', period_end
  );
end;
$$;

grant execute on function public.get_plan_featured_status() to authenticated;

create or replace function public.activate_plan_featured_service(target_service_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  subscription_id uuid;
  period_start timestamptz;
  period_end timestamptz;
  monthly_limit integer := 0;
  duration_days integer := 0;
  used_count integer := 0;
  assignment_id uuid;
  assignment_ends_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Autenticacion requerida';
  end if;

  if not exists (
    select 1 from public.services
    where id = target_service_id and owner_id = auth.uid() and status = 'published'
  ) then
    raise exception 'Solo puedes destacar una publicacion publicada propia.';
  end if;

  select subscriptions.id,
    subscriptions.current_period_start,
    subscriptions.current_period_end,
    coalesce((plans.entitlements ->> 'monthly_featured_services')::integer, 0),
    coalesce((plans.entitlements ->> 'featured_duration_days')::integer, 0)
  into subscription_id, period_start, period_end, monthly_limit, duration_days
  from public.provider_subscriptions subscriptions
  join public.platform_plans plans on plans.id = subscriptions.plan_id
  where subscriptions.provider_id = auth.uid()
    and subscriptions.status = 'active'
    and subscriptions.current_period_end > now()
  order by subscriptions.current_period_end desc
  limit 1;

  if subscription_id is null or monthly_limit <= 0 or duration_days <= 0 then
    raise exception 'Tu plan no incluye publicaciones destacadas.';
  end if;

  if exists (
    select 1 from public.provider_plan_featured_services assignments
    where assignments.provider_id = auth.uid()
      and assignments.service_id = target_service_id
      and assignments.period_start = period_start
      and assignments.status <> 'canceled'
  ) then
    raise exception 'Esta publicacion ya uso una destacada de este periodo.';
  end if;

  select count(*)::integer into used_count
  from public.provider_plan_featured_services assignments
  where assignments.provider_id = auth.uid()
    and assignments.subscription_id = subscription_id
    and assignments.period_start = period_start
    and assignments.status <> 'canceled';

  if used_count >= monthly_limit then
    raise exception 'Ya usaste todas las destacadas incluidas en tu plan este periodo.';
  end if;

  assignment_ends_at := least(now() + make_interval(days => duration_days), period_end);

  insert into public.provider_plan_featured_services(
    provider_id, service_id, subscription_id, period_start, period_end, starts_at, ends_at
  )
  values (
    auth.uid(), target_service_id, subscription_id, period_start, period_end, now(), assignment_ends_at
  )
  returning id into assignment_id;

  perform public.refresh_service_featured_state(target_service_id);

  return jsonb_build_object(
    'id', assignment_id,
    'service_id', target_service_id,
    'ends_at', assignment_ends_at,
    'monthly_limit', monthly_limit,
    'used_count', used_count + 1,
    'remaining_count', greatest(monthly_limit - used_count - 1, 0)
  );
end;
$$;

grant execute on function public.activate_plan_featured_service(uuid) to authenticated;

create or replace function public.refresh_service_featured_state(target_service_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  active_until timestamptz;
begin
  select max(active_assignments.ends_at)
  into active_until
  from (
    select assignments.ends_at
    from public.provider_promotions assignments
    join public.platform_promotions promotions on promotions.id = assignments.promotion_id
    where assignments.service_id = target_service_id
      and assignments.status = 'active'
      and assignments.starts_at <= now()
      and assignments.ends_at >= now()
      and promotions.is_active = true
      and promotions.benefit_key = 'featured_service'
    union all
    select assignments.ends_at
    from public.provider_plan_featured_services assignments
    join public.provider_subscriptions subscriptions on subscriptions.id = assignments.subscription_id
    where assignments.service_id = target_service_id
      and assignments.status = 'active'
      and assignments.starts_at <= now()
      and assignments.ends_at >= now()
      and subscriptions.status = 'active'
      and subscriptions.current_period_end > now()
  ) active_assignments;

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

drop trigger if exists sync_plan_featured_state on public.provider_plan_featured_services;
create trigger sync_plan_featured_state
after insert or update or delete on public.provider_plan_featured_services
for each row execute function public.sync_service_featured_state();

drop view if exists public.public_services;
create view public.public_services as
with service_metrics as (
  select
    services.id,
    services.created_at,
    (
      coalesce((select count(*) from public.service_views where service_views.service_id = services.id and service_views.created_at >= now() - interval '30 days'), 0)
      + coalesce((select count(*) from public.service_favorites where service_favorites.service_id = services.id and service_favorites.user_id <> services.owner_id and service_favorites.created_at >= now() - interval '30 days'), 0) * 3
      + coalesce((select count(*) from public.service_messages where service_messages.service_id = services.id and service_messages.sender_id <> services.owner_id and service_messages.created_at >= now() - interval '30 days'), 0) * 8
    )::integer as interest_score
  from public.services
  where services.status = 'published'
), ranked_interest as (
  select
    service_metrics.id,
    service_metrics.interest_score,
    row_number() over (order by service_metrics.interest_score desc, service_metrics.created_at desc, service_metrics.id) as interest_rank
  from service_metrics
), badge_states as (
  select
    services.id,
    exists (
      select 1
      from public.provider_promotions assignments
      join public.platform_promotions promotions on promotions.id = assignments.promotion_id
      where assignments.service_id = services.id
        and assignments.status = 'active'
        and assignments.starts_at <= now()
        and assignments.ends_at >= now()
        and promotions.is_active = true
        and promotions.benefit_key = 'featured_service'
    ) as is_promoted,
    exists (
      select 1
      from public.provider_plan_featured_services assignments
      join public.provider_subscriptions subscriptions on subscriptions.id = assignments.subscription_id
      where assignments.service_id = services.id
        and assignments.status = 'active'
        and assignments.starts_at <= now()
        and assignments.ends_at >= now()
        and subscriptions.status = 'active'
        and subscriptions.current_period_end > now()
    ) as is_plan_featured
  from public.services
)
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
  coalesce(badge_states.is_promoted, false) or coalesce(badge_states.is_plan_featured, false) as is_featured,
  coalesce(badge_states.is_plan_featured, false) as is_plan_featured,
  coalesce(badge_states.is_promoted, false) as is_promoted,
  coalesce(ranked_interest.interest_score, 0) as interest_score,
  coalesce(ranked_interest.interest_score >= 10 and ranked_interest.interest_rank <= 10, false) as is_interest_featured,
  case
    when coalesce(badge_states.is_plan_featured, false) then 2
    when coalesce(badge_states.is_promoted, false) then 1
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
left join ranked_interest on ranked_interest.id = services.id
left join badge_states on badge_states.id = services.id
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

do $$
declare
  service_row record;
begin
  for service_row in select id from public.services loop
    perform public.refresh_service_featured_state(service_row.id);
  end loop;
end;
$$;
