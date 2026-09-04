# Agent SDK on Vercel serverless — spike findings

Spec: `os/specs/0002-phase-2-post-generator.md`, ticket
`os/tickets/phase-2-post-generator/01-agent-sdk-serverless-spike.md`.
Front-loaded per `os/_source/dispatch-os-build-spec.md` §2 so Phase 3's
architecture (pipeline auditor, prospect recon) isn't designed on an
unverified assumption. Phase 2 itself never touches the Agent SDK.

**Verdict: don't run it inside a Vercel Node serverless function. Use the
Section-2 fallback (a small always-on Node worker) for Phase 3.**

Confidence: high on the size/latency numbers below (measured directly, not
estimated). Not fully deploy-confirmed — that needs a live Vercel push, which
needs a separate go-ahead per the standing no-push-without-asking rule. The
numbers here make the outcome close to certain regardless.

## What was tested

`@anthropic-ai/claude-agent-sdk` (v0.3.260) installed in a scratch project
(not added to `web/`), a minimal `query()` call run locally to confirm it
works and to inspect how it locates and spawns its CLI binary.

## How the SDK spawns Claude Code

The package ships **no binary directly** — it has one optional dependency per
platform (`@anthropic-ai/claude-agent-sdk-{platform}-{arch}[-musl]`), each
containing a single compiled `claude` executable. `extractFromBunfs.js`
(bundled unbundled, Node-importable, no Bun globals) extracts that binary from
Bun's embedded virtual filesystem to a real path before spawning it as a
subprocess — child processes can't read Bun's `$bunfs`/`~BUN` virtual paths
directly. The extraction target is `{tmpdir()}/claude-{uid}/claude-agent-sdk-{hash}/`,
content-hash-named so repeat runs of the same version reuse the extracted
file. This part is Vercel-compatible in principle: serverless functions get a
writable `/tmp` (ephemeral per instance, not the deployment bundle itself),
and the SDK already targets exactly that.

## Why it still doesn't fit

**1. Binary size vs. Vercel's function size cap.** The platform binary alone:

| Platform | Size |
|---|---|
| `linux-x64` (what Vercel's Node runtime is) | 214,687,216 bytes (≈ 205 MB) |
| `linux-arm64` | 214,228,392 bytes (≈ 204 MB) |
| `win32-x64` (measured directly here) | 217,771,680 bytes (≈ 208 MB) |

(Sizes from the package's own `manifest.json`; the win32 figure was verified
by `ls -la` on the actually-installed file, byte-identical to the manifest.)

Vercel's Node.js serverless functions have a **250 MB uncompressed** deployment
size limit per function, unchanged across plans. A single ~205 MB binary
leaves roughly 45 MB for the rest of the function — the entire Next.js
server bundle, React, every other `node_modules` dependency actually traced
into that function (`@supabase/supabase-js`, `@anthropic-ai/sdk`, etc.), and
whatever else `@vercel/nft` pulls in. This does not fit. Even isolating the
Agent SDK into its own single-purpose route (so it isn't bundled with the
whole app) doesn't create enough headroom — the binary alone is most of the
budget by itself, before a single line of the SDK's own JS or its
`@anthropic-ai/sdk`/`@modelcontextprotocol/sdk`/`zod` peer deps are counted.

**2. Extraction is a real-time cost on every cold start.** A serverless
instance's `/tmp` doesn't persist across cold starts (a fresh container has an
empty `/tmp`). So the ~205 MB write-to-disk-then-spawn sequence in
`extractFromBunfs.js` isn't a one-time setup cost, it happens on every cold
start — stacked on top of Next.js's own cold-start time, this risks running
into Vercel's execution timeout (10s default on Hobby; configurable higher on
Pro/Enterprise, but still a real ceiling for what should be a nightly-cron or
on-demand request, not a multi-second binary unpack).

**3. Bundle tracing risk, independent of the above.** Even if the size
problem were solved, Next.js's `@vercel/nft` file-tracer has to correctly
follow the SDK's Bun-embedded-binary-extraction path to include the platform
package in the function's bundle at all. This is a known rough edge for any
package that resolves its real payload dynamically at runtime rather than via
a static `require`/`import` — not confirmed broken here, just an additional
risk layered on top of a plan that's already dead on arrival by size alone.

## What this settles for Phase 3

Per the build spec's own fallback: **keep the Next.js app on Vercel, run the
Agent SDK work (pipeline auditor, prospect recon) on a small always-on Node
worker** (Railway, Fly, Render — anything with a persistent filesystem and no
per-function size cap), called from the Vercel app over HTTP. That worker is
exactly where the 205 MB binary belongs — extracted once, reused across
requests, no cold-start tax.

## What a live deploy would still confirm, if ever wanted

Not attempted here (needs a push). Only worth doing if this verdict is ever
in doubt: deploy a single throwaway route on the Agent SDK to Vercel and
observe whether the build even completes (most likely failure: the deploy
itself rejected for exceeding the size cap, before any cold-start question is
reached).
