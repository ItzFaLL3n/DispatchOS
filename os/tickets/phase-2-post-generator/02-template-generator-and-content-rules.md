# 02: Template generator + content-rules prompt module

**What to build:** The two pure modules everything else in this phase sits on
top of — the offline template generator (ported from the artifact) and the
system-prompt text compiled from `content-rules.md`/`hard-rules.md`. No I/O,
no network, no UI. This is the primary test seam for the phase.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] `lib/ai/templateGenerate.ts` — pure `templateGenerate(ctx)` ported 1:1
      from the artifact's version (niche, offerType, spots, costPhrase →
      `{ gifVersion, normalVersion }`), covering all three `offerType` values
      and the `free` vs non-`free` cost-phrase sentence shape.
- [ ] `lib/ai/contentRules.ts` — exports the system-prompt text as a constant,
      built from `os/knowledge/content-rules.md` (canonical, supersedes the
      artifact's own system-prompt wording per that doc's reconciliation
      notes — lead with the deliverable, never a business result) +
      `os/knowledge/hard-rules.md`. A comment at the top names both source
      files as the sync point.
- [ ] Unit tests (TDD) for `templateGenerate`: output shape, each
      `offerType` (`website`/`review-agent`/`both`), `free` vs swapped cost
      phrase, niche/spots interpolation.
- [ ] Corrected the stale migration comment
      `-- posts (table created, unused until Phase 4)` → Phase 2 (comment
      only, no schema change).
