-- El estado de verificacion institucional ya no forma parte de la informacion publica.

drop policy if exists "Users can create chat conversations" on public.chat_conversations;

drop view if exists public.public_profiles;
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
  show_location
from public.profiles
where profile_visible = true;

grant select on public.public_profiles to anon, authenticated;

create policy "Users can create chat conversations"
  on public.chat_conversations for insert
  to authenticated with check (
    auth.uid() in (participant_one_id, participant_two_id)
    and participant_one_id < participant_two_id
    and exists (
      select 1 from public.profiles
      where profiles.id = participant_one_id and profiles.profile_visible = true
    )
    and exists (
      select 1 from public.profiles
      where profiles.id = participant_two_id and profiles.profile_visible = true
    )
    and (
      service_id is null
      or exists (
        select 1
        from public.services
        where services.id = chat_conversations.service_id
          and services.status = 'published'
          and services.owner_id in (participant_one_id, participant_two_id)
          and services.owner_id <> auth.uid()
      )
    )
  );

drop view if exists public.public_services;
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
  services.created_at,
  profiles.avatar_url as provider_avatar_url,
  services.description
from public.services
join public.service_categories on service_categories.id = services.category_id
join public.profiles on profiles.id = services.owner_id
where services.status = 'published' and profiles.profile_visible = true;

grant select on public.public_services to anon, authenticated;
