# Hard Rules — non-negotiable, enforce in code and in prompts

Canonical. Sources: `_source/CLAUDE.md` ("Hard rules") +
`_source/sequence-integrity-guardrails.md`. Several were learned the expensive
way; the reference case is ProLift Hauling, Sep 2026 (see
`../casebook/prolift-sequence-compression.md`).

## The rule underneath every rule

**Sequence order is fixed. Timing between steps may compress when a client is
genuinely driving the pace. The order never changes, and no step is skipped
because a prior one was shared or implied.** A client replying fast is
permission to reply fast — not permission to fold phases into one message.

## The rules

1. **No outcome promises, ever.** Never promise leads, calls, Google rankings,
   or local recognition — any tier, any post, any DM. Describe only what the
   system *does* (mechanism), never what it *will get them* (outcome). Test: if
   the sentence would still be true whether or not the client ever gets a single
   lead, it is fine. If not, reword it.
2. **One ask per message.** Never bundle two questions or two pitches. No
   exception for an engaged client. (`_source/prospect-intake-playbook.md`
   phrases this as "one or two asks, max, never an interrogation" — treat **one
   new idea or ask per message** as canonical; a second trivially-linked
   clarifier is tolerated, a second *topic* is not.)
3. **Zero-ask delivery.** Never stack domain, hosting, SEO, or pricing into or
   immediately after site delivery. Sequence: delivery → zero-ask check-in →
   retainer offer. Compressing the *time* between steps is fine when a prospect
   is engaged. Changing the *order* is not.
4. **Never re-pitch a deferral.** "Let me get a few more jobs first" is a soft
   yes-later, not silence to chase. Acknowledge once, leave it alone. The
   `do_not_pitch_until` field enforces this; the pipeline auditor must respect
   it absolutely.
5. **No manufactured urgency.** Limited-spot framing must reflect a genuine
   operational cap. If it isn't real, it isn't said.
6. **Client-facing voice is texting-style.** Lowercase, casual, short, one
   thought at a time. No corporate polish. No em dashes. Applies to DM drafts
   and posts, never to internal UI copy.
7. **Never explain a technical downside in a way that manufactures risk to
   justify a price.** DNS, propagation, downtime, migration — describe what is
   actually involved, plainly, the way you'd explain it to someone you are not
   selling to. If the explanation lands right after a price quote and makes the
   cheaper option sound scarier than it is, reorder or reword it.

## Pre-send checklist — run before sending anything from Phase 6 to Phase 10

This is the section skills mirror verbatim.

- [ ] **Delivery message?** If yes — strip everything except delivery. No "next
      steps", no forward references to pricing, domains, or hosting.
- [ ] **Has the zero-ask check-in already gone out, as its own message,
      separate from delivery?** If no — do not mention pricing, domains,
      hosting, or "next steps" in this message, no matter what the client just
      asked.
- [ ] **Does this message promise an outcome** (ranking, calls, being found,
      recognition)? If yes — reword to describe the mechanism only.
- [ ] **Bundling more than one ask or topic?** If yes — split into two messages.
- [ ] **Explaining a technical downside right after quoting a price?** If yes —
      reorder so it doesn't read as pressure, or strip to plain information.
- [ ] **Is the client's fast pace tempting a skipped step rather than just a
      faster reply?** Reply fast, keep the step.

## Named anti-patterns

- **The pre-loaded next step** — a delivery message that seeds a future ask
  ("we'll discuss next steps tomorrow"). Fix: delivery ends at delivery.
- **The same-day stack** — delivery → check-in → pricing → technical explainer
  in one conversation or day. Fix: let the check-in land on its own, even if
  that means sitting on a reply for a day.
- **The manufactured difficulty** — over-alarming the cheaper option right
  after a price quote. Fix: plain information only.
- **The outcome slip** — "this is what gets you showing up when people search".
  Fix: "a free subdomain doesn't get indexed the way a real domain does" is
  fine; "this gets you showing up" is not.

## Reconciliation notes

- Rule 2 wording differs between sources (`CLAUDE.md`: "one ask per message";
  `prospect-intake-playbook.md`: "one or two asks, max"). Canonical = one new
  ask/idea per message; a second trivially-linked clarifier is tolerated.
- `do_not_pitch_until` is the DB field name in the build spec's Postgres schema
  (`do_not_pitch_until`); the artifact used `doNotPitchUntil`. Both refer to the
  same hard block.
