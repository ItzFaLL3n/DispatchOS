# 01: Scaffold + deploy pipeline

**What to build:** A Next.js App Router app in `web/` that renders the dispatch
console chrome — dark rail nav, warm paper canvas, dot-grid texture — with the
design tokens from `os/knowledge/design-system.md` wired as Tailwind theme CSS
custom properties, and the shared primitives (`PageHeader` / ticket eyebrow,
`.stamp`, panel, button set) hand-ported from `os/_source/outreach-os.html`. One
placeholder page renders inside the layout. A Supabase project is connected via
env vars. The app is deployed to Vercel and loads at a URL.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] `web/` holds a Next.js App Router project; `pnpm dev` serves it locally.
- [ ] Tailwind theme layer exposes every token from `design-system.md`
      (`--rail-bg`, `--paper`, `--accent`, the status colours, radii, shadow,
      dot-grid) as CSS custom properties — no hardcoded hexes in components.
- [ ] Fonts loaded: Barlow Condensed (display), Inter (body), JetBrains Mono
      (mono), each with the fallback stack from `design-system.md`.
- [ ] `PageHeader` renders the "Form No. 0XX · date" eyebrow, condensed
      uppercase title, double hairline rule, subtitle.
- [ ] `.stamp`, panel, and the button set match the artifact visually.
- [ ] Rail nav shows the grouped structure (Overview / Workflow 01–06 /
      Reference); no emoji; icons are 20×20, 1.6-stroke, currentColor, no fill.
- [ ] `@supabase/supabase-js` client is created server-side from
      `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`; the key never reaches the
      client bundle.
- [ ] `.env.example` lists every Phase 1 env var; real values are in Vercel,
      not committed. `.gitignore` covers `node_modules`, `.next`, `.env*`.
- [ ] The app is deployed to Vercel and reachable at a URL.
