# 10: Bridge-gate checklist

**What to build:** On each delivered client, a checklist of the Phase 8.5
preconditions that resolves to a single plain verdict — "ready to pitch" or
"not ready" with the missing items — most of it derived automatically, with a
one-tap way to log the zero-ask check-in.

**Blocked by:** 06, 08.

**Status:** done - verified live (verdict, 5 items, toggles, log-checkin, delivered-only)

- [x] `derive.bridgeGateStatus(client, events, now)` returns
      `{ ready, items[], missing[] }` over five items:
      `site_delivered_live` (auto: `build_status = delivered` ∧ `site_url`),
      `time_since_delivery` (auto: `now − delivered_at ≥ 3 days`),
      `paypal_ready` (auto: `paypal_plan_url` present),
      `checkin_landed` (manual flag), `nothing_asked_since_delivery` (manual
      flag). `ready` = all five met.
- [x] The client record shows the checklist with each item's met/unmet state
      and whether it is auto or manual, and a headline verdict: "ready to pitch"
      or "not ready: <missing items>".
- [x] The two manual flags toggle from the checklist and persist on the client.
- [x] A "log zero-ask check-in" action appends a `touch` `client_event` and
      then offers to tick `checkin_landed`.
- [x] The checklist only renders for `delivered` clients.
- [x] Tests: each of the five items unmet in isolation yields `ready = false`
      with that item in `missing`; all five met yields `ready = true`; the
      3-day threshold boundary.
