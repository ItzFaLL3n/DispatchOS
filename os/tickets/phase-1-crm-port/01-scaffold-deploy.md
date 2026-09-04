# 01: Scaffold + deploy pipeline

**What to build:** A Next.js App Router app in `web/` that renders the dispatch
console chrome — dark rail nav, warm paper canvas, dot-grid texture — with the
design tokens from `os/knowledge/design-system.md` wired as Tailwind theme CSS
custom properties, and the shared primitives (`PageHeader` / ticket eyebrow,
`.stamp`, panel, button set) hand-ported from `os/_source/outreach-os.html`. One
placeholder page renders inside the layout. A Supabase project is connected via
env vars. The app is deployed to Vercel and loads at a URL.

**Blocked by:** None (can start immediately).

**Status:** done except deploy (needs operator: Vercel import + env vars)

- [x] `web/` holds a Next.js App Router project (Next 16, pnpm); `pnpm dev`
      serves it locally. `pnpm build` + `pnpm lint` + `pnpm typecheck` pass.
- [x] Tailwind theme layer exposes every token from `design-system.md` as CSS
      custom properties (`:root` + `@theme inline` in `globals.css`) — no
      hardcoded hexes in components.
- [x] Fonts loaded via `next/font`: Barlow Condensed (display), Inter (body),
      JetBrains Mono (mono), each with the fallback stack from
      `design-system.md`.
- [x] `PageHeader` renders the "Form No. 0XX · date" eyebrow, condensed
      uppercase title, double hairline rule, subtitle (verified in rendered
      HTML).
- [x] `.stamp` (as `Stamp`), `.panel` (as `Panel`), and the button set (as
      `Button` / `buttonClassName`) ported verbatim from the artifact CSS.
- [x] Rail nav shows the grouped structure (Overview / Workflow 01–06 /
      Reference); no emoji; icons are 20×20, 1.6-stroke, currentColor, no fill.
- [x] `@supabase/supabase-js` client created server-side (lazy, service-role,
      `server-only` import) from `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`;
      verified absent from the static bundle.
- [x] `.env.example` lists every Phase 1 env var. `web/.gitignore` covers
      `node_modules`, `.next`, `.env*`; root `.gitignore` + `.gitattributes`
      added.
- [ ] The app is deployed to Vercel and reachable at a URL. — **operator step:
      import `dispatch-os` in Vercel, Root Directory `web`, paste the five env
      vars, deploy.**
