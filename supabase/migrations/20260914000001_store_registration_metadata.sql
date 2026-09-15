-- Guarda los datos básicos enviados durante el registro.

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'first_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
