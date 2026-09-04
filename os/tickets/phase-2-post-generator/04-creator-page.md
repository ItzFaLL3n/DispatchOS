# 04: Creator page

**What to build:** The real `/creator` page — mode toggle, the artifact's
input fields plus a group selector, generate, and a copy-ready output panel.
Replaces the `ComingSoon` stub. This is "done when I can open it and get a
real post out."

**Blocked by:** 03 (needs the route to call).

**Status:** done - live-verified in the real browser via Playwright MCP

- [x] `components/creator/Creator.tsx` (client component): mode toggle
      (Live AI / Template, `.toggle-group`/`.toggle-opt` ported from the
      artifact's CSS), fields for niche, offer type, spots, cost phrasing,
      extra context, and a group `<select>` (options passed in as a prop from
      `listGroups()`); calls `POST /api/generate-post` via `fetch` on submit.
- [x] Output panel: both generated versions shown (`.output-grid`/
      `.output-card`/`.output-text` ported from the artifact's CSS), a copy
      button each (`navigator.clipboard.writeText`).
- [x] A status line while generating ("asking claude..." in AI mode, matching
      the artifact's copy) and a toast ("Live AI generation failed — used
      template instead") when the response comes back `usedTemplate: true`.
- [x] `app/(app)/creator/page.tsx` replaces the `ComingSoon` stub: fetches
      `listGroups()`, renders `PageHeader` + `<Creator groups={...} />`.
- [x] All user-entered text (niche, extra context, generated output) escaped
      on render — plain JSX interpolation throughout, matches the existing
      convention, nothing new to invent.
- [x] No emoji, tokens only, `PageHeader` structure — same design-system bar
      as every other page. No inline styles either (matched during review —
      first draft had a couple, moved to `.creator-*`/`.output-card-actions`
      classes in `globals.css`).
- [x] Manual verify (Playwright MCP, real browser, screenshots in
      `04-creator-screenshots/`): form renders correctly at desktop width;
      Template mode generates and displays both versions; Copy button writes
      to the clipboard and shows the "Copied" toast; Live AI mode with no key
      falls back silently and shows the exact fallback toast text, output
      still usable. Real-AI-success + group-rules-notes-respected still
      needs a real key (same gap noted in ticket 03).
