-- Rode este script no Supabase do Wagoo: Dashboard → SQL Editor → Run.
-- Corrige: Could not find the table 'public.feedback_messages' in the schema cache
-- Aguarde ~1 min ou recarregue o projeto para o PostgREST atualizar o cache.

create table if not exists public.feedback_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  organization_id uuid null,
  user_email text,
  user_full_name text,
  body text not null,
  constraint feedback_messages_body_len check (
    char_length(trim(body)) >= 5
    and char_length(body) <= 8000
  )
);

create index if not exists idx_feedback_messages_created_at on public.feedback_messages (created_at desc);

comment on table public.feedback_messages is
  'Feedback autenticado (FAB wag-frontend); leitura/apagar via wag-backend GET|DELETE /feedback/messages (API key).';

alter table public.feedback_messages enable row level security;

revoke all on table public.feedback_messages from public;
grant insert on table public.feedback_messages to authenticated;
grant select, insert, update, delete on table public.feedback_messages to service_role;

drop policy if exists "authenticated_insert_own_feedback" on public.feedback_messages;

create policy "authenticated_insert_own_feedback"
on public.feedback_messages
for insert
to authenticated
with check (
  user_id = auth.uid()
);
