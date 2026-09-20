-- Permite seleccionar un único plan recomendado desde el panel administrativo.

alter table public.platform_plans
add column if not exists is_most_used boolean not null default false;

update public.platform_plans
set is_most_used = (slug = 'estudiante');

create unique index if not exists platform_plans_single_most_used_idx
  on public.platform_plans (is_most_used)
  where is_most_used = true;

create or replace function public.set_most_used_plan(target_plan_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Acceso administrativo requerido';
  end if;

  update public.platform_plans
  set is_most_used = false
  where is_most_used = true;

  update public.platform_plans
  set is_most_used = true
  where id = target_plan_id;

  if not found then
    raise exception 'Plan no encontrado';
  end if;
end;
$$;

grant execute on function public.set_most_used_plan(uuid) to authenticated;
