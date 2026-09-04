# 06: Phase tracker + side-effects

**What to build:** On the client record, controls to set the intake phase and
its sub-state, the next action and its due date, the do-not-pitch-until date,
and the build status — with the automatic bookkeeping that keeps staleness
detection and the timeline honest.

**Blocked by:** 05.

**Status:** ready-for-agent

- [ ] Phase is settable to 1–10; `phase_substate` is settable to `bridge` (only
      meaningful at phase 8) or `domain-trigger` (only at phase 9) or null, and
      the UI only offers a sub-state where it applies.
- [ ] `next_action_at` (date) and `next_action_note` (short text) are settable
      together.
- [ ] `do_not_pitch_until` (date) is settable and clearable.
- [ ] `build_status` is settable; moving it to `delivered` sets `delivered_at`
      to today if it is null.
- [ ] Any change to `phase` or `phase_substate` stamps `phase_updated_at` to
      now and appends a `phase-change` `client_event` describing the change.
- [ ] Moving to `delivered` appends a `system` `client_event`.
- [ ] Tests: changing phase moves `phase_updated_at` and creates a
      `phase-change` event; setting `build_status = delivered` sets
      `delivered_at` and creates a `system` event; a no-op save creates no
      event.
