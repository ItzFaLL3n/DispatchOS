# 15: Visual parity pass

**What to build:** A side-by-side check that the ported live pages read as the
same tool as the artifact, with visible drift fixed. This is a manual review,
not an automated gate.

**Blocked by:** 05, 09, 12, 13.

**Status:** ready-for-agent

- [ ] With the app seeded (ticket 04) and running, capture screenshots of the
      four live pages — Dashboard, Clients (list + a record), Todo, Groups —
      with the Playwright MCP.
- [ ] Compare each against the corresponding view in
      `os/_source/outreach-os.html` at the same viewport, desktop and phone
      widths.
- [ ] Fix visible drift: token colours, the three font roles, `.stamp`
      treatment (bordered, rotated, mono — not filled pills), `PageHeader`
      structure, spacing, dot-grid texture, no emoji.
- [ ] Record the before/after screenshots in the ticket set folder for the
      record.
- [ ] No automated screenshot assertion is added to CI; parity is a
      point-in-time review.
