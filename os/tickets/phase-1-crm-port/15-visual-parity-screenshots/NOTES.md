# Ticket 15 — visual parity pass notes

Ad-hoc seed (4 clients, 4 groups, 4 todos, 3 events — via a disposable script,
deleted after, DB left empty) + Playwright MCP screenshots of the live app
against `os/_source/outreach-os.html` served locally, desktop (1440x900) and
phone (375x812).

## Drift found and fixed

- **Groups page: Rules URL input unstyled.** `GroupList.tsx` used
  `<input type="url">`, but `globals.css`'s shared input rule only targets
  `input[type="text"|"number"|"date"|"password"]`, select, textarea — `type="url"`
  fell through to the browser default (narrow, unstyled), squeezing the field
  and clipping its value in the "active" row. Fixed by switching to
  `type="text"` (matches the existing convention for `siteUrl`/`paypalPlanUrl`
  in `ClientFormFields.tsx`, which are also plain text inputs, no native URL
  validation elsewhere either). `app-groups-desktop-before.png` /
  `app-groups-desktop-after.png` show the fix.

## Reviewed, no drift

- Dashboard, Clients (list + a record), Todo, Groups — token colors, three
  font roles, `.stamp` treatment (bordered/rotated/mono, not filled pills),
  `PageHeader` structure, dot-grid texture (`radial-gradient(circle,
  rgba(33,29,23,0.06) 1px, transparent 1px)` — byte-for-byte match with the
  artifact), sidebar/nav (numbered Workflow items, active-item left border),
  mobile hamburger + horizontal-scroll tables. No emoji anywhere.
- The Dashboard's *content* is intentionally different from the artifact's
  generic "pipeline snapshot" — it's the conversion-nags redesign from
  ticket 11, by design, not drift.
- `app-todo-desktop.png` (fullPage) shows the sidebar mid-page instead of
  pinned at top — that's a known Playwright fullPage-screenshot artifact with
  `position: sticky` elements (composite-stitches the sticky element at a
  stale scroll position), not a real rendering bug. Confirmed correct via
  `app-todo-viewport.png` (viewport-only capture, sidebar pinned as expected).

## Files

- `ref-*` = `os/_source/outreach-os.html` (served locally, `file://` is
  blocked by the Playwright sandbox).
- `app-*` = the live Next.js app.
- `app-groups-desktop-before/after.png` = the one real fix made this ticket.
