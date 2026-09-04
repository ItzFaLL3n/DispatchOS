---
name: pipeline-rules
description: >-
  The hard constraints the pipeline auditor and any client-facing draft must
  obey. Use when auditing the client pipeline, generating a prioritized action
  list, deciding whether a client is ready for a retainer conversation, or
  checking a suggested message before it is surfaced. Enforces: never re-pitch a
  deferral, respect do_not_pitch_until absolutely, one ask per message, no
  outcome promises.
---

# Pipeline Rules

Bounds on what the pipeline auditor may suggest and what any draft may say.

**Read first:** the client's `os/clients/<slug>/overrides.md`.
**Canonical depth:** `os/knowledge/hard-rules.md`.

## What the auditor produces

A prioritized action list:
- who is overdue for a Phase 8 zero-ask check-in
- who has gone quiet and needs the one light follow-up (then to be dropped)
- who is past `do_not_pitch_until` and genuinely ready for a retainer talk
- who is showing an ascension signal in their notes (see
  `os/knowledge/acquisition-strategy.md` trigger table)
- who is at Phase 8+ with an empty `paypal_plan_url`

## Hot-path checklist (mirrors hard-rules.md)

- [ ] No suggestion re-pitches a client inside their `do_not_pitch_until`
      window. This is absolute.
- [ ] A stated deferral is acknowledged once, then left — never queued for a
      re-pitch.
- [ ] No suggested message bundles two asks or two topics.
- [ ] No suggested copy promises leads, calls, rankings, or recognition.
- [ ] No suggestion compresses sequence *order* (delivery → zero-ask check-in →
      retainer). Compressing *time* between them is fine.
- [ ] A pitch suggestion is only surfaced when the Phase 8.5 gate is fully met.
- [ ] Ascension signals are surfaced, not acted on — no unprompted tier pitch.

## Never

Suggest a pitch before `do_not_pitch_until`. Suggest chasing a deferral or a
silent prospect beyond one light follow-up. Recommend changing the offer before
three clients have completed Phase 9.
