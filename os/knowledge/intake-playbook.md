# Intake Playbook — free-website offer, Phase 1 → 10

Canonical tactical script. Base source: `_source/prospect-intake-playbook.md`
(built from HD Junk Removal / Tyler and Zenith). Merged with the conversion
layer from `_source/client-acquisition-system.md` (Phase 8.5, Phase 9b) and the
guardrails in `_source/sequence-integrity-guardrails.md`.

Read `hard-rules.md` alongside this — every phase is subject to it. Read the
client's `overrides.md` **before** this — a client may run a modified sequence.

## Golden rules (apply at every phase)

- One new ask or idea per message. Never an interrogation.
- Lowercase, casual, mirror the client's own words back ("davis county" →
  "davis county plus a 30 mile radius").
- Never mention hosting cost, pricing, or the retainer before Phase 9.
- Check what's already visible (FB page, earlier messages) before asking again.
- If he goes quiet, don't chase. One light follow-up, then let it sit.

## Phases

### Phase 1 — Confirm & kick off
**Trigger:** he says yes / expresses interest.
**Ask:** business name + service area.
**Sample:** *"hey man awesome, glad youre down. ill get started this week. whats the business called and what areas do you service?"*
**Never:** mention pricing, hosting, or anything beyond the free build.

### Phase 2 — Services + contact info
**Goal:** nail down what he actually does (drives site copy) + confirm the number to display.
**Skip** phone/email if messaging via his FB business page — usually already visible.
**Sample:** *"what all do you handle - just junk removal or demo/appliance/debris too? and whats the best number for the site?"*

### Phase 3 — Photos & socials
**First:** check his FB page yourself for usable job/truck photos before asking.
**If thin:** ask, low-pressure. Don't let it block the build — new businesses often have few photos.
**Sample:** *"if you got pics of jobs or the truck send a few over when you can, itll make the site look more like you. no worries if not, i can fill gaps for now."*

### Phase 4 — Site preferences
**Ask:** pricing shown, or "free estimates" only (most in this niche prefer the latter)? Any must-have features?
**Sample:** *"want pricing shown on the site or keep it free-estimates only like most guys do? and is there anything specific youd want on there?"*
**Timing:** after basics + photos, not before.

### Phase 5 — Domain check
**Goal:** find out if he already owns a domain. Never blocks the build — a free subdomain is fine to start.
**Sample:** *"you got a domain already or nah? no rush either way, can get you set up on a free link for now and sort that out whenever."*
**Never:** push him to buy one, or hint at future domain-handling pricing.

### Phase 6 — Mid-build check-in
**Trigger:** site ~50–70% done.
**Goal:** keep him engaged, build anticipation. **No ask attached.**
**Sample:** *"quick peek at where its at - still filling in a few things but wanted you to see progress."* (attach a short video or screenshot)

### Phase 7 — Delivery
**Goal:** hand it over plain, no strings. **A delivery message contains delivery and nothing else** (`hard-rules.md` anti-pattern: the pre-loaded next step).
**Sample:** *"as promised, heres your site. its yours, no catch."*
**Never:** pricing, upsells, retainer, or "we'll talk next steps".

### Phase 8 — Zero-ask check-in
**Trigger:** a few days to a week after delivery.
**Goal:** see how it's landing. This is the step that builds the relationship — skip it and the free build is a one-time favour from a stranger. **Must be its own message**, not a clause in delivery, not triggered by him asking "what's next?".
**Sample:** *"hows the site treating you so far, any calls come through yet?"*
**Reading his answer:**
- *"a couple came in"* → getting value. Retainer is easy. Go to 8.5 → 9.
- *"nothing yet"* → expected on a subdomain. **Do not explain that in this
  message.** Say something normal, let it sit a few days, then open 8.5 / 9 —
  where the domain explanation is a natural answer, not a defensive one.
- *silence* → one light follow-up. Then leave it.

### Phase 8.5 — The bridge (the money phase)
Not in the original playbook — from `_source/client-acquisition-system.md`. The
moment between the check-in and the pitch, where conversion is won or lost.

**All must be true before pitching:**
- [ ] Site delivered and live
- [ ] Zero-ask check-in sent and answered
- [ ] At least a few days have passed since delivery
- [ ] PayPal plan for the tier already created, link ready to send
      (`clients.paypal_plan_url` populated)
- [ ] Nothing was asked of him between delivery and now

**The bridge move:** don't invent a reason to pitch. Wait for a door, all of
which come from him:
- asks about Google, ranking, or being found
- mentions a missed call or a lost lead
- asks about a domain or "making it official"
- asks how to see estimate requests
- mentions being busier

Any of those is an open door. If no door appears within ~a week, open Phase 9
anyway — once, plainly.

### Phase 9 — Retainer offer
The highest-stakes message in the sequence. One ask, two options, no pressure.
**Terms:** $39/mo (he manages his own domain) or $49/mo (domain handled) — no
contract, cancel anytime.
**Sample:** *"hey, wanted to run something by you - i can keep the site hosted and maintained for $39/month if you handle the domain, or $49 if you want me to handle that too. no contract, cancel whenever."*

- **If he asks what he gets:** name the six components plainly, as a list, not a
  pitch — site stays live & hosted; ongoing updates; separate service pages;
  ongoing SEO; job/customer tracking dashboard; estimate requests in one place.
  ($49 adds: domain registration, DNS, renewal all handled.)
- **If he asks why it costs anything:** honest answer — it's not the hosting,
  it's the ongoing work. Don't pretend infrastructure costs $39.
- **If he defers:** soft yes-later. Acknowledge once. Set `do_not_pitch_until`.
  Don't re-pitch. (Tyler's window opens ~2026-09-18 and does not open early.)
- **If he says no outright:** the site stays his. Say so and mean it.

### Phase 9b — The domain trigger
From `_source/client-acquisition-system.md`. When someone hesitates on the
retainer but keeps circling the domain, that's the buying signal. The $49 tier
exists for exactly that person — they want the domain, they don't want DNS. Let
them buy the thing they actually want. Don't dramatize DNS
(`hard-rules.md` rule 7).

### Phase 10 — Growth System upgrade
**Trigger:** 2+ months on the $39/$49 retainer (default), or as early as 1
month on a genuine organic signal (asks about reviews, mentions missing calls,
wants more presence). Never forced early.
**Goal:** one offer moment, not three upsells. He picks a tier or stays on
hosting. When he upgrades into any tier, the standalone hosting fee stops being
billed — it's folded in.
**Full detail:** `growth-system.md`.
**Sample:** *"hey, wanted to run something by you since things have been rolling for a bit now. i put together a bigger system that folds in everything - hosting, your business listing, review requests, missed-call text-back, all in one dashboard instead of piecing it together. runs $197 to $799 a month depending on how much you want handled, no contract either way. want me to break down what's in each?"*
**Guarantee if asked:** no contract, cancel anytime, 14-day adjustment window,
no hidden fees. Never promise leads, calls, rankings, or recognition.

## Hot-path checklist (mirrored by `intake-playbook` + `dm-copilot` skills)

- [ ] Client `overrides.md` read — is this client on a modified sequence?
- [ ] Which phase is the conversation in? State it.
- [ ] Is the drafted message allowed at this phase? (No pricing/domain/hosting
      before Phase 9. No ask in Phase 6 or 7. Phase 8 check-in is its own
      message.)
- [ ] One new ask/idea only.
- [ ] Phase 8.5 gate: if this is a pitch, are all five preconditions true?
- [ ] `do_not_pitch_until` in the future? Then no pitch, no exceptions.

## Reconciliation notes

- The base playbook has 10 phases. 8.5 and 9b are insertions from
  `client-acquisition-system.md`; they are now canonical here. Phase numbering
  in the DB (`clients.phase int 1..10`) has no 8.5 slot — represent the bridge
  as phase 8 with a `bridge` sub-state, or phase 9 "not yet pitched". Resolve
  in `domain-modeling` (open question in `../decisions/0001-...`).
- Base playbook Phase 10 sample and `growth-system.md` sample are identical —
  kept in `growth-system.md` as the single source; quoted here for continuity.
