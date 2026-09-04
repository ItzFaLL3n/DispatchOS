# ProLift Hauling — the compressed sequence

**Date:** September 2026
**Client:** ProLift Hauling LLC (`../clients/prolift-hauling/`)
**Type:** rule violation — sequence compression under conversational pressure
**Rules broken:** guardrail #1 (clean delivery), #2/#3 (check-in before
pricing), #5 (manufactured difficulty), partial #4 (outcome-adjacent phrasing)

## What happened

Inside one continuous conversation of roughly nine hours:

1. The **delivery message pre-loaded a next step** — it included "we'll discuss
   next steps tomorrow" rather than ending at delivery.
2. Samuel replied asking what's next.
3. The **retainer pitch went out the same day** — $49/mo, domain handled.
4. **DNS / propagation risk framing landed immediately after the $49 quote**,
   making the cheaper self-managed option sound scarier than the facts warrant.
5. **The zero-ask check-in was never sent as its own message.** It was treated
   as satisfied by Samuel asking "what's next?".

Nothing dishonest was said. Three separate rules were compressed away at once
because the client was replying fast and asking direct questions.

## Why it mattered here specifically

Samuel had earlier flagged the outreach as a possible scam. Trust was already
the weak lever. The zero-ask check-in — delivery with nothing attached, then a
genuine "how's it treating you" with no ask — was the single highest-leverage
credibility move available, and it was the one that got skipped.

## The lesson

**A client replying fast is permission to reply fast. It is not permission to
fold multiple phases into one message.** Timing between steps can compress. The
order of steps cannot, and no step is skipped because a prior one was implied.

## What changed as a result

- `../knowledge/hard-rules.md` carries the pre-send checklist (Phase 6–10) that
  catches this before a message goes out.
- The `sequence-integrity` skill mirrors that checklist verbatim.
- Once Dispatch OS is a real backend: a pre-send validator on the Clients page
  flags a drafted message that references pricing/domain before a check-in note
  exists on the record, or that has delivery and retainer timestamps inside the
  same day.

## Repair

A standalone, low-key check-in was sent 2026-09-04 — *"no rush on the domain
stuff btw, site's yours either way we can buy the domain later too didnt mean
to pressure you mate - is it good."* No new ask beyond a soft "is it good". It
came after pricing had already been discussed, so it is not a clean
first-instance check-in, but it functions as the missed step and repairs the
pacing. No reply yet.

## Status

Recovery posture in `../clients/prolift-hauling/overrides.md`: repair check-in
sent and pending a reply — do not send another. No re-quoting the numbers, no
stacking, let him raise the retainer again himself. Rebuild credibility through
delivery with nothing attached.
