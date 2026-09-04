# 03: /api/generate-post route

**What to build:** The route handler that makes Live AI mode real: a real
Claude call through `@anthropic-ai/sdk`, group `rules_notes` folded in, silent
fallback to the template on any failure, every successful call logged to
`agent_runs`.

**Blocked by:** 02 (needs `templateGenerate` + the content-rules prompt).

**Status:** done - live-verified except the real-AI-success path (no key available this session)

- [x] `@anthropic-ai/sdk` added to `web/`'s dependencies.
- [x] `ANTHROPIC_API_KEY` added to `serverEnv` (`lib/env.ts`, same
      `required()` fail-fast pattern) and documented in `.env.example`.
- [x] `lib/ai/postResponse.ts` (pure, no `server-only`) +
      `lib/ai/generatePost.ts` (server-only, thin wrapper supplying the real
      Anthropic client): builds the user prompt (append group rules notes
      when present), calls the Messages API with model `claude-sonnet-5` and
      the content-rules system prompt, strips ` ```json ` fences
      defensively, `JSON.parse`s, validates both `gifVersion`/`normalVersion`
      are non-empty strings — throws on anything else. Split into two files
      because `import "server-only"` in `lib/env.ts` throws at module-load
      time in Vitest, which would have made the whole prompt/response
      boundary untestable in one file — see file-header comments.
- [x] `lib/data/agentRuns.ts` — `createAgentRun(input)`, thin insert into
      `agent_runs` following the existing data-layer pattern
      (`snakeizeKeys`/mapper/throw-with-context).
- [x] `app/api/generate-post/route.ts` — `POST` handler:
      - `mode: 'template'` → `templateGenerate()` directly, no network call,
        no `agent_runs` row.
      - `mode: 'ai'` → `generatePost()`; success → write `agent_runs`
        (`kind: 'post'`, tokens in/out from the response `usage`, model,
        input = request ctx, output = parsed result), respond
        `{ result, usedTemplate: false }`; any failure → fall back to
        `templateGenerate()`, respond `{ result, usedTemplate: true }`, no
        `agent_runs` row — 200 either way, this is a handled path.
      - `groupId` present → look up the group via `listGroups()`, pass its
        `rulesNotes` through; an unknown/missing id is treated as "no group",
        not an error.
- [x] Unit tests (TDD) for the prompt/response boundary (`postResponse.ts`)
      with the network call injected: fence-stripping with/without fences,
      malformed JSON throws, a missing/empty required key throws, group
      rules notes present vs absent (and blank-string) in the built prompt,
      multi-block text joining. 17 tests, all green.
- [x] Live-smoke verification (disposable scripts, deleted after): template
      mode; AI mode with **no key set** (confirms the silent-fallback path —
      `usedTemplate: true`, 200, zero `agent_runs` rows written); AI mode
      with a `groupId` (confirms the group lookup doesn't error mid-fallback);
      an unknown `groupId` (treated as no group, not an error); a malformed
      request (400). **Not verified this session: the real-AI-success path**
      — no `ANTHROPIC_API_KEY` is set locally, so the actual Claude call and
      its `agent_runs` row are unverified. Needs the operator to add a real
      key to `.env.local` (and Vercel, at deploy time) and confirm once.
