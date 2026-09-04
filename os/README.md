# Dispatch OS — Agency Operating System

This folder is the knowledge substrate for the agency. It holds the canonical
playbooks, the per-client record, the incident casebook, and the specs/tickets
for building the Dispatch OS app. Agents (Claude Agent SDK) read from here; the
app's skills bind to it.

`_source/` holds the original strategy documents, frozen. Nothing reads them by
default — they are provenance. Everything canonical is derived into `knowledge/`.

## Read order for an agent

1. `CONTEXT.md` — domain vocabulary. Read first, always.
2. `knowledge/` — the canonical playbooks and rules (see table below).
3. `clients/<slug>/` — for client-specific work: `brief.md`, then `overrides.md`,
   then `history.md`.
4. `casebook/` — cross-client incidents and live experiments. Read when a
   decision has precedent.

## The hybrid rule (how skills use this folder)

Each `.claude/skills/*/SKILL.md` carries its **hot-path checklist inline** — the
few rules that must fire on every run. For depth it points to one `knowledge/`
doc. For client work it reads that client's `overrides.md` **before** applying
the canonical playbook, because different clients need a different sequence
(e.g. Total Property Service had pricing disclosed early, by deliberate
exception).

Canonical rule text lives in exactly one place: the `knowledge/` doc. The
inline checklist is a compact mirror of a titled section in that doc, small
enough to diff by eye.

## Folder map

| Path | What it holds | Who writes it |
|---|---|---|
| `CONTEXT.md` | Canonical domain vocabulary | `domain-modeling` / `grill-with-docs` |
| `knowledge/` | Canonical playbooks & rules — the depth layer for skills | authored, reconciled from `_source/` |
| `clients/_template.md` | Standard brief shape + phase tracker + override section | authored |
| `clients/<slug>/brief.md` | Business facts, contacts, site URL, tier | authored, kept current |
| `clients/<slug>/history.md` | Dated log of every touch and decision | appended over time |
| `clients/<slug>/overrides.md` | This client's deviations from the canonical playbook | authored per client |
| `casebook/` | Cross-client incidents and live experiments | appended when something happens |
| `specs/` | `to-spec` output — one file per spec | `to-spec` |
| `tickets/` | `to-tickets` output — blocking edges in frontmatter | `to-tickets` |
| `decisions/` | ADRs | `grill-with-docs` / `domain-modeling` |
| `_source/` | Frozen originals — provenance only, not read by default | never edited |

## knowledge/ contents

| File | Source doc(s) in `_source/` | Governs |
|---|---|---|
| `relationship-arc.md` | `CLAUDE.md` (core philosophy) | Free-site → retainer → growth-partner arc; why nothing is optimised to close in isolation |
| `content-rules.md` | `CLAUDE.md` (content rules) + prototype playbook page | Two-version post format, tone, CTA blocklist, `free`-keyword swap |
| `hard-rules.md` | `CLAUDE.md` (hard rules) + `sequence-integrity-guardrails.md` | The 6 non-negotiables + the pre-send checklist |
| `intake-playbook.md` | `prospect-intake-playbook.md` | Phase 1–10 script, golden rules, what never to mention before Phase 9 |
| `cold-outreach.md` | `dm-copilot/SKILL.md` (original) | First-touch cold DM: 4-stage flow (light open → numbers → diagnosis → offer the free build), then hands to Phase 1 |
| `acquisition-strategy.md` | `client-acquisition-system.md` | Hormozi value-equation application + Stone ascension; the scoreboard |
| `growth-system.md` | `growth-system-upgrade-offer.md` | Tier definitions, eligibility timing, guarantee language |
| `design-system.md` | `CLAUDE.md` (design system) | Color tokens, type roles, signature components — for the React port |

## Skills that bind here

| `.claude/skills/` | Inline hot-path | Depth doc | Reads override |
|---|---|---|---|
| `fb-post-writer` | 2-version format, CTA blocklist, `free`-swap, no-outcome | `content-rules.md` | group `rulesNotes` |
| `intake-playbook` | current-phase gate, never before Phase 9 | `intake-playbook.md` | `clients/<x>/overrides.md` |
| `dm-copilot` | mode toggle (cold-outreach / intake), texting voice, one ask, stage/phase detection | `cold-outreach.md` + `intake-playbook.md` + `hard-rules.md` | `clients/<x>/overrides.md` |
| `pipeline-rules` | never re-pitch a deferral, respect `do_not_pitch_until`, one ask | `hard-rules.md` | `clients/<x>/overrides.md` |
| `sequence-integrity` | the 6-item pre-send checklist verbatim | `hard-rules.md` | — |
| `client-brief` | brief shape + phase-tracker format | `clients/_template.md` | — |
| `growth-system` | tier one-liners, eligibility timing, guarantee | `growth-system.md` | `clients/<x>/overrides.md` |

See `decisions/0001-os-folder-structure.md` for why it is shaped this way.
