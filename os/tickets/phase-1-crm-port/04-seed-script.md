# 04: Seed script

**What to build:** A `pnpm seed` command that loads the six real client records
from `os/clients/` into the database — the structured brief fields plus each
client's `history.md` entries turned into timeline events — and can be run
repeatedly without creating duplicates.

**Blocked by:** 03.

**Status:** ready-for-agent

- [ ] `pnpm seed` reads every `os/clients/<slug>/brief.md`, maps the field
      table to `clients` columns by label, and takes `slug` from the folder
      name.
- [ ] Each `history.md` `##` date heading becomes a `client_events` row
      (`kind = note`, `at` = the parsed heading date; "Prior to 2026-09-04" →
      `2026-09-04`).
- [ ] Upsert is keyed on `slug`: a second run updates the six client rows and
      their seed-originated events in place, creates no duplicate clients, and
      leaves any operator-added events untouched (seed events are
      distinguishable from operator events by a known marker).
- [ ] After a run the six clients are present: `hd-junk-removal`,
      `zenith-junk-removal`, `prolift-hauling`, `heartland-demo`, `rice-moving`,
      `total-property-service`, with their timezones (Central / Central /
      Pacific / Central / Mountain / null).
- [ ] `phase`, `phase_substate`, `retainer_status`, `do_not_pitch_until`,
      `delivered_at`, `site_url`, `paypal_plan_url` are populated from the
      briefs (e.g. HD phase 9 deferred, `do_not_pitch_until` 2026-09-18;
      ProLift phase 9; HeartLand phase 3).
- [ ] Test: run seed twice against the throwaway schema; assert six clients and
      their history events after the first run, and no duplicates after the
      second.

**Impl note (from ticket 09):** PostgREST multi-row inserts with non-uniform keys send explicit NULLs instead of using column defaults. Insert clients one at a time, or build every row object with the same key set.
