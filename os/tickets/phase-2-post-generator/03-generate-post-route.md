# 03: /api/generate-post route

**What to build:** The route handler that makes Live AI mode real: a real
Claude call through `@anthropic-ai/sdk`, group `rules_notes` folded in, silent
fallback to the template on any failure, every successful call logged to
`agent_runs`.

**Blocked by:** 02 (needs `templateGenerate` + the content-rules prompt).

**Status:** ready-for-agent

- [ ] `@anthropic-ai/sdk` added to `web/`'s dependencies.
- [ ] `ANTHROPIC_API_KEY` added to `serverEnv` (`lib/env.ts`, same
      `required()` fail-fast pattern) and documented in `.env.example`.
- [ ] `lib/ai/generatePost.ts` — `generatePost(ctx, { groupRulesNotes })`:
      builds the user prompt (append group rules notes when present), calls
      the Messages API with model `claude-sonnet-5` and the content-rules
      system prompt, strips ` ```json ` fences defensively, `JSON.parse`s,
      validates both `gifVersion`/`normalVersion` are non-empty strings —
      throws on anything else.
- [ ] `lib/data/agentRuns.ts` — `createAgentRun(input)`, thin insert into
      `agent_runs` following the existing data-layer pattern
      (`snakeizeKeys`/mapper/throw-with-context).
- [ ] `app/api/generate-post/route.ts` — `POST` handler:
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
- [ ] Unit tests (TDD) for `generatePost.ts`'s pure parts with the network
      call injected: fence-stripping with/without fences, malformed JSON
      throws, a missing required key throws, group rules notes present vs
      absent in the built prompt.
- [ ] Live-smoke verification (disposable script, deleted after, matching
      Phase 1's "Option C"): template mode with no key; AI mode with a real
      key (confirm a real `agent_runs` row, then delete it); AI mode with a
      deliberately invalid key (confirm the silent fallback).
