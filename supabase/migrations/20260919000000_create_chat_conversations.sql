-- Conversaciones directas y conversaciones asociadas a una solicitud de servicio.
create table public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete set null,
  participant_one_id uuid not null references auth.users(id) on delete cascade,
  participant_two_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chat_conversations_distinct_participants check (participant_one_id <> participant_two_id),
  constraint chat_conversations_participant_order check (participant_one_id < participant_two_id)
);

create unique index chat_conversations_unique_participants
  on public.chat_conversations (
    coalesce(service_id, '00000000-0000-0000-0000-000000000000'::uuid),
    participant_one_id,
    participant_two_id
  );

create index chat_conversations_participant_one_idx on public.chat_conversations(participant_one_id);
create index chat_conversations_participant_two_idx on public.chat_conversations(participant_two_id);

alter table public.chat_conversations enable row level security;
alter table public.service_messages alter column service_id drop not null;
alter table public.service_messages add column if not exists conversation_id uuid references public.chat_conversations(id) on delete cascade;
create index if not exists service_messages_conversation_id_idx on public.service_messages(conversation_id);

create policy "Participants can read chat conversations"
  on public.chat_conversations for select
  to authenticated using (auth.uid() in (participant_one_id, participant_two_id));

create policy "Users can create chat conversations"
  on public.chat_conversations for insert
  to authenticated with check (
    auth.uid() in (participant_one_id, participant_two_id)
    and participant_one_id < participant_two_id
    and exists (select 1 from public.public_profiles where public_profiles.id = participant_one_id)
    and exists (select 1 from public.public_profiles where public_profiles.id = participant_two_id)
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

drop policy if exists "Users can send service messages" on public.service_messages;
drop policy if exists "Participants can read service messages" on public.service_messages;
drop policy if exists "Owners can update message status" on public.service_messages;

create policy "Conversation participants can send messages"
  on public.service_messages for insert
  to authenticated with check (
    auth.uid() = sender_id
    and conversation_id is not null
    and exists (
      select 1
      from public.chat_conversations
      where chat_conversations.id = service_messages.conversation_id
        and auth.uid() in (chat_conversations.participant_one_id, chat_conversations.participant_two_id)
        and chat_conversations.service_id is not distinct from service_messages.service_id
        and (
          chat_conversations.service_id is null
          or exists (
            select 1 from public.services
            where services.id = chat_conversations.service_id
              and services.status = 'published'
              and services.owner_id in (chat_conversations.participant_one_id, chat_conversations.participant_two_id)
          )
        )
    )
  );

create policy "Conversation participants can read messages"
  on public.service_messages for select
  to authenticated using (
    (
      conversation_id is not null
      and exists (
        select 1 from public.chat_conversations
        where chat_conversations.id = service_messages.conversation_id
          and auth.uid() in (chat_conversations.participant_one_id, chat_conversations.participant_two_id)
      )
    )
    or (
      conversation_id is null
      and (
        auth.uid() = sender_id
        or exists (select 1 from public.services where services.id = service_messages.service_id and services.owner_id = auth.uid())
      )
    )
  );

create policy "Conversation participants can update read status"
  on public.service_messages for update
  to authenticated using (
    (
      conversation_id is not null
      and exists (
        select 1 from public.chat_conversations
        where chat_conversations.id = service_messages.conversation_id
          and auth.uid() in (chat_conversations.participant_one_id, chat_conversations.participant_two_id)
      )
    )
    or (
      conversation_id is null
      and exists (select 1 from public.services where services.id = service_messages.service_id and services.owner_id = auth.uid())
    )
  ) with check (true);

create or replace function public.protect_chat_message_content()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.conversation_id is distinct from old.conversation_id
    or new.service_id is distinct from old.service_id
    or new.sender_id is distinct from old.sender_id
    or new.body is distinct from old.body
    or new.created_at is distinct from old.created_at then
    raise exception 'Solo se puede actualizar el estado de lectura del mensaje';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_chat_message_content on public.service_messages;
create trigger protect_chat_message_content
before update on public.service_messages
for each row execute function public.protect_chat_message_content();

create or replace function public.touch_chat_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists touch_chat_conversation on public.service_messages;
create trigger touch_chat_conversation
after insert on public.service_messages
for each row when (new.conversation_id is not null)
execute function public.touch_chat_conversation();

grant select, insert on public.chat_conversations to authenticated;
grant select, insert, update on public.service_messages to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_conversations'
  ) then
    alter publication supabase_realtime add table public.chat_conversations;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'service_messages'
  ) then
    alter publication supabase_realtime add table public.service_messages;
  end if;
end;
$$;
