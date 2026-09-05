-- Dispatch OS — mistake-log + revenue-goal tracking
--
-- Apply once. Paste into the Supabase SQL Editor and run, or `supabase db push`.
-- Safe to re-run: constraint drop/add is idempotent via DO blocks, table/insert are IF NOT EXISTS.

do $$
begin
  alter table client_events drop constraint if exists client_events_kind_check;
  alter table client_events add constraint client_events_kind_check
    check (kind in ('note','touch','ascension-signal','phase-change','system','ai-action','mistake'));
end $$;

-- app_settings — single-row config (the $/mo revenue goal shown on the dashboard).
create table if not exists app_settings (
  id         int primary key default 1,
  mrr_goal   numeric not null default 10000,
  updated_at timestamptz not null default now(),
  check (id = 1)
);
insert into app_settings (id) values (1) on conflict (id) do nothing;
