# 02: Assistant read routes + worker scaffold

**What to build:** The two halves of the "no second copy of the service-role
key" split — a handful of read-only Vercel routes the worker calls for CRM
context, and the worker itself (its own deployable, `@anthropic-ai/claude-agent-sdk`,
authenticated via the operator's Claude subscription).

**Blocked by:** 01 (worker's propose-tools return actions shaped for the
guardrail classifier).

**Status:** code done + locally verified end-to-end; deploy is pending on the operator

- [x] `app/api/assistant/data/route.ts` — single dispatch route (`{tool, args}`
      body), read-only, shared-bearer-secret protected (`Authorization: Bearer`,
      constant-time compare via the existing `safeEqual`), wraps existing
      `lib/data/*` functions: `search_clients` (substring match on business/
      contact name), `get_client`, `list_groups`, `list_open_todos`. No write
      path — writes only ever happen through the app-side apply path
      (ticket 03).
- [x] **Real gap found and fixed**: `proxy.ts` gated this route behind the
      session cookie like every other route — but the worker has no browser
      cookie, only the bearer secret. Added
      `isSeparatelyAuthedPath()`/`SEPARATELY_AUTHED_PREFIXES` to
      `authPolicy.ts` (`/api/assistant/*` skips the cookie gate, enforces its
      own auth instead) — unit tested.
- [x] `WORKER_SHARED_SECRET` env var, added to `serverEnv`, documented in
      `.env.example`.
- [x] `worker/` — new top-level directory, own `package.json`, not part of
      `web/`'s dependency tree. Plain Node `http` server (no framework —
      less code, and one endpoint doesn't need one).
- [x] `POST /assistant/message` — validates the shared secret, runs `query()`
      with `tools: []` (all built-in Agent SDK tools disabled) +
      `settingSources: []` (SDK isolation — see the bug below) + the custom
      `crm` MCP server: read tools (`search_clients`, `get_client`,
      `list_groups`, `list_open_todos` — call the read route over HTTPS) and
      propose tools (`propose_client_update`, `propose_create_todo`,
      `propose_create_client_event` — pure, return `{proposed: true}` to the
      model; the actual `ProposedAction` is built from the `tool_use` block's
      own `input` in the message loop, not from the handler's return value).
      Returns `{ reply, proposedActions, model, tokensIn, tokensOut }`.
- [x] System prompt includes the actual phase 1–10 legend (from
      `os/knowledge/intake-playbook.md`) and explicit "you are headless, call
      tools immediately, never just narrate a plan" framing — both needed
      after live testing surfaced real problems (see bugs below).
- [x] Auth: reads `CLAUDE_CODE_OAUTH_TOKEN` from its own environment (a local
      `SKIP_OAUTH_CHECK_FOR_LOCAL_TEST` escape hatch exists for dev inside an
      already-authenticated Claude Code session — documented in
      `worker/README.md`, inert unless that exact var is set, so a real
      deploy always requires the real token).
- [x] Live-verified **locally, end-to-end**: `web/` and `worker/` both run
      locally (`worker`'s `VERCEL_APP_URL` pointed at `localhost`), a seeded
      test client, real `query()` calls (ambient session auth, not a
      subscription token — ticket doesn't require a real deploy to prove the
      code works). Confirmed: auth (401 on missing/wrong secret, 400 on
      malformed body), a real question gets the real phase + correctly
      respects `doNotPitchUntil` as a hard block, a propose-flow request
      returns a correctly-shaped `ProposedAction`, multi-turn history threads
      correctly.
- [ ] **Operator action, not buildable by me**: `claude setup-token` (your
      own login), create a Render account, deploy `worker/` per its README,
      tell me the URL so `ASSISTANT_WORKER_URL` (ticket 03) can be set.

## Bugs found and fixed during live verification

- **`z.record(z.string(), z.unknown())` silently breaks the entire MCP
  server's tool registration** — not just the one tool using it. With it in
  `propose_client_update`'s schema, `system init`'s `tools` array came back
  completely empty (all 7 tools gone, not just the bad one), and the model
  responded by *hallucinating* a fake tool-call transcript as plain text
  instead of erroring. Bisected by testing 1/4/6/7 tools at a time. Fixed by
  replacing the open record with `propose_client_update`'s actual explicit
  field list (mirrors `ClientWritable` + the phase-tracker fields) — more
  correct anyway, since the model now gets a real schema instead of a blank
  bag, at the cost of maintaining two field lists in sync (this one and
  `clientInput.ts`'s) rather than one.
- **Ambient project settings leaked into the agent's behavior.** Running the
  worker from a `cwd` inside this repo, without `settingSources: []`, let it
  discover and load this session's own `.claude/settings.json` — it referred
  to "browser tooling" that was never part of its own tool set. Fixed with
  `settingSources: []` (SDK isolation mode); this matters even more once
  actually deployed, where `cwd` won't be inside this repo at all, but the
  bug would otherwise resurface for any local dev/testing.
- **The model narrated a plan instead of executing tools**, inconsistently,
  even with tools correctly registered — reflex behavior from being trained
  for an interactive terminal where a human is watching the plan before
  approving it. Fixed with an explicit "you are headless, no one is watching
  you narrate — call tools immediately or you've failed" system-prompt
  instruction. Not airtight (LLM behavior, not a hard constraint) but
  reliable across repeated tests after the fix.
