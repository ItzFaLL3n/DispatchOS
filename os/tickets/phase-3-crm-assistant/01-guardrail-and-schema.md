# 01: Guardrail classifier + schema

**What to build:** The safety core everything else in this phase sits on top
of — the pure function that decides whether a proposed CRM write can
auto-apply or must always wait for a human confirm, plus the schema changes
every later ticket needs (new `client_events`/`agent_runs` kinds, the
`assistant_messages` table). No worker, no UI yet — this is the seam that
makes the rest of the phase testable in isolation.

**Blocked by:** None (can start immediately).

**Status:** done - live-verified against real Supabase

- [x] `client_events.kind` check constraint gains `'ai-action'` (migration
      `0002_phase3_assistant.sql`, additive — applied by the operator via the
      Supabase SQL editor, same manual process as `0001`).
- [x] `agent_runs.kind` check constraint gains `'assistant'` (same
      migration).
- [x] New table `assistant_messages`: `id, client_id uuid null, role text
      (user|assistant), content text, proposed_actions jsonb null,
      created_at`. One ongoing thread per `client_id` (null = general
      thread).
- [x] `lib/data/assistantMessages.ts` — `listMessages(clientId)`,
      `appendMessage(input)`, same thin shape as every other data-layer file.
- [x] `lib/assistant/guardrail.ts` — `classifyAction(action) → 'auto-eligible' | 'always-confirm'`.
      A client update touching **any** of `retainerStatus`, `phase`,
      `phaseSubstate`, `doNotPitchUntil` classifies as `always-confirm`, even
      if it also touches auto-eligible fields in the same action (one
      protected field taints the whole action). Any delete of any entity is
      `always-confirm`. Everything else (client_events create, todo
      create/update, non-hard-rule client fields) is `auto-eligible`.
- [x] Unit tests (TDD): every always-confirm field individually, a mixed
      action (one protected + one unprotected field → always-confirm), every
      auto-eligible action type, a delete of each entity type. 12 tests, all
      green.
- [x] Also fixed: `Timeline.tsx`'s exhaustive `Record<EventKind, string>`
      label map (TypeScript correctly caught the missing `'ai-action'` case
      at compile time).
- [x] Live-verified against real Supabase (disposable script, deleted
      after): both new kind values accepted, pre-existing kind values
      (`note`) still accepted after the constraint replace, general-thread
      and client-scoped `assistant_messages` inserts, `proposed_actions`
      jsonb round-trips, FK cascade removes a client's `assistant_messages`
      on delete.
