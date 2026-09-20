-- Registra la versión legal aceptada al crear una cuenta.

alter table public.profiles
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text,
  add column if not exists privacy_policy_version text;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    username,
    terms_accepted_at,
    terms_version,
    privacy_policy_version
  )
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', ''),
    nullif(new.raw_user_meta_data ->> 'username', ''),
    nullif(new.raw_user_meta_data ->> 'terms_accepted_at', '')::timestamptz,
    nullif(new.raw_user_meta_data ->> 'terms_version', ''),
    nullif(new.raw_user_meta_data ->> 'privacy_policy_version', '')
  )
  on conflict (id) do update set
    first_name = coalesce(public.profiles.first_name, excluded.first_name),
    last_name = coalesce(public.profiles.last_name, excluded.last_name),
    username = coalesce(public.profiles.username, excluded.username),
    terms_accepted_at = coalesce(public.profiles.terms_accepted_at, excluded.terms_accepted_at),
    terms_version = coalesce(public.profiles.terms_version, excluded.terms_version),
    privacy_policy_version = coalesce(public.profiles.privacy_policy_version, excluded.privacy_policy_version);
  return new;
end;
$$;
