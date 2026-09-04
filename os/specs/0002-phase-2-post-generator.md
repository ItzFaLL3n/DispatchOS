---
spec: 0002
title: Phase 2 — Post generator (Creator, real key)
status: ready-for-tickets
created: 2026-09-04
related: os/decisions/0001-os-folder-structure.md, os/specs/0001-phase-1-crm-port.md
supersedes-scope-from: os/_source/dispatch-os-build-spec.md (Phase 2)
---

# Phase 2 — Post generator (Creator, real key)

> Published locally per ADR 0001. `to-tickets` consumes this file next.

## Problem Statement

The artifact's Post Creator only works inside the Claude.ai sandbox — the
"Live AI" toggle calls `api.anthropic.com` directly from client JS with no
key, which is why it silently falls back to the template generator outside
that sandbox. Dispatch OS has no working generator at all right now (`/creator`
is a Phase-2 stub). I need Creator to actually generate on-brand outreach
posts from a real API key, server-side, respecting a specific group's posting
rules when I'm generating for one.

Scope decision (asked, answered): **Creator only.** Library and Schedule stay
`ComingSoon` stubs — there's no persistence step in this phase, generated text
is copy-only. The `posts` table stays unused until whichever phase actually
builds save/schedule/library.

Scope decision (asked, answered): **do the Agent SDK serverless spike now**,
even though Phase 2 itself only needs the plain Messages API — front-loading
it per the build spec's explicit instruction, so Phase 3 isn't blind to it.

## Solution

- A **serverless spike**: confirm (as far as possible without a Vercel deploy,
  which needs a separate push go-ahead) whether `@anthropic-ai/claude-agent-sdk`
  can run inside a Vercel Node serverless function. Findings recorded in
  `docs/agents/agent-sdk-serverless.md`. Informational only — doesn't block
  the rest of Phase 2, which never touches the Agent SDK.
- A pure **prompt-building module**: the canonical content rules from
  `os/knowledge/content-rules.md` compiled into the system prompt, plus the
  offline template generator ported verbatim from the artifact's
  `templateGenerate()`.
- **`POST /api/generate-post`** — a Next.js route handler. Real key →
  `@anthropic-ai/sdk` single-shot call, JSON-parsed, defensively fence-stripped.
  Any failure (missing key, request error, bad JSON) → same-shape template
  fallback, same as the artifact's try/catch, no user-visible error. Every
  real API call logged to `agent_runs`.
- **Creator page**: mode toggle (Live AI / Template), the same input fields as
  the artifact (niche, offer, spots, cost phrasing, extra context) plus a
  group selector — selecting a group pulls its `rules_notes` into the prompt.
  Output panel shows both versions with copy-to-clipboard. No save step.

## User Stories

1. As the operator, I want to generate a post from real Claude output, so
   that Creator actually works outside the Claude.ai sandbox.
2. As the operator, I want a Template mode that never calls the API, so that
   I can generate offline or without burning a token when I just need
   something quick and know the shape.
3. As the operator, I want Live AI mode to fall back to the template silently
   (with a toast, not an error page) if the API call fails for any reason, so
   that a bad key or a network blip never blocks me from getting a post.
4. As the operator, I want to pick a group before generating, so that its
   `rules_notes` (its own posting-rules quirks) get folded into the prompt.
5. As the operator, I want every real AI call logged — tokens in/out, model,
   input, output — so that I can see what the generator actually costs me
   over time.
6. As the operator, I want both generated versions (gif post, normal) shown
   with a one-click copy each, so that I can paste straight into Facebook.
7. As the operator, I want the generated tone, CTA rules, and offer framing to
   always match `content-rules.md` — no outcome promises, no blocklisted CTAs,
   swappable cost phrase, lead with the deliverable not a business result —
   so that a generated post never violates a hard rule by construction.
8. As the operator, I want to know, before Phase 3 needs the answer, whether
   the Agent SDK's native binary can run in a Vercel serverless function, so
   that the pipeline auditor's architecture isn't designed on an unverified
   assumption.

## Implementation Decisions

### Architecture

- **Single-shot AI:** `@anthropic-ai/sdk` (Messages API), added to `web/`'s
  dependencies. New route handler only — no server actions, no Agent SDK, no
  subagents. Matches the build spec's Section 2 rule (single-shot → Messages
  API, runs fine in a Next.js route handler).
- **Model:** `claude-sonnet-5` (current). The artifact's hardcoded
  `claude-sonnet-4-6` was a placeholder for whatever model existed when that
  prototype was written — not a real current model id. Not hardcoded in two
  places: one `const` in the route module.
- **Env var:** `ANTHROPIC_API_KEY`, added to `serverEnv` in `lib/env.ts`
  alongside the existing vars, same `required()` fail-fast pattern. Documented
  in `.env.example`. Never read on the client.
- **Agent SDK spike is a standalone investigation, not a `web/` dependency.**
  `@anthropic-ai/claude-agent-sdk` is not added to `web/package.json` in this
  phase — Phase 2 doesn't use it, and adding an unused dependency is dead
  weight. The spike runs in a scratch location, findings land in
  `docs/agents/agent-sdk-serverless.md` (a durable repo doc, not scratch).

### Modules

- **`lib/ai/contentRules.ts`** — exports the system-prompt text as a single
  constant, built from `os/knowledge/content-rules.md` + `hard-rules.md`
  (no outcome promises, one ask per message doesn't apply to a single post but
  the rest does). This is the file that must stay in sync with those two
  knowledge docs — a comment says so, pointing at both paths.
- **`lib/ai/templateGenerate.ts`** — pure function, ported 1:1 from the
  artifact's `templateGenerate(ctx)`. Same output shape as the AI path:
  `{ gifVersion, normalVersion }`. No I/O, the primary test seam.
- **`lib/ai/generatePost.ts`** — `generatePost(ctx, { groupRulesNotes })`:
  builds the user prompt (niche, offer, spots, cost phrase, extra context,
  plus the group's rules notes appended when present), calls
  `@anthropic-ai/sdk`, strips fences, `JSON.parse`s, validates the shape has
  both string fields — throws on anything else so the route can catch and
  fall back. Model and system prompt live here, not duplicated in the route.
- **`app/api/generate-post/route.ts`** — `POST` handler. Body:
  `{ niche, offerType, spots, costPhrase, extra, groupId?, mode: 'ai'|'template' }`.
  `mode: 'template'` → `templateGenerate()` directly, no network call, no
  `agent_runs` row (nothing to log — no API call happened). `mode: 'ai'` →
  `generatePost()`; on success, write `agent_runs` (`kind: 'post'`,
  `tokens_in`/`tokens_out` from the API response's `usage` field, `model`,
  `input` = the request ctx, `output` = the parsed result) and return
  `{ result, usedTemplate: false }`; on any failure, fall back to
  `templateGenerate()` and return `{ result, usedTemplate: true }` — no
  `agent_runs` row on the fallback path (no successful call to log), 200
  either way (this is an expected, handled path, not an error response).
  When `groupId` is present, `listGroups()` is queried and the matching
  group's `rulesNotes` is passed through — an unknown/missing `groupId` is
  treated as "no group" rather than an error.
- **`components/creator/Creator.tsx`** — client component. Mirrors
  `TodoList.tsx`'s shape: local `useState` for the mode toggle and form
  fields (this is transient generation input, not persisted, so plain
  `useState` is right — no `useActionState`/server action here, the route is
  called with `fetch`), a group `<select>` sourced from `listGroups()` (passed
  in as a server-fetched prop, same pattern as Creator's group data would be
  fetched in `page.tsx`), an output panel with the two generated versions and
  a copy button each (`navigator.clipboard.writeText`), a status line while
  generating (`asking claude...` in AI mode, matching the artifact's copy).
- **`app/(app)/creator/page.tsx`** — replaces the `ComingSoon` stub. Fetches
  `listGroups()`, renders `PageHeader` + `<Creator groups={...} />`.

### Data layer

- **`lib/data/agentRuns.ts`** — `createAgentRun(input)`, a thin insert into
  `agent_runs`, same shape as every other data-layer function
  (`snakeizeKeys`, `mapAgentRunRow`, throw with context on error). No list/
  read functions yet — nothing surfaces `agent_runs` in the UI this phase.

### Behaviour decisions

- **Fallback is silent to the user in outcome, visible in mechanism**: the
  UI shows a toast ("Live AI generation failed — used template instead", the
  artifact's exact copy) but still renders a usable result. Never a dead end.
- **Template mode never touches `agent_runs`** — it's not an agent call, it's
  a pure function. Of the AI-mode attempts, only a *successful* call gets
  logged: matches "this is how I find out what the tool actually costs" (a
  failed call spent no completion tokens worth tracking; the fallback's
  template output isn't an agent output either way).
- **Group rules_notes** are appended to the user prompt, not the system
  prompt — they're per-request context (this generation, this group), not a
  standing rule change.
- **No edit-before-copy.** Matches the artifact: regenerate, don't inline-edit
  the output text.

## Testing Decisions

- **Primary seam — `templateGenerate`.** Full unit coverage: every
  `offerType` × `costPhrase` combination that changes the sentence shape,
  the `spots`/`niche` interpolation, output shape always
  `{ gifVersion, normalVersion }` as strings.
- **Secondary seam — the prompt/response boundary in `generatePost.ts`.**
  Unit-test the pure parts with the network call injected/mocked: fence
  stripping (with and without ` ```json ` fences), malformed JSON throws,
  missing a required key throws, the group `rulesNotes` appears in the built
  user prompt when present and is absent when not.
- **Route handler** — thin; covered by one disposable live-smoke script (real
  key, template mode with no key present, AI mode with a real key, AI mode
  with a deliberately broken key to prove the fallback path), same "Option C"
  convention as Phase 1 — no dedicated test harness, delete the script after,
  clean up any `agent_runs` rows it wrote.
- **Not tested:** the Creator component's clipboard interaction (manual
  verify only, `navigator.clipboard` is awkward to unit test and low-risk).
- **Agent SDK spike** is a research ticket, not a test — its output is a
  findings doc, not a passing suite.
- **Runner:** Vitest, consistent with Phase 1.

## Out of Scope

- Library and Schedule pages — stay `ComingSoon` stubs.
- Saving a generated post anywhere (`posts` table stays unused).
- A live Vercel deploy to fully confirm the Agent SDK spike — that needs a
  push, which needs a separate go-ahead; the spike ticket does everything
  short of that and states its confidence level plainly.
- Reading skills from `.claude/skills/` at runtime — the Messages API has no
  skill-loading mechanism; `content-rules.md` is compiled into the prompt at
  the source-code level instead, with an explicit sync comment.
- DM Copilot, pipeline auditor, site builder — Phase 3/4.
- Any change to `groups`/`clients`/`todos` UI — untouched this phase.

## Further Notes

- **Model id correction**: the migration comment
  `-- posts (table created, unused until Phase 4)` is stale/wrong — the build
  spec is unambiguous that the post generator is Phase 2. Corrected as part of
  this ticket set (comment only, no schema change).
- **`fb-post-writer` skill stays as-is.** It's the Agent-SDK-facing version of
  these same rules (for whenever an agent actually loads skills — Phase 3+).
  This phase's route handler is a separate, hand-written system prompt built
  from the same canonical source, because a plain Messages API call has no
  skill loader. Both must stay in sync with `content-rules.md` — that's
  already stated as the sync point in the knowledge doc itself.
- **Done when:** I can open `/creator`, pick Live AI, generate a post for a
  real niche/offer/group, get back on-brand copy that respects that group's
  rules_notes, and copy it — with a real `agent_runs` row to show for it.
