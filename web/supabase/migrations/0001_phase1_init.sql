-- Dispatch OS — Phase 1 schema (spec: os/specs/0001-phase-1-crm-port.md)
--
-- Apply once. Either:
--   * paste this whole file into the Supabase SQL Editor and run it, or
--   * `supabase db push` if you have the CLI linked.
-- Safe to re-run: every statement is IF NOT EXISTS.
--
-- RLS is intentionally NOT enabled: the app's shared-password gate is the auth
-- boundary and only the service-role key is used, server-side.

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- clients -------------------------------------------------------------------
create table if not exists clients (
  id                           uuid primary key default gen_random_uuid(),
  slug                         text not null unique,
  business_name                text not null,
  contact_name                 text,
  location                     text,
  timezone                     text,
  contact_hours                text,
  source                       text
                                 check (source in ('fb-comment','fb-dm','fb-post-reply','other')),
  offer_type                   text
                                 check (offer_type in ('free-website','free-review-agent','both','direct-pitch')),
  build_status                 text not null default 'not-started'
                                 check (build_status in ('not-started','in-progress','delivered')),
  delivered_at                 date,
  retainer_status              text not null default 'not-pitched'
                                 check (retainer_status in ('not-pitched','pitched','deferred','active','declined')),
  retainer_tier                text,
  phase                        int not null default 1 check (phase between 1 and 10),
  phase_substate               text check (phase_substate in ('bridge','domain-trigger')),
  phase_updated_at             timestamptz,
  next_action_at               date,
  next_action_note             text,
  do_not_pitch_until           date,
  checkin_landed               boolean not null default false,
  nothing_asked_since_delivery boolean not null default false,
  site_url                     text,
  domain                       text,
  paypal_plan_url              text,
  mrr                          numeric not null default 0,
  brief_md                     text,
  notes                        text,
  created_at                   timestamptz not null default now()
);

-- groups ------------------------------------------------------------------------
create table if not exists groups (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  status         text not null default 'active'
                   check (status in ('active','pending','flagged','needs-review')),
  rules_notes    text,
  rules_url      text,
  last_post_date date,
  created_at     timestamptz not null default now()
);

-- client_events ---------------------------------------------------------------
create table if not exists client_events (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  at          timestamptz not null default now(),
  kind        text not null
                check (kind in ('note','touch','ascension-signal','phase-change','system')),
  body        text not null,
  resolved_at timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists client_events_client_at_idx
  on client_events (client_id, at desc);

-- todos ---------------------------------------------------------------------
create table if not exists todos (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid references clients(id) on delete set null,
  group_id   uuid references groups(id) on delete set null,
  title      text not null,
  due_date   date,
  priority   text not null default 'medium' check (priority in ('low','medium','high')),
  status     text not null default 'todo' check (status in ('todo','in-progress','done')),
  created_at timestamptz not null default now()
);

-- posts (table created, unused until Phase 4) --------------------------------
create table if not exists posts (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid references clients(id) on delete set null,
  group_id       uuid references groups(id) on delete set null,
  niche          text,
  offer_type     text,
  gif_version    text,
  normal_version text,
  scheduled_date date,
  status         text not null default 'draft'
                   check (status in ('draft','scheduled','posted','pending','flagged')),
  created_at     timestamptz not null default now()
);

-- agent_runs (table created, unused until Phase 2) --------------------------
create table if not exists agent_runs (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('post','dm','audit','build','recon')),
  client_id  uuid references clients(id) on delete set null,
  input      jsonb,
  output     jsonb,
  tokens_in  int,
  tokens_out int,
  model      text,
  created_at timestamptz not null default now()
);
