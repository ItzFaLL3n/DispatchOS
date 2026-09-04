# 02: Template generator + content-rules prompt module

**What to build:** The two pure modules everything else in this phase sits on
top of — the offline template generator (ported from the artifact) and the
system-prompt text compiled from `content-rules.md`/`hard-rules.md`. No I/O,
no network, no UI. This is the primary test seam for the phase.

**Blocked by:** None (can start immediately).

**Status:** done - verified via unit tests, two artifact bugs fixed in the port

- [x] `lib/ai/templateGenerate.ts` — pure `templateGenerate(ctx)` ported from
      the artifact's version (niche, offerType, spots, costPhrase →
      `{ gifVersion, normalVersion }`), covering all three `offerType` values
      and the `free` vs non-`free` cost-phrase sentence shape. Two bugs found
      and fixed while porting (not blind 1:1 — see file header comment):
      the artifact's normalVersion made an implicit outcome claim ("helping
      bring in more calls and jobs" — fails hard-rules.md rule 1), and its
      `offerType: 'both'` sentence had a double-article bug ("a free a
      website and..."), both from a fragile string-replace on an "a free "
      prefix `both`'s label never had.
- [x] `lib/ai/contentRules.ts` — exports the system-prompt text as a constant,
      built from `os/knowledge/content-rules.md` (canonical, supersedes the
      artifact's own system-prompt wording per that doc's reconciliation
      notes — lead with the deliverable, never a business result) + hard
      rules 1 and 5. A comment at the top names both source files as the
      sync point.
- [x] Unit tests (TDD) for `templateGenerate`: output shape, each
      `offerType` (`website`/`review-agent`/`both`), `free` vs swapped cost
      phrase, niche/spots interpolation, line-count shape, no blocklisted
      CTA, no outcome-promise language, no double article. 10 tests, all
      green.
- [x] Corrected the stale migration comments: `posts` → "unused until
      Creator gets a save/schedule step" (no longer literally Phase 4 — that
      was always wrong per the build spec), `agent_runs` → "used starting
      Phase 2" (comment only, no schema change).
