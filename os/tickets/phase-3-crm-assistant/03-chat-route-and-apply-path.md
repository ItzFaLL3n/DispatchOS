# 03: Chat route + guardrailed apply path

**What to build:** The Vercel-side brain: the route the UI actually talks to.
Persists the conversation, calls the worker, classifies whatever it proposes,
auto-applies what's eligible, and hands back whatever still needs a human.
This is the only place in the whole phase that writes to Supabase.

**Blocked by:** 01, 02.

**Status:** done - live-verified end-to-end (real local worker + real Supabase)

- [x] `app/api/assistant/message/route.ts` — `POST` handler: appends the
      user's message (`assistantMessages`), calls the worker's
      `/assistant/message` with the thread's recent history, appends the
      assistant's reply. For each proposed action: `classifyAction()` →
      `auto-eligible` **and** auto mode on (passed in the request) → apply
      immediately via `applyAction()`; otherwise leave it `pending` in the
      response.
- [x] `app/api/assistant/approve/route.ts` — `POST` handler: takes a pending
      action from the client and runs it through the exact same `applyAction()`
      as the auto-apply branch — one apply function, two callers.
- [x] Corrected from the ticket's own original wording: `agent_runs` (kind
      `assistant`) logs **once per successful worker call**, not once per
      applied action — matches Phase 2's "this is how I find out what a call
      actually costs" convention (a pure-Q&A call with zero proposed actions
      still burns real tokens and needs logging). `client_events` (kind
      `ai-action`) logs once per *applied* action instead, and only when the
      action wouldn't otherwise leave a timeline trace — a
      `propose_create_client_event` action already creates a real note/touch/
      ascension-signal entry itself, so no redundant `ai-action` wrapper on
      top of it (verified live: exactly one row, not two).
- [x] `lib/assistant/applyPlan.ts` (pure) + `lib/assistant/applyAction.ts`
      (server-only, the actual `lib/data/*` calls). Real correctness point:
      a client-update action touching `phase`/`phaseSubstate`/`nextActionAt`/
      `nextActionNote`/`doNotPitchUntil`/`buildStatus` must route through
      `applyPhaseUpdate` (which stamps `phase_updated_at` and auto-logs a
      `phase-change`/`system` event), never plain `updateClient` — a mixed
      action (some hard-rule fields, some plain fields) splits into both
      calls. `ai-action` events use a raw insert (`getSupabaseAdmin` directly,
      same precedent as `applyPhaseUpdate`'s own `phase-change`/`system`
      writes) since `ai-action` is app-written, deliberately outside
      `createClientEvent`'s `UserEventKind`-typed surface.
- [x] Unit tests (TDD) for `applyPlan.ts`: every action kind routes to the
      right `lib/data/*` call, the phase-tracker/plain-field split (including
      `buildStatus` going to `applyPhaseUpdate`, not `updateClient`), the
      client-event-vs-summarized-entry distinction. 15 tests, all green.
- [x] **Real gap found and fixed**: `clientId` never reached the worker at
      all — the route dropped it before calling `callWorker`, and the worker
      had no concept of "the client this conversation is about." A live test
      surfaced it immediately ("Which client is this note for?"). Fixed by
      threading `clientId` through `callWorker` → the worker's request body →
      a context line prepended to the prompt telling the model to call
      `get_client` with that id itself.
- [x] **Real gap found and fixed (2)**: ticket 02's `isSeparatelyAuthedPath`
      exemption was scoped to the whole `/api/assistant` prefix, which would
      have also skipped the session-cookie gate for these two
      operator-facing routes (reached from the browser, not the worker) —
      narrowed to `/api/assistant/data` only. Verified live: `/approve`
      without a cookie 307-redirects to `/login`, exactly like every other
      protected route.
- [x] Live-smoke verification (real local worker + real web app + real
      Supabase, disposable seed script + manual cleanup after): a low-stakes
      action with auto mode on applies immediately, correct single
      `client_events` row, correct `agent_runs` row; a hard-rule-adjacent
      action (`retainerStatus`) stays `pending` even with auto mode on;
      approving it applies it and logs the `ai-action` summary; a mixed
      action (`phase` + `notes`) correctly splits into both an
      `applyPhaseUpdate` call (with its own auto `phase-change` event) and an
      `updateClient` call, plus one `ai-action` summary covering both fields;
      the general (`clientId: null`) thread works; malformed requests on
      both routes get clean 400s.
