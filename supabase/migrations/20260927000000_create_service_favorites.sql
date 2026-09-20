-- Permite que cada usuario guarde publicaciones para consultarlas después.

create table public.service_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, service_id)
);

create index service_favorites_user_created_idx
  on public.service_favorites (user_id, created_at desc);

alter table public.service_favorites enable row level security;

create policy "Users can read own service favorites"
  on public.service_favorites for select
  to authenticated using (auth.uid() = user_id);

create policy "Users can create own service favorites"
  on public.service_favorites for insert
  to authenticated with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.services
      where services.id = service_favorites.service_id
        and services.status = 'published'
    )
  );

create policy "Users can update own service favorites"
  on public.service_favorites for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own service favorites"
  on public.service_favorites for delete
  to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.service_favorites to authenticated;
