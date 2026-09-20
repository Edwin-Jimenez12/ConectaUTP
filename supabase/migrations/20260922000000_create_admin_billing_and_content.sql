-- Roles administrativas, contenido gestionable y datos de facturacion interna.

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
      and admin_users.role = 'admin'
  );
$$;

revoke all on public.admin_users from anon;
grant select on public.admin_users to authenticated;

create policy "Admins can read their own membership"
  on public.admin_users for select
  to authenticated using (auth.uid() = user_id);

do $$
declare
  admin_id uuid;
begin
  select id into admin_id
  from auth.users
  where lower(email) = 'conectautp2@gmail.com'
  limit 1;

  if admin_id is not null then
    insert into public.admin_users (user_id)
    values (admin_id)
    on conflict (user_id) do update set role = 'admin';
  end if;
end;
$$;

create policy "Admins can read profiles"
  on public.profiles for select
  to authenticated using (public.is_admin());

create or replace function public.set_admin_resource_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.platform_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  billing_period text not null check (billing_period in ('free', 'monthly', 'quarterly', 'yearly')),
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  is_active boolean not null default true,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.platform_promotions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  target_plan_id uuid references public.platform_plans(id) on delete set null,
  duration_days integer not null check (duration_days > 0),
  price numeric(10, 2) not null check (price >= 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint platform_promotions_valid_dates check (ends_at > starts_at)
);

create table public.platform_updates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (char_length(title) between 3 and 160),
  summary text not null check (char_length(summary) between 10 and 500),
  content text,
  category text not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'archived')),
  published_at timestamptz,
  read_time_minutes smallint not null default 2 check (read_time_minutes > 0),
  created_by uuid references public.admin_users(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.provider_payments (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references auth.users(id) on delete restrict,
  plan_id uuid references public.platform_plans(id) on delete set null,
  promotion_id uuid references public.platform_promotions(id) on delete set null,
  concept text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  status text not null default 'confirmed' check (status = 'confirmed'),
  payment_method text not null default 'yappy',
  external_reference text unique,
  paid_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.provider_subscriptions (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.platform_plans(id) on delete restrict,
  status text not null default 'active' check (status in ('active', 'canceled', 'expired')),
  billing_period text not null check (billing_period in ('monthly', 'quarterly', 'yearly')),
  started_at timestamptz not null default now(),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null,
  next_billing_at timestamptz,
  canceled_at timestamptz,
  external_reference text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint provider_subscriptions_valid_period check (current_period_end > current_period_start)
);

create index platform_promotions_dates_idx on public.platform_promotions(starts_at, ends_at);
create index platform_updates_status_idx on public.platform_updates(status, published_at);
create index provider_payments_paid_at_idx on public.provider_payments(paid_at);
create index provider_payments_provider_id_idx on public.provider_payments(provider_id);
create index provider_subscriptions_status_idx on public.provider_subscriptions(status, next_billing_at);
create index provider_subscriptions_provider_id_idx on public.provider_subscriptions(provider_id);

alter table public.platform_plans enable row level security;
alter table public.platform_promotions enable row level security;
alter table public.platform_updates enable row level security;
alter table public.provider_payments enable row level security;
alter table public.provider_subscriptions enable row level security;

create policy "Anyone can read active platform plans"
  on public.platform_plans for select
  to anon, authenticated using (is_active = true or public.is_admin());

create policy "Admins can manage platform plans"
  on public.platform_plans for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage platform promotions"
  on public.platform_promotions for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Anyone can read active platform promotions"
  on public.platform_promotions for select
  to anon, authenticated using (
    is_active = true
    and starts_at <= now()
    and ends_at >= now()
  );

create policy "Anyone can read published platform updates"
  on public.platform_updates for select
  to anon, authenticated using (
    (status = 'published' and (published_at is null or published_at <= now()))
    or public.is_admin()
  );

create policy "Admins can manage platform updates"
  on public.platform_updates for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage provider payments"
  on public.provider_payments for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Admins can manage provider subscriptions"
  on public.provider_subscriptions for all
  to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.platform_plans to anon, authenticated;
grant select, insert, update, delete on public.platform_plans to authenticated;
grant select, insert, update, delete on public.platform_promotions to authenticated;
grant select on public.platform_promotions to anon;
grant select on public.platform_updates to anon, authenticated;
grant select, insert, update, delete on public.platform_updates to authenticated;
grant select, insert, update, delete on public.provider_payments to authenticated;
grant select, insert, update, delete on public.provider_subscriptions to authenticated;

create trigger platform_plans_updated_at
before update on public.platform_plans
for each row execute function public.set_admin_resource_updated_at();

create trigger platform_promotions_updated_at
before update on public.platform_promotions
for each row execute function public.set_admin_resource_updated_at();

create trigger platform_updates_updated_at
before update on public.platform_updates
for each row execute function public.set_admin_resource_updated_at();

create trigger provider_subscriptions_updated_at
before update on public.provider_subscriptions
for each row execute function public.set_admin_resource_updated_at();

create or replace function public.get_admin_dashboard_metrics()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acceso administrativo requerido';
  end if;

  return jsonb_build_object(
    'registered_users', (select count(*) from public.profiles),
    'active_providers', (select count(distinct owner_id) from public.services where status = 'published'),
    'published_services', (select count(*) from public.services where status = 'published'),
    'monthly_revenue', coalesce((
      select sum(amount)
      from public.provider_payments
      where status = 'confirmed'
        and paid_at >= date_trunc('month', now())
    ), 0),
    'active_subscriptions', (select count(*) from public.provider_subscriptions where status = 'active')
  );
end;
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_admin_dashboard_metrics() to authenticated;

insert into public.platform_plans (slug, name, description, price, billing_period, features, display_order)
values
  ('gratis', 'Gratis', 'Empieza sin costo y prueba la plataforma.', 0, 'free', '["Hasta 3 servicios publicados", "Perfil público", "Contacto con clientes"]'::jsonb, 0),
  ('estudiante', 'Estudiante', 'Más espacio para ofrecer tus habilidades.', 1.99, 'monthly', '["Hasta 6 servicios publicados", "1 destacada de 3 días al mes", "Perfil con mayor visibilidad"]'::jsonb, 1),
  ('crecimiento', 'Crecimiento', 'Para quienes ya reciben solicitudes con frecuencia.', 3.99, 'monthly', '["Hasta 12 servicios publicados", "2 destacadas de 7 días al mes", "Prioridad en resultados"]'::jsonb, 2),
  ('profesional', 'Profesional', 'Más publicaciones y visibilidad para crecer.', 6.99, 'monthly', '["Hasta 25 servicios publicados", "4 destacadas de 7 días al mes", "Perfil destacado en el catálogo"]'::jsonb, 3)
on conflict (slug) do nothing;

insert into public.platform_promotions (slug, name, description, duration_days, price, starts_at, ends_at)
values
  ('impulso-basico', 'Impulso básico', 'Aumenta la visibilidad de un servicio.', 3, 0.99, '2026-10-01 00:00:00+00', '2026-10-04 00:00:00+00'),
  ('impulso-estandar', 'Impulso estándar', 'Promoción de lanzamiento para un servicio.', 7, 1.00, '2026-10-01 00:00:00+00', '2026-10-08 00:00:00+00'),
  ('impulso-mensual', 'Impulso mensual', 'Visibilidad promocionada durante 30 días.', 30, 3.99, '2026-10-01 00:00:00+00', '2026-10-31 00:00:00+00')
on conflict (slug) do nothing;

insert into public.platform_updates (slug, title, summary, category, status, published_at, read_time_minutes)
values
  ('chat-unificado', 'Chats más organizados', 'Ahora las solicitudes de servicio y las conversaciones directas comparten un solo chat.', 'Comunidad', 'published', '2026-09-20 00:00:00+00', 2),
  ('editor-imagenes', 'Nuevo editor de imágenes', 'Ajusta el encuadre, zoom y posición de las imágenes antes de publicar.', 'Producto', 'published', '2026-09-18 00:00:00+00', 3),
  ('pagos-planes-promociones', 'Pagos para planes y promociones', 'Estamos preparando una forma sencilla de pagar planes y promociones desde la plataforma.', 'Anuncios', 'scheduled', null, 2)
on conflict (slug) do nothing;
