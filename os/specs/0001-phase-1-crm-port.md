---
spec: 0001
title: Phase 1 — CRM port (conversion console, no AI)
status: ready-for-tickets
created: 2026-09-04
related: os/decisions/0001-os-folder-structure.md
supersedes-scope-from: os/_source/dispatch-os-build-spec.md (Phase 1)
---

# Phase 1 — CRM port (conversion console, no AI)

> Published locally per ADR 0001 (local-markdown specs/tickets, no external
> tracker). `to-tickets` consumes this file next.

## Problem Statement

I run a solo web agency. I build a free website for a hauling / junk-removal
operator, gather their details, and deliver — and I'm fast at that part, it
takes one to three days. Where I lose money is the step *after* delivery:
turning a delighted free-website recipient into a paying retainer client, then
into a growth-tier client. That conversion sequence has real rules (deliver
clean, a zero-ask check-in as its own message, wait for a client-driven "door",
never re-pitch a deferral, name the offer components only when asked) and I keep
breaking them under conversational pressure — the ProLift compression is the
example. I also work across US time zones from IST and routinely misjudge when
it's reasonable to text someone.

Today all of this lives in a single-file HTML artifact stuck in a Claude.ai
sandbox: no cross-device sync, no real backend, and the state only persists
inside that one artifact. I can't open it on my phone and trust it.

## Solution

A real web app — the same dispatch/job-ticket console I already have, ported to
Next.js + Supabase so it syncs across my laptop and phone and is protected by a
password. Phase 1 is the conversion CRM with no AI in it yet:

- A **conversion board** as the home screen: every *delivered* client shown in
  the column for where they sit in the post-delivery sequence
  (check-in → bridge → retainer → domain-trigger → growth → won/closed), each
  card showing the one thing it's waiting on.
- A **client record** per prospect/client with the full brief, an editable
  phase tracker, and a **dated events timeline** so every touch is logged
  instead of living in my memory.
- A **bridge-gate checklist** on each delivered client that tells me plainly
  "ready to pitch" or "not ready — here's what's missing", derived from the
  Phase 8.5 preconditions.
- **Client-local time** and a **contact-window light** (green / amber / red) on
  every client, plus my own IST time, so I know at a glance who I can text now.
- **Dashboard nags**: overdue next-actions, deferral countdowns, stale clients,
  delivered clients missing a PayPal plan link.
- Todos and a Groups list carried over. The three posting pages (Creator,
  Schedule, Library) are visible in the nav but stubbed until Phase 2.
- A **seed script** that loads my six real client records from `os/clients/`
  once. No migration from the artifact.

## User Stories

### Access

1. As the operator, I want the whole app behind a single shared password, so that a casual visitor to the URL can't see my pipeline.
2. As the operator, I want to enter the password once and stay signed in via a cookie, so that I'm not re-authenticating on every visit or on my phone.
3. As the operator, I want an unauthenticated request to any page to redirect to the login screen, so that there's no way to deep-link past the gate.
4. As the operator, I want a way to sign out, so that I can drop the session on a shared machine.

### Conversion board (dashboard home)

5. As the operator, I want the home screen to be a board of my *delivered* clients grouped by post-delivery stage, so that the first thing I see is who needs a conversion move.
6. As the operator, I want the board columns to be Check-in, Bridge, Retainer, Domain-trigger, Growth, Won, and Closed, so that the layout matches the actual sequence in the playbook.
7. As the operator, I want a delivered client in phase 8 with no bridge sub-state to appear in Check-in, so that I know the zero-ask check-in is the next move.
8. As the operator, I want a client in phase 8 with sub-state `bridge` to appear in Bridge, so that I know I'm waiting for a client-driven door before pitching.
9. As the operator, I want a client in phase 9 to appear in Retainer, and one in phase 9 with sub-state `domain-trigger` to appear in Domain-trigger, so that a domain-circling hesitation is visually distinct from a fresh pitch.
10. As the operator, I want a client in phase 10 in Growth, a client with `retainer_status = active` in Won, and one with `retainer_status = declined` in Closed, so that converted and dead deals leave the working columns.
11. As the operator, I want a deferred client (`retainer_status = deferred`) to stay in Retainer with a visible countdown to their `do_not_pitch_until` date, so that I don't pitch early but I know when the window opens.
12. As the operator, I want each board card to show the single blocking item for that client (e.g. "check-in not logged", "PayPal link missing", "pitch opens in 6 days", "waiting on a door"), so that I can act without opening the record.
13. As the operator, I want clients still in build (phase 1–7) shown in a compact "in build" strip separate from the board, so that they're visible but not cluttering the conversion view.
14. As the operator, I want to click any card to open that client's record, so that I can go from overview to detail in one step.

### Dashboard nags

15. As the operator, I want a list of clients whose `next_action_at` is in the past, so that nothing slips.
16. As the operator, I want a list of clients whose `do_not_pitch_until` has now passed, flagged as "ready for a retainer conversation", so that I act on deferrals at the right time.
17. As the operator, I want a list of clients whose `phase_updated_at` is more than 14 days ago, so that I can see who's gone stale.
18. As the operator, I want a list of delivered clients at phase 8 or later with an empty `paypal_plan_url`, so that I create the plan before I need it.
19. As the operator, I want a "textable right now" list of clients currently in their contact window, ordered so the green ones are on top, so that I can batch my outreach into the right hours.

### Client list & record

20. As the operator, I want a list of all clients showing business name, contact name, phase, retainer status, and their current local time, so that I can scan the pipeline.
21. As the operator, I want to filter the client list by build status and by retainer status, so that I can focus (e.g. only delivered + not-yet-paying).
22. As the operator, I want to open a client record and see the full brief fields, so that I have the context before I message them.
23. As the operator, I want to edit any brief field inline and have it save, with a confirmation toast, so that keeping the record current is low friction.
24. As the operator, I want a free-form `brief_md` area on the record that I can edit, so that the narrative brief lives with the structured fields.
25. As the operator, I want to add a new client with the required fields, so that I can onboard a prospect the moment they say yes.
26. As the operator, I want a destructive delete of a client to require a confirm step, so that I don't lose a record by misclick.

### Phase tracker

27. As the operator, I want to set a client's phase (1–10) and, where relevant, a sub-state of `bridge` or `domain-trigger`, so that the board places them correctly.
28. As the operator, I want changing the phase to stamp `phase_updated_at` automatically, so that staleness detection is accurate without extra work.
29. As the operator, I want to set `next_action_at` and a short description of that next action, so that the nag list and the card blocking-item are meaningful.
30. As the operator, I want to set `do_not_pitch_until` on a client, so that the board and nags respect a deferral.
31. As the operator, I want marking `build_status = delivered` to record a `delivered_at` date, so that the bridge gate can measure "days since delivery".

### Bridge gate

32. As the operator, I want each delivered client to show a bridge-gate checklist of the Phase 8.5 preconditions, so that I never pitch before it's earned.
33. As the operator, I want the checklist to auto-tick "site delivered and live" from `build_status` + `site_url`, "enough time has passed" from `delivered_at` (default threshold 3 days), and "PayPal plan link ready" from `paypal_plan_url`, so that I don't maintain those by hand.
34. As the operator, I want to manually mark "zero-ask check-in landed" and "nothing asked of them since delivery", because those can't be detected automatically, so that the gate reflects reality.
35. As the operator, I want the checklist to resolve to a single clear verdict — "ready to pitch" or "not ready: <missing items>" — so that the decision is unambiguous.
36. As the operator, I want logging a zero-ask check-in event to be a one-tap action that also offers to tick the "check-in landed" item, so that the timeline and the gate stay in sync.

### Contact window & time zones

37. As the operator, I want each client to carry an IANA time zone, set from a dropdown when I create or edit them, so that their local time can be computed.
38. As the operator, I want every client record and list row to show the client's current local time and day, updating live, so that I don't do the math.
39. As the operator, I want my own current time (IST) shown alongside, so that I can see the offset directly.
40. As the operator, I want a green / amber / red contact-window light per client — green inside 9am–8pm their local time, amber in the hour either side, red otherwise — so that I know if it's a reasonable time to text.
41. As the operator, I want an amber/red client to show "opens in Xh Ym", so that I can decide whether to wait or schedule.
42. As the operator, I want a free-text `contact_hours` note per client (e.g. "evenings only") shown near the light, so that a client's stated preference is visible even though Phase 1 doesn't yet enforce it in the light logic.

### Events timeline

43. As the operator, I want an append-only dated timeline on each client record, so that every touch and decision is recorded outside my head.
44. As the operator, I want to add an event with a kind (note, touch, ascension-signal, phase-change, system) and a body, so that the log is structured enough to filter later.
45. As the operator, I want phase changes and delivery to auto-write a `phase-change` / `system` event, so that the timeline reflects state changes without me logging them.
46. As the operator, I want to tag an event as an `ascension-signal` (asked about Google, mentioned a missed call, said they're getting busier), so that the dashboard can surface upgrade-ready clients.
47. As the operator, I want a client with an open ascension-signal event to be flagged on the dashboard, so that I follow up on real buying signals and not manufactured ones.
48. As the operator, I want timeline entries shown newest-first with their date, so that the recent history is immediately readable.

### Todos

49. As the operator, I want to create, edit, complete, and delete todos, so that follow-ups have a home.
50. As the operator, I want a todo to optionally link to a client or a group, so that I can see what a task is about.
51. As the operator, I want to filter todos by status and priority, so that I can work the high-priority open items first.
52. As the operator, I want a client record to show its linked open todos, so that the record is a full picture.

### Groups

53. As the operator, I want a Groups list with name, status, rules notes, rules URL, and last-post date, so that the data the post generator will need later already exists.
54. As the operator, I want to create, edit, and delete groups, so that I can maintain that list now.

### Deferred pages

55. As the operator, I want Creator, Schedule, and Library visible in the nav but showing a clear "coming in Phase 2" placeholder, so that the app shape matches the artifact without pretending those work yet.

### Seed & data

56. As the operator, I want a one-command seed that loads my six real client records (HD Junk Removal, Zenith, ProLift, HeartLand, Rice Moving, Total Property Service) and their history into the database from `os/clients/`, so that the app opens with my real pipeline.
57. As the operator, I want the seed to be idempotent — running it twice doesn't duplicate anyone — so that it's safe to re-run after a schema change.
58. As the operator, I want the seed to turn each client's `history.md` entries into timeline events dated from their headings, so that the recorded history carries over.
59. As the operator, I do NOT want any import from the old artifact — Phase 1 starts fresh from `os/clients/`.

### Deploy & parity

60. As the operator, I want the app deployed to Vercel from the first working build, backed by a free Supabase project, so that "open it on my phone" is true throughout Phase 1.
61. As the operator, I want the ported pages to visually match the artifact closely enough that it reads as the same tool, verified by side-by-side screenshots, not by eyeballing.
62. As the operator, I want secrets only in environment variables, never in the client bundle or the repo, so that nothing leaks.

## Implementation Decisions

### Architecture

- **Framework:** Next.js App Router, single app in `web/` in this repo, beside
  `os/` and `.claude/`. One deploy.
- **Database:** Supabase (Postgres). Access via `@supabase/supabase-js` from
  server components, route handlers, and server actions. **No ORM.** RLS is
  **off** — the password gate is the only auth boundary and the service-role
  key is used server-side only, never shipped to the client.
- **snake_case in Postgres.** A thin mapping layer converts rows to camelCase
  for the ported React components so their render code changes minimally. The
  mapper is the only place field-name translation happens.
- **Auth:** one shared password in `APP_PASSWORD`. A login route validates it
  and sets a signed, httpOnly `session` cookie (HMAC via `APP_SESSION_SECRET`).
  Middleware guards every route except the login page and static assets. A
  sign-out route clears the cookie.
- **Operator time zone:** `OPERATOR_TZ` env var, default `Asia/Kolkata`.
- **No AI, no Anthropic SDKs, no agent code** anywhere in Phase 1.

### Modules

- **`derive` module** — pure functions, no I/O, every one takes an explicit
  `now` argument (never reads the system clock):
  - `conversionColumn(client)` → one of `check-in | bridge | retainer | domain-trigger | growth | won | closed`
  - `bridgeGateStatus(client, events, now)` → `{ ready: boolean, items: { key, label, met, source: 'auto' | 'manual' }[], missing: string[] }`
  - `contactWindowStatus(client, now)` → `{ level: 'green' | 'amber' | 'red', localTime: string, localDay: string, opensInMinutes: number | null }`
  - `dashboardNags(clients, events, now)` → `{ overdue, deferralReady, deferralPending, stale, missingPaypal, textableNow, ascensionSignals }`
  This module is the primary test seam.
- **`data` module** — Supabase query functions + the snake_case↔camelCase
  mapper. Thin. The CRUD boundary (route handlers / server actions that call
  this) is the secondary test seam.
- **`seed` script** — reads `os/clients/*/brief.md` + `history.md`, parses the
  field table, phase tracker, and dated history headings, and upserts by
  `slug`. Invoked as `pnpm seed`.
- **UI** — ported page components (Dashboard, Clients, Todo, Groups) plus
  `PageHeader`, `.stamp`, panel, and button primitives hand-ported from the
  artifact per `os/knowledge/design-system.md`. Tailwind theme layer exposes the
  design tokens as CSS custom properties. No shadcn/ui. No emoji.

### Schema (Phase 1)

New/changed relative to `os/_source/dispatch-os-build-spec.md`. Encodes
decisions; exact DDL is an implementation detail.

```
clients
  id                uuid pk
  slug              text unique not null      -- seed idempotency key, from os/clients/<slug>
  business_name     text not null
  contact_name      text
  location          text
  timezone          text                      -- IANA, e.g. 'America/Chicago'
  contact_hours     text                      -- nullable free-text note, display only in P1
  source            text                      -- fb-comment | fb-dm | fb-post-reply | other
  offer_type        text                      -- free-website | free-review-agent | both | direct-pitch
  build_status      text                      -- not-started | in-progress | delivered
  delivered_at      date                      -- set when build_status -> delivered
  retainer_status   text                      -- not-pitched | pitched | deferred | active | declined
  retainer_tier     text
  phase             int                       -- 1..10
  phase_substate    text                      -- null | 'bridge' | 'domain-trigger'
  phase_updated_at  timestamptz               -- stamped on any phase / phase_substate change
  next_action_at    date
  next_action_note  text
  do_not_pitch_until date
  checkin_landed            boolean not null default false   -- manual bridge-gate item
  nothing_asked_since_delivery boolean not null default false -- manual bridge-gate item
  site_url          text
  domain            text
  paypal_plan_url   text
  mrr               numeric not null default 0
  brief_md          text
  notes             text
  created_at        timestamptz not null default now()

client_events                                 -- NEW
  id          uuid pk
  client_id   uuid not null references clients(id) on delete cascade
  at          timestamptz not null default now()
  kind        text not null                   -- note | touch | ascension-signal | phase-change | system
  body        text not null
  resolved_at timestamptz                     -- for ascension-signal: null = open/flagged
  created_at  timestamptz not null default now()

groups
  id, name, status (active|pending|flagged|needs-review),
  rules_notes text, rules_url text, last_post_date date, created_at

posts            -- table created, unused in P1
  id, client_id uuid null, niche, offer_type, gif_version, normal_version,
  group_id uuid null, scheduled_date date null,
  status (draft|scheduled|posted|pending|flagged), created_at

todos
  id, client_id uuid null, title, due_date date null,
  priority (low|medium|high), group_id uuid null,
  status (todo|in-progress|done), created_at

agent_runs       -- table created, unused in P1
  id, kind (post|dm|audit|build|recon), client_id uuid null,
  input jsonb, output jsonb, tokens_in int, tokens_out int, model text, created_at
```

### Behaviour decisions

- **`conversionColumn`**: only `build_status = delivered` clients reach the
  board. Mapping: `retainer_status = active` → `won`;
  `retainer_status = declined` → `closed`; else by phase —
  `10 → growth`; `9 + substate domain-trigger → domain-trigger`;
  `9 → retainer` (deferred clients included here, with countdown);
  `8 + substate bridge → bridge`; `8 → check-in`; `< 8 while delivered` →
  `check-in` with a data-warning badge.
- **Contact window**: default `[09:00, 20:00)` in `client.timezone`, every day.
  `green` inside it; `amber` in `[08:00, 09:00)` or `[20:00, 21:00)`; `red`
  otherwise. `opensInMinutes` = minutes to the next local `09:00` when not
  green. `contact_hours` is displayed but does not alter the light in Phase 1.
- **Bridge gate** items: `site_delivered_live` (auto: `build_status = delivered`
  ∧ `site_url`), `time_since_delivery` (auto: `now - delivered_at ≥ 3 days`),
  `paypal_ready` (auto: `paypal_plan_url` present), `checkin_landed` (manual
  flag), `nothing_asked_since_delivery` (manual flag). `ready` = all five met.
- **Nags thresholds**: stale = `phase_updated_at` older than 14 days;
  time-since-delivery default = 3 days. Both are named constants, not settings
  UI, in Phase 1.
- **Phase change side-effects**: any write that changes `phase` or
  `phase_substate` stamps `phase_updated_at` and appends a `phase-change`
  event. Setting `build_status = delivered` sets `delivered_at` (if null) and
  appends a `system` event.
- **Seed parsing**: the client `brief.md` field table maps to columns by label;
  `slug` comes from the folder name; `history.md` `##` date headings become
  `client_events` (`kind = note`, `at` = parsed heading date; "Prior to
  2026-09-04" → `2026-09-04`). Upsert on `slug`. Re-run replaces the client row
  and its seed-originated events, leaving operator-added events intact
  (seed-originated events carry `kind = system` marker text or a known prefix —
  implementation picks the mechanism).
- **Environment variables**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
  `APP_PASSWORD`, `APP_SESSION_SECRET`, `OPERATOR_TZ`. Documented in the repo,
  set in Vercel, never committed.

## Testing Decisions

- **What a good test is here:** asserts observable behaviour for a given input,
  not internal structure. For `derive`, that's `(data, now) → result`. For the
  CRUD boundary, that's "call the handler/action, then observe the stored state
  or the response". No test reaches into module internals or asserts on
  implementation details like query shape.
- **Primary seam — the `derive` module.** Full unit coverage with plain-object
  fixtures and a fixed `now`. Cases to cover: every `conversionColumn` branch
  including `won` / `closed` / deferred-in-retainer / delivered-but-phase<8;
  `contactWindowStatus` green/amber/red boundaries across time zones and the
  DST-shifted state (use a real IANA zone, e.g. `America/Chicago` in both
  January and July); `opensInMinutes` when red vs amber; `bridgeGateStatus`
  with each item independently unmet and the all-met case; `dashboardNags`
  buckets with clients that qualify for several at once.
- **Secondary seam — the CRUD boundary.** A thin set against a dedicated
  throwaway Supabase project (RLS off, same as prod): create a client → read it
  back mapped to camelCase; change `phase` → `phase_updated_at` moved and a
  `phase-change` event exists; set `build_status = delivered` → `delivered_at`
  set; append a `client_event` → it appears in the client's timeline; a request
  with no `session` cookie is rejected by the middleware. Per-test cleanup
  truncates tables in a `beforeEach`.
- **Seed script — one idempotency test** in the same DB harness: run it, assert
  six clients and their history events exist; run it again, assert no
  duplicate clients and no duplicate seed events.
- **Not tested in Phase 1:** React components (covered transitively by the CRUD
  tests and the manual parity review), the snake_case↔camelCase mapper in
  isolation (trivial, exercised by every CRUD test).
- **Visual parity** is a manual review step: run the app, screenshot the four
  live pages with the Playwright MCP, compare side-by-side with the artifact,
  fix visible drift. Not part of the automated suite, not a merge gate.
- **Runner:** Vitest for `derive` and the DB harness.

## Out of Scope

- All AI: post generator, DM Copilot, pipeline auditor, prospect recon, site
  builder, and any Anthropic SDK usage. (Phases 2–5.)
- Working Creator, Schedule, and Library pages — stubs only.
- Replacing Web3Forms / any client-facing contact-form endpoint or client-facing
  dashboard.
- Real / multi-user auth, accounts, roles, magic links.
- Structured, enforced per-client contact hours — Phase 1 stores and shows the
  free-text note only; the light uses the fixed 9am–8pm rule.
- Syncing the database back to `os/clients/` markdown — the markdown is the
  seed and a historical snapshot; it will drift from the DB until a Phase 3
  sync job. Accepted.
- The Agent-SDK-on-Vercel-serverless spike (Phase 3 concern).
- Vercel Cron / any scheduled job.
- Importing anything from the `outreach-os.html` artifact.
- A settings UI for thresholds (stale days, bridge time-since-delivery) — named
  constants in Phase 1.

## Further Notes

- **ADR alignment:** phase stays `int 1..10` plus `phase_substate`
  (`bridge`, `domain-trigger`) per `os/decisions/0001-os-folder-structure.md`.
  `CONTEXT.md` at repo root and ADRs in `os/decisions/` per the same ADR;
  `setup-matt-pocock-skills` intentionally skipped.
- **Vocabulary:** this spec uses the terms from `os/knowledge/` (prospect,
  client, phase, zero-ask check-in, the bridge, retainer, conversion board,
  contact window, ascension signal). `domain-modeling` / `grill-with-docs` will
  formalise these into `CONTEXT.md` in a later pass; there is no glossary file
  yet.
- **The `derive` module is the point of the whole phase.** It's the manual
  version of the Phase 3 pipeline auditor. Getting its rules right — especially
  `bridgeGateStatus` and the deferred-client handling — is what makes the app
  worth opening.
- **Seed source of truth:** the six client folders under `os/clients/` were
  enriched 2026-09-04 from `os/_source/client-brief/`. ProLift's repair
  check-in (2026-09-04, awaiting reply) is reflected there and in
  `os/casebook/`.
- Six real clients for the seed: `hd-junk-removal`, `zenith-junk-removal`,
  `prolift-hauling`, `heartland-demo`, `rice-moving`, `total-property-service`.
  Timezones: Central for HD / HeartLand / Rice, Mountain for Zenith, Pacific
  for ProLift, unknown for Total Property Service.
- **Done when:** the app is deployed on Vercel, password-gated, seeded with the
  six real clients, and I can open it on my phone and see the conversion board
  with correct columns, contact-window lights, and bridge-gate verdicts.
