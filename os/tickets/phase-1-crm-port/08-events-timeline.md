# 08: Events timeline + ascension signals

**What to build:** An append-only, dated interaction log on each client record —
every touch and decision — with a quick way to add an entry and to tag one as an
ascension signal that stays flagged until resolved.

**Blocked by:** 05, 06.

**Status:** done - verified live (append/order/open/resolve); picker excludes system kinds

- [x] The client record shows a timeline of that client's `client_events`,
      newest first, each with its date and `kind`.
- [x] An add-event control creates an event with a chosen `kind`
      (`note` | `touch` | `ascension-signal`) and a body. `phase-change` and
      `system` events are system-written only (from ticket 06), not offered in
      the picker.
- [x] An `ascension-signal` event has an open/resolved state (`resolved_at`
      null = open); the record shows a visible flag while any signal is open,
      and a control to resolve it.
- [x] Timeline entries are never editable or deletable through the UI
      (append-only), matching the `history.md` discipline.
- [x] Tests: append an event → it appears in `getClient`'s timeline in the
      right order; create an `ascension-signal` → it reads as open; resolve it
      → `resolved_at` set.
