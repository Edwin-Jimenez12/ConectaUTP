-- Una pareja de usuarios comparte un solo chat, aunque solicite varios servicios.

-- La migración debe mover mensajes entre conversaciones; el trigger protege
-- este campo durante el uso normal de la aplicación.
alter table public.service_messages disable trigger protect_chat_message_content;

with ranked as (
  select
    id,
    participant_one_id,
    participant_two_id,
    row_number() over (
      partition by participant_one_id, participant_two_id
      order by (service_id is null), created_at, id
    ) as conversation_rank
  from public.chat_conversations
), canonical as (
  select participant_one_id, participant_two_id, id as canonical_id
  from ranked
  where conversation_rank = 1
)
update public.service_messages as messages
set conversation_id = canonical.canonical_id
from ranked as duplicate
join canonical
  on canonical.participant_one_id = duplicate.participant_one_id
  and canonical.participant_two_id = duplicate.participant_two_id
where duplicate.conversation_rank > 1
  and messages.conversation_id = duplicate.id;

with ranked as (
  select
    id,
    row_number() over (
      partition by participant_one_id, participant_two_id
      order by (service_id is null), created_at, id
    ) as conversation_rank
  from public.chat_conversations
)
delete from public.chat_conversations as conversations
using ranked
where conversations.id = ranked.id
  and ranked.conversation_rank > 1;

alter table public.service_messages enable trigger protect_chat_message_content;

drop index if exists public.chat_conversations_unique_participants;

create unique index chat_conversations_unique_participants
  on public.chat_conversations (participant_one_id, participant_two_id);

drop policy if exists "Conversation participants can send messages" on public.service_messages;

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
        and (
          service_messages.service_id is null
          or exists (
            select 1
            from public.services
            where services.id = service_messages.service_id
              and services.status = 'published'
              and services.owner_id in (chat_conversations.participant_one_id, chat_conversations.participant_two_id)
          )
        )
    )
  );
