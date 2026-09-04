# 02: Assistant read routes + worker scaffold

**What to build:** The two halves of the "no second copy of the service-role
key" split — a handful of read-only Vercel routes the worker calls for CRM
context, and the worker itself (its own deployable, `@anthropic-ai/claude-agent-sdk`,
authenticated via the operator's Claude subscription).

**Blocked by:** 01 (worker's propose-tools return actions shaped for the
guardrail classifier).

**Status:** ready-for-agent

- [ ] `app/api/assistant/data/[resource]/route.ts` (or one route per
      resource, whichever reads cleaner) — read-only, shared-bearer-secret
      protected, wraps existing `lib/data/*` functions: search/get clients,
      list groups, list open todos. No write routes here — writes only ever
      happen through the existing app-side apply path (ticket 03).
- [ ] `WORKER_SHARED_SECRET` env var, added to `serverEnv`, documented in
      `.env.example`.
- [ ] `worker/` — a new top-level directory, its own `package.json`, **not**
      part of the `web/` Next.js app or its dependency tree. Plain Node HTTP
      server (or a minimal framework — operator's call if asked, otherwise
      plain `http`/`express`, whichever is less code).
- [ ] `POST /assistant/message` — the one endpoint. Validates the shared
      secret, runs `query()` with: no built-in Agent SDK tools
      (Read/Write/Edit/Bash/Glob/Grep/WebSearch all disabled), and the
      custom read tools (`search_clients`, `get_client`, `list_groups`,
      `list_open_todos` — calling the ticket's own read routes over HTTPS)
      plus the propose tools (`propose_client_update`,
      `propose_create_todo`, `propose_create_client_event` — pure, return a
      structured action, never call anything). Returns the assistant's text
      reply plus any proposed actions.
- [ ] Auth: reads `CLAUDE_CODE_OAUTH_TOKEN` from its own environment.
      **Operator action, not buildable by me**: run `claude setup-token`
      locally (requires your own Claude subscription login) and set the
      resulting token as a secret on whichever host you deploy to.
- [ ] **Operator action, not buildable by me**: create the hosting account
      (Render free tier per the earlier cost discussion, unless you'd rather
      pick differently) and do the actual deploy. I'll hand you the
      deployable code, a Dockerfile/config if the host wants one, and the
      exact env vars it needs.
- [ ] Live-smoke verification once deployed: a real request with the correct
      secret succeeds, a request with a wrong/missing secret is rejected, a
      read tool call round-trips through the Vercel read routes correctly.
