# 15: Visual parity pass

**What to build:** A side-by-side check that the ported live pages read as the
same tool as the artifact, with visible drift fixed. This is a manual review,
not an automated gate.

**Blocked by:** 05, 09, 12, 13.

**Status:** done - see 15-visual-parity-screenshots/NOTES.md

- [x] With the app seeded (ticket 04) and running, capture screenshots of the
      four live pages — Dashboard, Clients (list + a record), Todo, Groups —
      with the Playwright MCP. (Ticket 04 not built yet — used a disposable
      ad-hoc seed script instead, deleted after, DB left empty. See ticket's
      implementation notes.)
- [x] Compare each against the corresponding view in
      `os/_source/outreach-os.html` at the same viewport, desktop and phone
      widths.
- [x] Fix visible drift: token colours, the three font roles, `.stamp`
      treatment (bordered, rotated, mono — not filled pills), `PageHeader`
      structure, spacing, dot-grid texture, no emoji. (One real fix: Groups'
      Rules URL input was unstyled — `type="url"` fell outside the shared
      input CSS selector. Switched to `type="text"`, matching the
      siteUrl/paypalPlanUrl convention elsewhere.)
- [x] Record the before/after screenshots in the ticket set folder for the
      record. (`15-visual-parity-screenshots/`)
- [x] No automated screenshot assertion is added to CI; parity is a
      point-in-time review.
