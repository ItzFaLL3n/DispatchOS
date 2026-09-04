# 09: Conversion board + in-build strip

**What to build:** The dashboard home screen — a board of every *delivered*
client placed in the column for where they sit in the post-delivery sequence,
each card showing the one thing blocking progress, with clients still in build
shown in a separate compact strip.

**Blocked by:** 06.

**Status:** ready-for-agent

- [ ] `derive.conversionColumn(client)` returns one of `check-in | bridge |
      retainer | domain-trigger | growth | won | closed` per the spec mapping:
      `retainer_status = active → won`; `= declined → closed`; else by phase —
      `10 → growth`; `9 + domain-trigger → domain-trigger`; `9 → retainer`;
      `8 + bridge → bridge`; `8 → check-in`; delivered but phase `< 8` →
      `check-in` with a data-warning flag.
- [ ] The board shows all seven columns in sequence order; only `delivered`
      clients appear on it.
- [ ] A `deferred` client sits in Retainer with a visible countdown to
      `do_not_pitch_until`.
- [ ] Each card shows business name, client-local time (from ticket 07 if
      present), and a single blocking-item line (e.g. "check-in not logged",
      "PayPal link missing", "pitch opens in 6 days", "waiting for a door").
- [ ] Clients in phase 1–7 render in a compact "in build" strip, separate from
      the board.
- [ ] Clicking a card opens that client's record.
- [ ] Tests: every `conversionColumn` branch, including `won`, `closed`,
      deferred-in-retainer, and delivered-but-phase-<8.
