-- Catálogo y publicaciones de servicios.

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.service_categories (name, slug)
values
  ('Diseño', 'diseno'),
  ('Desarrollo web', 'desarrollo-web'),
  ('Tutorías', 'tutorias'),
  ('Fotografía', 'fotografia'),
  ('Marketing', 'marketing')
on conflict (slug) do nothing;

create table public.services (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.service_categories(id),
  title text not null check (char_length(title) between 3 and 100),
  description text not null check (char_length(description) between 20 and 3000),
  modality text not null default 'both' check (modality in ('online', 'in_person', 'both')),
  price numeric(10, 2) check (price is null or price >= 0),
  status text not null default 'draft' check (status in ('draft', 'published')),
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_images (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null check (char_length(alt_text) between 3 and 150),
  sort_order smallint not null default 0 check (sort_order >= 0),
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.service_messages (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create index services_owner_id_idx on public.services(owner_id);
create index services_category_id_idx on public.services(category_id);
create index services_status_idx on public.services(status);
create index service_images_service_id_idx on public.service_images(service_id);
create index service_messages_service_id_idx on public.service_messages(service_id);

alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_images enable row level security;
alter table public.service_messages enable row level security;

create policy "Anyone can read active categories"
  on public.service_categories for select
  to anon, authenticated using (is_active = true);

create policy "Authenticated users can read published services"
  on public.services for select
  to authenticated using (status = 'published' or auth.uid() = owner_id);

create policy "Owners can create services"
  on public.services for insert
  to authenticated with check (auth.uid() = owner_id);

create policy "Owners can update services"
  on public.services for update
  to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Owners can delete services"
  on public.services for delete
  to authenticated using (auth.uid() = owner_id);

create policy "Authenticated users can read published service images"
  on public.service_images for select
  to authenticated using (
    exists (
      select 1 from public.services
      where services.id = service_images.service_id
        and (services.status = 'published' or services.owner_id = auth.uid())
    )
  );

create policy "Owners can manage service images"
  on public.service_images for all
  to authenticated using (
    exists (select 1 from public.services where services.id = service_images.service_id and services.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.services where services.id = service_images.service_id and services.owner_id = auth.uid())
  );

create policy "Users can send service messages"
  on public.service_messages for insert
  to authenticated with check (
    auth.uid() = sender_id
    and exists (select 1 from public.services where services.id = service_messages.service_id and services.status = 'published' and services.owner_id <> auth.uid())
  );

create policy "Participants can read service messages"
  on public.service_messages for select
  to authenticated using (
    auth.uid() = sender_id
    or exists (select 1 from public.services where services.id = service_messages.service_id and services.owner_id = auth.uid())
  );

create policy "Owners can update message status"
  on public.service_messages for update
  to authenticated using (
    exists (select 1 from public.services where services.id = service_messages.service_id and services.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.services where services.id = service_messages.service_id and services.owner_id = auth.uid())
  );

create or replace function public.set_service_updated_at()
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

create trigger services_updated_at
before update on public.services
for each row execute function public.set_service_updated_at();

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
  case
    when profiles.identity_preference = 'username' and profiles.username is not null then '@' || profiles.username
    else trim(concat_ws(' ', profiles.first_name, profiles.last_name))
  end as provider_name,
  profiles.username as provider_username,
  profiles.institutional_email_status
from public.services
join public.service_categories on service_categories.id = services.category_id
join public.profiles on profiles.id = services.owner_id
where services.status = 'published' and profiles.profile_visible = true;

grant select on public.service_categories to anon, authenticated;
grant select on public.public_services to anon, authenticated;
grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.service_images to authenticated;
grant select, insert, update on public.service_messages to authenticated;

insert into storage.buckets (id, name, public)
values ('service-images', 'service-images', false)
on conflict (id) do nothing;

create policy "Owners can upload service images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'service-images'
    and exists (
      select 1 from public.services
      where services.id = (storage.foldername(name))[1]::uuid
        and services.owner_id = auth.uid()
    )
  );

create policy "Users can view published service images"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'service-images'
    and exists (
      select 1 from public.services
      where services.id = (storage.foldername(name))[1]::uuid
        and (services.status = 'published' or services.owner_id = auth.uid())
    )
  );

create policy "Owners can update service images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'service-images'
    and exists (select 1 from public.services where services.id = (storage.foldername(name))[1]::uuid and services.owner_id = auth.uid())
  );

create policy "Owners can delete service images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'service-images'
    and exists (select 1 from public.services where services.id = (storage.foldername(name))[1]::uuid and services.owner_id = auth.uid())
  );
