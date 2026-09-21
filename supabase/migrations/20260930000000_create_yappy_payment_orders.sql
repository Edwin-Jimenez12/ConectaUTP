-- Órdenes de pago de Yappy. Solo los pagos ejecutados llegan a provider_payments.

create table if not exists public.provider_payment_orders (
  id uuid primary key default gen_random_uuid(),
  order_id text not null unique check (char_length(order_id) between 1 and 15),
  provider_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.platform_plans(id) on delete set null,
  promotion_id uuid references public.platform_promotions(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  amount numeric(10, 2) not null check (amount > 0),
  concept text not null,
  status text not null default 'created' check (status in ('created', 'executed', 'rejected', 'canceled', 'expired')),
  transaction_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists provider_payment_orders_provider_idx
  on public.provider_payment_orders(provider_id, created_at desc);

alter table public.provider_promotions
  add column if not exists payment_order_id uuid references public.provider_payment_orders(id) on delete set null;

create unique index if not exists provider_promotions_payment_order_idx
  on public.provider_promotions(payment_order_id)
  where payment_order_id is not null;

alter table public.provider_payment_orders enable row level security;

drop policy if exists "Providers can read their payment orders" on public.provider_payment_orders;
create policy "Providers can read their payment orders"
  on public.provider_payment_orders for select
  to authenticated using (provider_id = auth.uid() or public.is_admin());

grant select on public.provider_payment_orders to authenticated;

create trigger provider_payment_orders_updated_at
before update on public.provider_payment_orders
for each row execute function public.set_admin_resource_updated_at();
