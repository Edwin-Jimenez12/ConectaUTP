-- Permite usernames como nombre.apellido.

alter table public.profiles
  drop constraint if exists profiles_username_format;

alter table public.profiles
  add constraint profiles_username_format check (
    username is null or username ~ '^[a-z0-9._]{3,30}$'
  );
