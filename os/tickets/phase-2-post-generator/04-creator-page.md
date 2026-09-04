# 04: Creator page

**What to build:** The real `/creator` page — mode toggle, the artifact's
input fields plus a group selector, generate, and a copy-ready output panel.
Replaces the `ComingSoon` stub. This is "done when I can open it and get a
real post out."

**Blocked by:** 03 (needs the route to call).

**Status:** ready-for-agent

- [ ] `components/creator/Creator.tsx` (client component): mode toggle
      (Live AI / Template, `.toggle-group`/`.toggle-opt` ported from the
      artifact's CSS), fields for niche, offer type, spots, cost phrasing,
      extra context, and a group `<select>` (options passed in as a prop from
      `listGroups()`); calls `POST /api/generate-post` via `fetch` on submit.
- [ ] Output panel: both generated versions shown (`.output-grid`/
      `.output-card`/`.output-text` ported from the artifact's CSS), a copy
      button each (`navigator.clipboard.writeText`).
- [ ] A status line while generating ("asking claude..." in AI mode, matching
      the artifact's copy) and a toast ("Live AI generation failed — used
      template instead") when the response comes back `usedTemplate: true`.
- [ ] `app/(app)/creator/page.tsx` replaces the `ComingSoon` stub: fetches
      `listGroups()`, renders `PageHeader` + `<Creator groups={...} />`.
- [ ] All user-entered text (niche, extra context, generated output) escaped
      on render — matches the existing convention, nothing new to invent.
- [ ] No emoji, tokens only, `PageHeader` structure — same design-system bar
      as every other page.
- [ ] Manual verify: generate in Template mode (works with no key), generate
      in Live AI mode with a real key (real Claude output, respects a
      selected group's `rules_notes`), copy buttons work.
