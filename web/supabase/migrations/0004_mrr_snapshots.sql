-- Dispatch OS — MRR history for the dashboard trend chart
--
-- Apply once. Paste into the Supabase SQL Editor and run, or `supabase db push`.
-- One row per calendar day; the dashboard upserts today's row on every load,
-- so the trend fills in naturally as the app gets used (no backfill possible —
-- we only ever stored current MRR, not history, before this).

create table if not exists mrr_snapshots (
  at         date primary key,
  mrr        numeric not null,
  created_at timestamptz not null default now()
);
