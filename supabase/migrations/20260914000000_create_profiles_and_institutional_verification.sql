-- Perfil público y verificación opcional del correo institucional.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  first_name text,
  last_name text,
  bio text,
  avatar_url text,
  career text,
  faculty text,
  regional_center text,
  province_id uuid,
  district_id uuid,
  identity_preference text not null default 'name'
    check (identity_preference in ('name', 'username')),
  institutional_email text,
  institutional_email_status text not null default 'not_added'
    check (institutional_email_status in ('not_added', 'pending', 'verified', 'rejected')),
  institutional_verified_at timestamptz,
  show_location boolean not null default false,
  profile_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username is null or username ~ '^[a-z0-9_]{3,30}$'
  )
);

create unique index profiles_username_unique
  on public.profiles (lower(username)) where username is not null;

create unique index profiles_institutional_email_unique
  on public.profiles (lower(institutional_email))
  where institutional_email is not null;

create table public.institutional_email_verifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  institutional_email text not null,
  token_hash text not null,
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.institutional_email_verifications enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated using (auth.uid() = id);

create policy "Users can create their own profile"
  on public.profiles for insert
  to authenticated with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated using (auth.uid() = id) with check (auth.uid() = id);

revoke all on public.institutional_email_verifications from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

create view public.public_profiles as
select
  id,
  username,
  first_name,
  last_name,
  bio,
  avatar_url,
  career,
  faculty,
  regional_center,
  province_id,
  district_id,
  identity_preference,
  institutional_email_status,
  show_location
from public.profiles
where profile_visible = true;

grant select on public.public_profiles to anon, authenticated;

create or replace function public.set_profile_updated_at()
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

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_profile_updated_at();

create or replace function public.reset_institutional_verification()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.institutional_email is distinct from old.institutional_email then
    new.institutional_email_status = case
      when new.institutional_email is null then 'not_added'
      else 'pending'
    end;
    new.institutional_verified_at = null;
  elsif new.institutional_email_status is distinct from old.institutional_email_status
    and coalesce(auth.role(), '') <> 'service_role' then
    new.institutional_email_status = old.institutional_email_status;
    new.institutional_verified_at = old.institutional_verified_at;
  end if;
  return new;
end;
$$;

create trigger protect_institutional_verification
before update on public.profiles
for each row execute function public.reset_institutional_verification();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_profile();
