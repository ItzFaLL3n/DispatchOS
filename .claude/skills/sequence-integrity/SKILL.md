---
name: sequence-integrity
description: >-
  Pre-send gate for any client-facing message from Phase 6 through Phase 10. Use
  right before a delivery message, a check-in, a retainer pitch, or any DM in
  that range goes out. Catches sequence compression under conversational
  pressure — a fast-replying or direct-questioning client makes it easy to fold
  phases together. Reference case: ProLift Hauling, Sep 2026.
---

# Sequence Integrity

The pre-send layer. Stating a rule once is not the same as never breaking it
when a client is replying fast and asking direct questions.

**Canonical depth:** `os/knowledge/hard-rules.md`. Reference case:
`os/casebook/prolift-sequence-compression.md`.

## The rule underneath

Sequence **order** is fixed. **Timing** between steps can compress when the
client is genuinely driving the pace. No step is skipped because a prior one
was shared or implied. A client replying fast is permission to reply fast — not
to fold phases into one message.

## Pre-send checklist (run before sending — verbatim from hard-rules.md)

- [ ] **Is this a delivery message?** If yes — strip everything except
      delivery. No "next steps", no forward reference to pricing / domains /
      hosting.
- [ ] **Has the zero-ask check-in already gone out, as its own message,
      separate from delivery?** If no — do not mention pricing, domains,
      hosting, or "next steps" here, no matter what the client just asked.
- [ ] **Does this message promise an outcome** (ranking, calls, being found,
      recognition)? If yes — reword to describe the mechanism only.
- [ ] **Bundling more than one ask or topic?** If yes — split into two.
- [ ] **Explaining a technical downside right after quoting a price?** If yes —
      reorder so it doesn't read as pressure, or strip to plain information.
- [ ] **Is the client's fast pace tempting a skipped step rather than a faster
      reply?** Reply fast, keep the step.

## Named anti-patterns to catch

- **The pre-loaded next step** — delivery that seeds a future ask.
- **The same-day stack** — delivery → check-in → pricing → technical explainer
  in one conversation or day.
- **The manufactured difficulty** — over-alarming the cheaper option right
  after a price quote.
- **The outcome slip** — tying a deliverable to a result the business can't
  guarantee.

If any box is unchecked, the message does not send as written.
