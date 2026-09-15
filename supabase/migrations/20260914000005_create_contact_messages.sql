-- Mensajes enviados desde la página general de contacto.

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references auth.users(id) on delete set null,
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 255),
  topic text not null check (char_length(topic) between 3 and 80),
  message text not null check (char_length(message) between 10 and 2000),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Visitors can send contact messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (
    (auth.uid() is null and sender_id is null)
    or auth.uid() = sender_id
  );

grant insert on public.contact_messages to anon, authenticated;
