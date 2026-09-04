# 03: Chat route + guardrailed apply path

**What to build:** The Vercel-side brain: the route the UI actually talks to.
Persists the conversation, calls the worker, classifies whatever it proposes,
auto-applies what's eligible, and hands back whatever still needs a human.
This is the only place in the whole phase that writes to Supabase.

**Blocked by:** 01, 02.

**Status:** ready-for-agent

- [ ] `app/api/assistant/message/route.ts` — `POST` handler: appends the
      user's message (`assistantMessages`), calls the worker's
      `/assistant/message` with the thread's recent history, appends the
      assistant's reply. For each proposed action: `classifyAction()` →
      `auto-eligible` **and** auto mode on (passed in the request) → apply
      immediately via the matching `lib/data/*` function, log a
      `client_events` row (`kind: 'ai-action'`) and an `agent_runs` row
      (`kind: 'assistant'`); otherwise leave it `pending` in the response.
- [ ] `app/api/assistant/approve/route.ts` — `POST` handler: takes a pending
      action (from the client, since v1 has no server-side pending-action
      store) and runs it through the exact same apply path as the auto-apply
      branch above — one apply function, two callers, not two
      implementations.
- [ ] Every applied action (either route) writes the `client_events` +
      `agent_runs` pair — no action applies without both.
- [ ] Unit tests (TDD) for the apply-path pure parts: given a classified
      action, the correct `lib/data/*` call is chosen; a rejected/pending
      action never calls anything.
- [ ] Live-smoke verification (disposable script): a low-stakes action with
      auto mode on applies and both log rows exist; the same action with auto
      mode off comes back pending; a hard-rule-adjacent action comes back
      pending regardless of auto mode; approving a pending action applies it.
