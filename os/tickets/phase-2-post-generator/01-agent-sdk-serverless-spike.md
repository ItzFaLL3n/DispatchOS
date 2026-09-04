# 01: Agent SDK serverless spike

**What to build:** A findings doc answering whether
`@anthropic-ai/claude-agent-sdk`'s native Claude Code binary can run inside a
Vercel Node serverless function — front-loaded now per the build spec, so
Phase 3 (pipeline auditor) isn't designed on an unverified assumption. Purely
informational; nothing else in Phase 2 depends on the Agent SDK.

**Blocked by:** None (can start immediately).

**Status:** done - verdict: doesn't fit, use the worker fallback for Phase 3

- [x] `@anthropic-ai/claude-agent-sdk` installed in a scratch location (not
      added to `web/package.json` — Phase 2 doesn't use it).
- [x] A minimal `query()` call run locally to confirm the package works at
      all and to observe how it locates/spawns its native binary.
- [x] Research (package internals + Vercel's Node serverless runtime docs)
      on whether that spawn pattern is compatible with Vercel's read-only
      deployment filesystem + `/tmp`-only-writable constraint.
- [x] Findings written to `docs/agents/agent-sdk-serverless.md`: a clear
      verdict (works / doesn't / unconfirmed) with the reasoning, and — if
      not fully confirmable without a live deploy — what a real deploy test
      would need to settle it, stated plainly rather than guessed at.
      (Verdict: **doesn't fit** — the platform binary alone is ~205MB against
      Vercel's 250MB function size cap. High confidence from measured sizes,
      not a live-deploy confirmation.)
- [x] No change to `web/`'s dependencies or any deployed code.
