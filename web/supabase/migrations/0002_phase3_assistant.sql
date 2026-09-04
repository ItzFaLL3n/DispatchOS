-- Phase 3: CRM Assistant. Additive only — no data loss, no existing rows
-- touched. See os/specs/0003-phase-3-crm-assistant.md.

-- client_events gains an 'ai-action' kind, for every write the assistant
-- makes landing on the client's own timeline (confirmed or auto-applied).
alter table client_events drop constraint if exists client_events_kind_check;
alter table client_events add constraint client_events_kind_check
  check (kind in ('note','touch','ascension-signal','phase-change','system','ai-action'));

-- agent_runs gains an 'assistant' kind, logged the same shape as 'post' runs
-- (tokens in/out, model, input, output) on every worker call.
alter table agent_runs drop constraint if exists agent_runs_kind_check;
alter table agent_runs add constraint agent_runs_kind_check
  check (kind in ('post','dm','audit','build','recon','assistant'));

-- assistant_messages ------------------------------------------------------
-- One ongoing thread per client_id (null = the general/dashboard thread).
-- No multi-thread management in v1 — see spec's Out of Scope.
create table if not exists assistant_messages (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid references clients(id) on delete cascade,
  role             text not null check (role in ('user','assistant')),
  content          text not null,
  proposed_actions jsonb,
  created_at       timestamptz not null default now()
);
create index if not exists assistant_messages_client_created_idx
  on assistant_messages (client_id, created_at);
