# 11: Dashboard nags

**What to build:** A panel on the dashboard that lists what needs attention —
overdue next-actions, deferrals that are now ready versus still counting down,
stale clients, delivered clients missing a PayPal plan link, who's textable
right now, and open ascension signals.

**Blocked by:** 07, 08, 09.

**Status:** done - all 7 buckets verified live on the dashboard

- [x] `derive.dashboardNags(clients, events, now)` returns buckets:
      `overdue` (`next_action_at < today`),
      `deferralReady` (`do_not_pitch_until` present and `< today`),
      `deferralPending` (`do_not_pitch_until >= today`, with days remaining),
      `stale` (`phase_updated_at` older than 14 days),
      `missingPaypal` (`build_status = delivered` ∧ `phase >= 8` ∧ no
      `paypal_plan_url`),
      `textableNow` (contact-window `green` first, then `amber`),
      `ascensionSignals` (clients with an open `ascension-signal` event).
- [x] The dashboard renders each bucket as a short list; empty buckets show a
      quiet "nothing here", not blank space.
- [x] Each nag row links to the client record.
- [x] `stale` (14 days) and the bridge `time_since_delivery` (3 days) are named
      constants, no settings UI.
- [x] Tests: a client that qualifies for several buckets appears in each; each
      bucket's boundary condition; `textableNow` ordering (green before amber,
      red excluded).
