# 0001 — Dispatch OS folder structure

**Status:** Accepted — 2026-09-04
**Deciders:** Bruce (owner), with Claude
**Supersedes:** nothing
**Related:** `_source/dispatch-os-build-spec.md` (the app build spec this substrate feeds)

## Context

The agency's operating knowledge lived as ~7 standalone strategy documents in a
`strat-here/` folder plus a working prototype (`outreach-os.html`). The
documents overlap, contradict in places (build spec v1 vs v2; `CLAUDE.md`
content rules vs the prototype's playbook page), and reference files that did
not exist (`prospect-intake-playbook.md`, `growth-system-upgrade-offer.md` —
since added; per-client briefs — still to author).

The goal: a single folder the Claude Agent SDK can treat as an operating
system — client briefs, history, playbooks, and the skills that enforce them —
so rules stop being markdown a human must remember to paste into a chat and
start being behavior the app enforces.

Toolchain: `mattpocock/skills` is installed (spec → tickets → implement flow),
alongside `superpowers`. Specs and tickets are kept as **local markdown in the
repo**, not in an external issue tracker (single user; agents read the
filesystem natively; one grep-able tree).

## Decision

### 1. `_source/` is frozen provenance

`strat-here/`'s contents moved to `os/_source/` unchanged. Nothing reads them
by default. Canonical content is **derived** into `os/knowledge/`. This keeps
the "learned the expensive way" narratives intact as an audit trail and gives
`grill-with-docs` an explicit job: reconcile source → canonical and surface the
contradictions rather than silently picking a side.

Rejected: refactor-in-place then delete (fragments the incident narratives);
leave `strat-here/` as the live canonical home (a folder named "strat-here"
cannot hold canonical rules; contradictions stay hidden).

### 2. Knowledge ↔ skills is hybrid

Per-skill `SKILL.md` carries a compact **hot-path checklist inline** (rules
that must fire every run). Depth — full phase sequencing, strategy rationale,
tier tables — lives in one `os/knowledge/` doc the skill points to. Canonical
rule text exists in exactly one place (the knowledge doc); the inline checklist
mirrors a titled section of it verbatim.

Rejected: thin skills that always load the whole doc (token cost on every post
generation; hard rules become skippable). Rejected: fully self-contained skills
(three copies of every rule — `CLAUDE.md`, skill, doc — with no sync
mechanism; drift is the documented expensive lesson).

### 3. Per-client deviation is first-class

Different clients run a different sequence. Each `clients/<slug>/overrides.md`
records deviations from the canonical playbook. Skills read
`overrides.md` **before** applying `knowledge/`. Example on record: Total
Property Service had pricing disclosed ahead of Phase 9 by deliberate
exception (tracked as a live experiment in `casebook/`).

### 4. `CLAUDE.md` stops being a second rule home

The content rules and hard rules currently embedded in `_source/CLAUDE.md` are
canonicalised in `os/knowledge/content-rules.md` and `os/knowledge/hard-rules.md`.
The eventual repo-root `CLAUDE.md` (app) references those, does not restate them.

### 5. Project skills sit in `.claude/skills/` beside the Pocock skills

`.claude/skills/` is Claude Code's project-skill discovery path. The Pocock
`skills` CLI manages only the 13 entries in `skills-lock.json`; hand-authored
skill directories are left untouched. The 7 Dispatch OS skills live here and
stay out of the lock file.

## Consequences

**Good:**
- One version-controlled tree: briefs, history, playbooks, skills, specs,
  tickets, app code. That tree is the OS.
- Agents reference specs/tickets/knowledge with native Read/Glob/Grep, no API.
- Contradictions between source docs become explicit reconciliation work.
- Rules are enforced by skills, not by memory.

**Costs / open risks:**
- No board UI for tickets; blocking edges live in ticket frontmatter. A board
  can be rendered from the markdown later if wanted.
- `_source/` and `knowledge/` briefly hold overlapping content until derivation
  is complete. `_source/` is read-only to contain the divergence risk.
- The Pocock `skills` CLI's future behavior toward unmanaged dirs in
  `.claude/skills/` is assumed stable, not guaranteed.

## Open questions for `grill-me` / `grill-with-docs`

- **`dm-copilot` mismatch — RESOLVED 2026-09-04.** `dm-copilot` is a two-mode
  skill: `cold-outreach` (first-touch DM, the original 4-stage flow, canonical
  in `knowledge/cold-outreach.md`) and `intake` (Phase 1–10, canonical in
  `knowledge/intake-playbook.md`). Output format from the original is kept.
  **No call step anywhere in the model** — FB DMs and posts only. The cold
  terminal state is "yes to the free build" → Phase 1. No discovery-call,
  closer-deck, or phone step will be built.
- **Build spec v1 vs v2 residue.** v2 supersedes v1 but v1 phrasing survives in
  places. Confirm nothing downstream still points at v1 assumptions.
- **`CLAUDE.md` content-rules vs prototype playbook page.** Minor wording
  differences (CTA examples, "free" swap phrasing). Pick one canonical wording.
- **ADR / CONTEXT.md location.** This ADR sits in `os/decisions/`. The
  `domain-modeling` skill defaults to root `CONTEXT.md` + `docs/adr/`. Confirm
  whether to keep `os/`-local or adopt the skill default before running
  `setup-matt-pocock-skills`.
