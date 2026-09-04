---
spec: 0003
title: Phase 3 — CRM Assistant (chat, guardrailed writes, DM-thread mode)
status: ready-for-tickets
created: 2026-09-04
related: os/specs/0002-phase-2-post-generator.md, docs/agents/agent-sdk-serverless.md
supersedes-scope-from: os/_source/dispatch-os-build-spec.md (Phase 3, both 3a Pipeline Auditor and 3b DM Copilot)
---

# Phase 3 — CRM Assistant

> Published locally per ADR 0001. Reached via `/grill-me` → `grilling` (installed
> mid-session as `mattpocock/skills`), not `to-spec`'s default no-interview
> synthesis — the grill transcript is the source for the Problem/Solution/User
> Stories below. `to-tickets` consumes this file next.

## Problem Statement

Creator's Live AI (spec 0002) needs a real Claude call, and paying for a
separate `console.anthropic.com` API key on top of an existing Claude
subscription was the trigger for this spec — but the real ask, once grilled
out, is bigger than Creator: an assistant that can actually read and act on
the CRM, not just generate outreach copy. Today, understanding a client's
phase state, drafting a DM reply, and touching the record all live in
different places (my head, the DM Copilot skill's paste-and-draft flow, the
client record's manual edit forms) with no connective tissue.

## Solution

One assistant, reached from a slide-out panel on any page, context-aware of
whatever client you're looking at:

- **Reads and writes the CRM** — clients, groups, todos, `client_events` —
  through a small set of explicit tools, not open-ended DB access.
- **Guardrailed by default**: every proposed write is a card you approve or
  reject before it applies. An **auto mode** toggle exists, but it's
  graduated, not a kill-switch — hard-rule-adjacent fields (`retainer_status`,
  `phase`, `phase_substate`, `do_not_pitch_until`) and any delete always
  require your confirm, auto mode or not. Only low-stakes writes (a note, a
  todo, a touch/ascension-signal event) auto-apply once auto mode is on.
- **Every applied write — confirmed or auto — gets a `client_events` entry**
  (new `ai-action` kind), so the client's own timeline shows what the AI did,
  not just a `agent_runs` jsonb blob you'd have to go dig for.
- **DM-copilot mode is a toggle inside the same conversation**, not a
  separate flow: paste a raw thread, the assistant extracts phase/signal
  information and proposes the same kind of guardrailed writes, plus drafts
  the next reply — replacing the old copy-paste-only DM Copilot skill
  interaction with one that can actually touch the record.
- **Same underlying "reads every client, applies the rules" capability
  the Pipeline Auditor needs** — this spec builds the on-demand/chat half;
  a future nightly-cron half reuses the same tools rather than duplicating
  the rule logic in a second agent.
- Runs on the **Agent SDK**, authenticated via the operator's own Claude
  subscription (`CLAUDE_CODE_OAUTH_TOKEN`, from `claude setup-token`) instead
  of a separate paid API key — which is why this needs a worker (Agent SDK
  doesn't fit a Vercel function; see `docs/agents/agent-sdk-serverless.md`).

## User Stories

### Access & context

1. As the operator, I want an assistant panel reachable from any page, so
   that I don't need a dedicated page/tab to use it.
2. As the operator, I want opening the panel from a client's record to
   auto-scope the conversation to that client, so that I don't have to
   restate who I'm talking about.
3. As the operator, I want a general (not client-scoped) thread reachable
   from the dashboard, so that I can ask cross-client questions ("who's
   stale right now").

### Reading the CRM

4. As the operator, I want to ask the assistant plain-language questions
   about my pipeline (phase, retainer status, bridge-gate readiness, open
   todos) and get an answer grounded in real current data, so that it's
   faster than opening the record myself.

### Guardrailed writes

5. As the operator, I want every proposed write shown as a clear
   before/after card I approve or reject, so that nothing changes without me
   seeing exactly what's about to change.
6. As the operator, I want an auto-mode toggle that lets low-stakes writes
   (a note, a todo, a touch event) apply without asking, so that routine
   logging doesn't interrupt me.
7. As the operator, I want retainer status, phase, phase substate,
   `do_not_pitch_until`, and any delete to always require my confirm — auto
   mode or not — so that the fields hard-rules.md protects can never change
   silently.
8. As the operator, I want every write the assistant makes — confirmed or
   auto — to leave a `client_events` entry, so that the client's timeline
   shows what the AI did in the same place it shows everything else.

### DM-copilot mode

9. As the operator, I want to paste a raw Facebook DM thread into the same
   conversation and flip into DM mode, so that the assistant drafts my next
   reply *and* proposes the CRM writes that thread implies (a phase change, a
   logged ascension signal), instead of a reply I have to manually go log
   myself afterward.
10. As the operator, I want DM mode to follow the same content rules as
    everything else generated in this system (no outcome promises, one ask
    per message, zero-ask delivery, never re-pitch a deferral), so that a
    drafted reply can't violate a hard rule.

### Infra

11. As the operator, I want the assistant to run on my existing Claude
    subscription, not a separate metered API key, so that I'm not paying
    twice for the same access.
12. As the operator, I want to know exactly what I personally have to do
    (create a hosting account, generate a token) versus what gets built for
    me, so that the handoff is unambiguous.

## Implementation Decisions

### Architecture

- **Worker**: a small standalone Node HTTP service (not part of the `web/`
  Next.js app — its own directory, e.g. `worker/`), running
  `@anthropic-ai/claude-agent-sdk`'s `query()`, authenticated via
  `CLAUDE_CODE_OAUTH_TOKEN` (generated once by the operator running
  `claude setup-token` locally — **operator action, not buildable by me**).
  One HTTP endpoint (`POST /assistant/message`), protected by a shared
  bearer secret (`WORKER_SHARED_SECRET`, known to both the worker and the
  Vercel app). Deploys to a host the operator picks and creates an account
  for — **operator action**. Turn-based (request → full response), not
  streaming, for v1.
- **The worker never holds Supabase credentials.** Its "read" tools
  (`search_clients`, `get_client`, `list_groups`, `list_open_todos`) go
  through the same shared bearer secret back to a small set of **read-only
  Vercel API routes** (`/api/assistant/data/*`) rather than a second copy of
  the service-role key on a second host. Its "propose" tools
  (`propose_client_update`, `propose_create_todo`,
  `propose_create_client_event`) never write anywhere — they just return a
  structured action object in the worker's response. This keeps exactly one
  process (the Next.js app, which already holds the service-role key) able
  to write to Supabase, ever. The Agent SDK's own built-in tools
  (Read/Write/Edit/Bash/Glob/Grep/WebSearch) are **not** exposed to this
  agent at all — a CRM assistant has no business touching a filesystem or a
  shell.
- **Guardrail classification and every actual write happen in the Vercel
  app**, in the route that receives the worker's response: it runs each
  proposed action through the classifier below, auto-applies anything
  `auto-eligible` when auto mode is on (calling the same
  `web/src/lib/data/*` functions Phase 1/2 already built — no new query
  logic), and returns anything `always-confirm` (or auto mode off) to the UI
  as a pending card. Approving a card in the UI calls the same apply path.
- **Guardrail classifier** — pure function,
  `web/src/lib/assistant/guardrail.ts`: `classifyAction(action) → 'auto-eligible' | 'always-confirm'`.
  Always-confirm: any `clients` write touching `retainerStatus`, `phase`,
  `phaseSubstate`, `doNotPitchUntil`; any delete of any entity. Everything
  else (client_events create, todo create/update, non-hard-rule client
  fields like `notes`/`contactHours`/`siteUrl`) is auto-eligible. This is the
  primary test seam for this phase — full unit coverage, same "derive"-module
  convention as Phase 1.
- **Model**: whatever the Agent SDK/subscription defaults to — not pinned to
  `claude-sonnet-5` the way the Messages API route is, since Agent SDK
  version/model selection isn't the same knob.

### Data layer / schema

- **`client_events.kind`** check constraint gains `'ai-action'` (migration,
  additive).
- **`agent_runs.kind`** check constraint gains `'assistant'` (migration,
  additive) — logged on every worker call the same shape as `post` runs today
  (`tokens_in`/`tokens_out`/`model`/`input`/`output`).
- **New table `assistant_messages`**: `id, client_id uuid null` (null = the
  general/dashboard thread), `role text` (`user`|`assistant`),
  `content text`, `proposed_actions jsonb null`, `created_at`. One ongoing
  thread per `client_id` (including the null/general one) — no multi-thread
  management in v1, matches "context-aware panel," not a full chat-history
  product.
- **`lib/data/assistantMessages.ts`**: `listMessages(clientId)`,
  `appendMessage(...)` — same thin data-layer shape as every other table.

### UI

- **Slide-out panel**, not a dedicated page (reachable via a trigger in the
  sidebar footer, opens over whatever page you're on). Client-record pages
  pass their `clientId` as context when opening it; the dashboard/other pages
  open the general thread.
- **Auto-mode toggle** in the panel header (`.toggle-group` pattern, reused
  from Creator).
- **Pending-action cards**: a before/after diff, Approve/Reject buttons —
  new component, no exact precedent in the codebase, but built from the same
  primitives (`Panel`, `Button`, `Stamp` for the action's field).
- **DM mode toggle**: a second toggle in the panel (`Chat` / `DM thread`),
  switching the system-prompt framing and expected input shape, same
  conversation and history.

### Content rules in DM mode

- DM-mode replies reuse the same canonical source as Creator:
  `os/knowledge/content-rules.md` + `os/knowledge/hard-rules.md` (all seven
  rules this time, not just 1/5 — DM mode is sequencing-sensitive: one ask
  per message, zero-ask delivery, never re-pitch a deferral all apply to a
  drafted reply in a way they don't to a standalone outreach post). Compiled
  into the worker's system prompt the same way `contentRules.ts` compiles
  Creator's — a second constant, not a shared one, since the rule *subset*
  differs.

## Testing Decisions

- **Primary seam — the guardrail classifier.** Full unit coverage: every
  always-confirm field individually, every auto-eligible action type, a
  delete of every entity, a client update touching a mix of always-confirm
  and auto-eligible fields (classifies as always-confirm — one protected
  field taints the whole action).
- **Secondary seam — the apply path** (`always-confirm`/`auto-eligible`
  routing → the actual `web/src/lib/data/*` call), tested the way Phase 1/2's
  data layer is: thin, exercised by a disposable live-smoke script against
  real Supabase, not mocked unit tests.
- **Worker HTTP boundary**: one live-smoke pass once deployed (real request,
  real response, confirm the shared-secret check rejects an unauthorized
  call, confirm its read tools correctly hit `/api/assistant/data/*` rather
  than needing their own Supabase credentials).
- **Not tested**: the Agent SDK's own tool-selection behavior (upstream,
  same "not our code" boundary as trusting `@anthropic-ai/sdk` in Phase 2).
- **Runner:** Vitest, consistent with every prior phase.

## Out of Scope

- Streaming responses — v1 is turn-based.
- Multi-thread history per client (v1 is one ongoing thread per client, or
  the general thread — no thread list, no archive/rename).
- The actual nightly-cron Pipelineauditor job (Vercel Cron + scheduled
  run) — this spec builds the tools/guardrail/agent core the auditor will
  reuse, not the scheduled job itself.
- Any change to Creator (spec 0002) — it stays on its own Messages-API route,
  untouched. (Migrating Creator onto this same worker is a natural future
  step, not this spec's job.)
- Voice/image input, file uploads into the chat.
- Undo/revert of an applied AI action (the `client_events` entry makes it
  *visible*, not automatically reversible).

## Further Notes

- **Ticket 01's finding stands**: the Agent SDK cannot run in a Vercel
  function (~205MB platform binary vs. the 250MB cap). This spec is the
  reason that worker gets built now instead of at Phase 3's original
  scheduled-cron timing.
- **ToS**: programmatic Agent SDK usage on a Claude subscription
  (`CLAUDE_CODE_OAUTH_TOKEN` / `claude setup-token`) is an explicitly
  documented, sanctioned path — not a workaround. The enforcement risk zone
  (reselling access to other end users via a wrapper) doesn't apply to a
  single-operator internal tool. Not legal advice; operator's own read of
  `anthropic.com/legal/terms` is the final word if ever in doubt.
- **`grill-me`'s local wrapper was broken** (pointed at a `grilling` skill
  from `mattpocock/skills` that was never actually installed, despite the
  build spec's Section 5 saying to install it) — fixed mid-session by the
  operator installing the marketplace properly. Worth a quick sanity check
  that `to-spec`/`to-tickets`/`to-questionnaire` aren't stale wrappers too,
  next time one of them is invoked.
- **Done when**: I can open the panel on a client's record, ask it something
  true about that client, paste a DM thread and get a reply plus a pending
  CRM-write card, approve it, and see it land as a timeline entry on that
  client.
