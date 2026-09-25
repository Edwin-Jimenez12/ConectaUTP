-- Evita choques entre variables PL/pgSQL y columnas con nombres iguales.

create or replace function public.get_plan_featured_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_subscription_id uuid;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_monthly_limit integer := 0;
  v_duration_days integer := 0;
  v_used_count integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Autenticacion requerida';
  end if;

  select subscriptions.id,
    subscriptions.current_period_start,
    subscriptions.current_period_end,
    coalesce((plans.entitlements ->> 'monthly_featured_services')::integer, 0),
    coalesce((plans.entitlements ->> 'featured_duration_days')::integer, 0)
  into v_subscription_id, v_period_start, v_period_end, v_monthly_limit, v_duration_days
  from public.provider_subscriptions as subscriptions
  join public.platform_plans as plans on plans.id = subscriptions.plan_id
  where subscriptions.provider_id = auth.uid()
    and subscriptions.status = 'active'
    and subscriptions.current_period_end > now()
  order by subscriptions.current_period_end desc
  limit 1;

  if v_subscription_id is null then
    return jsonb_build_object('monthly_limit', 0, 'used_count', 0, 'remaining_count', 0, 'duration_days', 0);
  end if;

  select count(*)::integer into v_used_count
  from public.provider_plan_featured_services as assignments
  where assignments.provider_id = auth.uid()
    and assignments.subscription_id = v_subscription_id
    and assignments.period_start = v_period_start
    and assignments.status <> 'canceled';

  return jsonb_build_object(
    'monthly_limit', v_monthly_limit,
    'used_count', v_used_count,
    'remaining_count', greatest(v_monthly_limit - v_used_count, 0),
    'duration_days', v_duration_days,
    'period_end', v_period_end
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
  v_subscription_id uuid;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_monthly_limit integer := 0;
  v_duration_days integer := 0;
  v_used_count integer := 0;
  v_assignment_id uuid;
  v_assignment_ends_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Autenticacion requerida';
  end if;

  if not exists (
    select 1 from public.services as services
    where services.id = target_service_id
      and services.owner_id = auth.uid()
      and services.status = 'published'
  ) then
    raise exception 'Solo puedes destacar una publicacion publicada propia.';
  end if;

  select subscriptions.id,
    subscriptions.current_period_start,
    subscriptions.current_period_end,
    coalesce((plans.entitlements ->> 'monthly_featured_services')::integer, 0),
    coalesce((plans.entitlements ->> 'featured_duration_days')::integer, 0)
  into v_subscription_id, v_period_start, v_period_end, v_monthly_limit, v_duration_days
  from public.provider_subscriptions as subscriptions
  join public.platform_plans as plans on plans.id = subscriptions.plan_id
  where subscriptions.provider_id = auth.uid()
    and subscriptions.status = 'active'
    and subscriptions.current_period_end > now()
  order by subscriptions.current_period_end desc
  limit 1;

  if v_subscription_id is null or v_monthly_limit <= 0 or v_duration_days <= 0 then
    raise exception 'Tu plan no incluye publicaciones destacadas.';
  end if;

  if exists (
    select 1 from public.provider_plan_featured_services as assignments
    where assignments.provider_id = auth.uid()
      and assignments.service_id = target_service_id
      and assignments.period_start = v_period_start
      and assignments.status <> 'canceled'
  ) then
    raise exception 'Esta publicacion ya uso una destacada de este periodo.';
  end if;

  select count(*)::integer into v_used_count
  from public.provider_plan_featured_services as assignments
  where assignments.provider_id = auth.uid()
    and assignments.subscription_id = v_subscription_id
    and assignments.period_start = v_period_start
    and assignments.status <> 'canceled';

  if v_used_count >= v_monthly_limit then
    raise exception 'Ya usaste todas las destacadas incluidas en tu plan este periodo.';
  end if;

  v_assignment_ends_at := least(now() + make_interval(days => v_duration_days), v_period_end);

  insert into public.provider_plan_featured_services(
    provider_id, service_id, subscription_id, period_start, period_end, starts_at, ends_at
  )
  values (
    auth.uid(), target_service_id, v_subscription_id, v_period_start, v_period_end, now(), v_assignment_ends_at
  )
  returning id into v_assignment_id;

  perform public.refresh_service_featured_state(target_service_id);

  return jsonb_build_object(
    'id', v_assignment_id,
    'service_id', target_service_id,
    'ends_at', v_assignment_ends_at,
    'monthly_limit', v_monthly_limit,
    'used_count', v_used_count + 1,
    'remaining_count', greatest(v_monthly_limit - v_used_count - 1, 0)
  );
end;
$$;

grant execute on function public.activate_plan_featured_service(uuid) to authenticated;
