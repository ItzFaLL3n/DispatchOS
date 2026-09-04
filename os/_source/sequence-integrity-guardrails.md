# Sequence Integrity Guardrails — Non-Negotiable

**Purpose:** the intake playbook (`prospect-intake-playbook.md`) already states the rules. This file exists because stating a rule once isn't the same as never breaking it under real conversational pressure — a client replying fast, asking a direct question, or being clearly engaged makes it easy to compress steps that should stay separate. This is the pre-send layer that catches that.

**Trigger case:** ProLift Hauling, Sep 2026. Delivery message pre-loaded "we'll discuss next steps tomorrow" → Samuel asked what's next → retainer pitch went out same day, no zero-ask check-in ever sent as its own message, all inside one ~9-hour conversation. Nothing dishonest was said, but three separate rules got compressed away at once. Full breakdown in `prolift-hauling-client-brief.md`. This is the reference case every rule below traces back to.

---

## The rule underneath every phase

Sequence order is fixed. **Timing between steps can compress when a client is genuinely driving the pace. The order of steps never changes, and no step gets skipped just because a prior one is shared or implied.** A client replying fast is permission to reply fast — it is not permission to fold multiple phases into one message.

---

## Hard rules

1. **A delivery message contains delivery. Nothing else.**
   No task ask, no "we'll talk next steps," no forward-reference to pricing or domains. If the message has more than one job, it's not a delivery message anymore.

2. **The zero-ask check-in is mandatory and must be its own message.**
   Not a clause inside delivery. Not implied by the client asking "what's next?" Send it, let it land, *then* consider whether a retainer conversation is appropriate.

3. **Retainer pricing only comes up after the check-in has landed naturally.**
   Even if the client asks directly and fast — "what's next," "how much," etc. — the honest move is still to send the check-in first, or at minimum let it be a distinct message before pricing, not skip it because he already implied interest.

4. **No outcome promises, ever.**
   Nothing that ties a deliverable to a result — no "this gets you showing up on Google," "this gets you more calls," "this is what gets you found." Describe what the thing *does* (mechanism), never what it *will get them* (outcome). If a sentence would still be true regardless of whether the client ever gets a single lead from it, it's fine. If it wouldn't, reword it.

5. **Never explain a technical downside in a way that manufactures risk to justify a price.**
   DNS, propagation, downtime, migration — describe what's actually involved, plainly, the way you'd explain it to someone you're not selling to. If the explanation lands immediately after a price quote and makes the cheaper option sound scarier than it is, that's the tell — reorder or reword it.

6. **One ask or one new idea per message.** Always. No exceptions for an engaged client.

7. **A client's fast replies change your response speed, not your step order.** Compression is about *time*, never about *which steps happen*.

---

## Pre-send checklist — run this before sending anything from Phase 6 through Phase 10

- [ ] Is this a delivery message? If yes — strip everything except delivery. No "next steps," no forward references.
- [ ] Has the zero-ask check-in already gone out, as its own message, separate from delivery? If no — don't mention pricing, domains, hosting, or "next steps" in this message, no matter what the client just asked.
- [ ] Does this message promise an outcome (ranking, calls, being found, more recognition)? If yes — reword to describe the mechanism only.
- [ ] Am I bundling more than one ask or topic? If yes — split it into two messages.
- [ ] Am I explaining a technical downside right after quoting a price? If yes — either reorder so it doesn't read as pressure, or strip it down to plain information.
- [ ] Is the client's fast pace tempting me to skip a step rather than just reply faster? If yes — reply fast, keep the step.

---

## Named anti-patterns

### The pre-loaded next step
A delivery message that seeds a future ask — "we'll discuss next steps tomorrow," "next thing worth sorting is...," anything that turns delivery into a setup for a pitch.
**Fix:** delivery message ends at delivery. Full stop.

### The same-day stack
Delivery → check-in → pricing → technical explainer, all inside one continuous conversation or day.
**Fix:** let the check-in happen on its own, even if that means sitting on a reply for a day. A fast-replying client doesn't require a fast-pitching you.

### The manufactured difficulty
Explaining a downside of the cheaper/self-managed option with more alarm than the facts require, positioned right after a price quote, so it reads as pressure toward the pricier tier.
**Fix:** plain information only. State what's involved, not what could go wrong, unless what could go wrong is genuinely relevant and stated with the same tone you'd use for the option you're not trying to upsell into.

### The outcome slip
"this is what gets you showing up when people search" — ties a deliverable directly to a result the business can't actually guarantee.
**Fix:** describe the mechanism, not the outcome. "A free subdomain doesn't get indexed the way a real domain does" is fine. "This is what gets you showing up" is not.

---

## Case log

Keep this updated any time a real violation happens — the point is pattern visibility, not blame.

| Date | Client | What happened | Rule(s) broken |
|---|---|---|---|
| Sep 2026 | ProLift Hauling | Delivery message pre-loaded "next steps tomorrow"; retainer pitched same day with no zero-ask check-in ever sent; DNS risk framing landed right after the $49 price quote | #1 (clean delivery), #2/#3 (check-in before pricing), #5 (manufactured difficulty), partial #4 (outcome-adjacent phrasing) |

---

## Note for later

Per `dispatch-os-build-spec.md`, once Dispatch OS becomes a real backend app rather than an artifact, this checklist is a natural candidate for an actual pre-send validator on the Clients page — flagging a drafted message if it references pricing/domain before a check-in note exists on that client's record, or if delivery and retainer timestamps land inside the same day. Not needed for the artifact version now — this file is the manual version of that same check.
