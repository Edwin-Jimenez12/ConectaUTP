create or replace view public.public_services as
select
  services.id,
  services.owner_id,
  services.title,
  services.description,
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
  profiles.institutional_email_status,
  services.created_at,
  profiles.avatar_url as provider_avatar_url
from public.services
join public.service_categories on service_categories.id = services.category_id
join public.profiles on profiles.id = services.owner_id
where services.status = 'published' and profiles.profile_visible = true;

grant select on public.public_services to anon, authenticated;
