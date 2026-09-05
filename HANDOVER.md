# Handover — Dispatch OS frontend redesign

Branch: **`redesign/shadcn-bklit`** (built on top of `master` @ `47ba573`, which is
itself **not yet pushed** to `origin/master`).

Dispatch OS is a solo web-agency operator's personal conversion CRM + guardrailed
AI assistant. Stack: Next.js 16 (App Router, RSC), React 19, Tailwind v4,
Supabase (service-role key, RLS off), pnpm. Separate `worker/` dir = the
Agent-SDK assistant worker (deployed on Render; untouched by this branch).

---

## Standing constraints (do not break)

- **Never push `web/` without asking the operator first.** Vercel auto-deploys and
  it eats a daily build quota. (The redesign branch push was explicitly
  authorised; future pushes are not.)
- When **reporting to the operator**, be extremely terse — sacrifice grammar for
  concision. (Does not apply to code comments or this doc.)
- `web/src/app/globals.css` header says the design system was "ported verbatim…
  do not restyle". The operator has since explicitly greenlit this redesign, so
  that line is superseded **for shadcn/bklit adoption** — but keep the brand
  identity intact (orange `--accent #e15321`, cream `--paper`, dark rail, mono
  accents, hand-drawn icon set in `src/components/icons.tsx`). PRODUCT.md at repo
  root is the brief; it explicitly rejects a "generic SaaS dashboard" look.

---

## What this branch did (5 commits, all `web/` only)

1. `f5ba483` **shadcn/ui installed + re-themed.** `npx shadcn init` (radix-nova
   preset). It clobbered `--accent`/`--card` (name collision with shadcn's own
   tokens) — fixed by restoring brand values and aliasing every shadcn semantic
   token (`--primary`, `--background`, `--sidebar`, …) to the brand palette in
   `:root`. It also overwrote the hand-rolled `Button` component with shadcn's;
   variant names updated app-wide (`primary`→`default`, `danger`→`destructive`).
   `Button.tsx` was renamed to lowercase `button.tsx` (case-only rename; the
   mismatch compiled on Windows but breaks on Vercel's Linux build).
2. `389c5bf` **bklit chart registry.** `@bklit/bar-chart` + `@bklit/area-chart` +
   `@bklit/shimmering-text`, registry added to `components.json`. Vendored files
   land in `src/components/charts/**` — **excluded from eslint** (third-party
   generated, uses ref-in-render patterns our config rejects). Its chart-chrome
   CSS vars (`--chart-grid`, `--chart-tooltip-*`, `--chart-scale-*`, …) were
   re-themed to brand tokens. New dashboard: **Pipeline-by-phase** bar chart
   (`src/components/PipelineChart.tsx`).
3. `1336812` **MRR trend chart** (`src/components/MrrTrendChart.tsx`) + migration
   `0004_mrr_snapshots.sql`. Dashboard upserts today's active-retainer MRR total
   on every load; renders the history as a bklit area chart. Degrades gracefully
   (empty state) if the migration isn't applied.
4. `30ec823` **shadcn form/table/dialog primitives installed** (input, select,
   textarea, label, table, tabs, badge, checkbox, alert-dialog).
5. `f03409d` **propagated shadcn across the app.** Every native
   `<select>`/`<input>`/`<textarea>`/`.btn` in Clients (list + detail + record
   edit + phase panel + timeline + bridge gate), Groups, Todo, Creator, Login,
   and the Assistant panel is now a shadcn component. Delete confirmations use
   `AlertDialog` (custom `Modal.tsx` deleted). Segmented toggles (Confirm/Auto,
   Chat/DM, Creator's Live AI/Template) use `Tabs`.

**Reverted (operator didn't like it):** an Aceternity hover-expand sidebar
(`@aceternity/sidebar-demo`). `git reset --hard` removed the commit; the current
sidebar is the original hand-rolled dark rail. `@tabler/icons-react` may still be
physically in `node_modules` but is not in `package.json` — `pnpm prune` clears it.

---

## Gotchas / patterns established

- **Radix `Select` cannot use an empty-string item value.** Pickers that had a
  blank "none" option now send the literal string `"none"`; server parsers were
  updated to treat `"none"` === cleared. Affected: `phaseSubstate`
  (`lib/data/phaseInput.ts`), todo `clientId`/`groupId` (`lib/data/todoInput.ts`).
  Both have tests. **Any new Select with an optional value must follow this.**
- **shadcn `add` re-runs are invasive.** Each `shadcn add` re-appends a `.dark {}`
  block to `globals.css` (app has no dark mode — delete it) and may re-prompt to
  overwrite `lib/utils.ts`. It also auto-added `@aceternity` to `components.json`
  registries from a built-in list.
- **shadcn `Table` forces `white-space: nowrap`** via a utility class → horizontal
  scrollbar. Overridden with `white-space: normal` on `.table th/td` (our own
  unlayered CSS wins over Tailwind's `@layer utilities`).
- **`cn` is the npm package `"cn"`** (not `@/lib/utils` re-export in most vendored
  files — some import `from "cn"` directly). `clsx` + `tailwind-merge` also
  installed.
- Table-missing fallbacks check **both** `42P01` (raw Postgres) and `PGRST205`
  (what supabase-js actually returns for a missing table). See
  `lib/data/settings.ts`, `lib/data/mrrSnapshots.ts`.

---

## Migrations — apply in Supabase SQL Editor (no CLI linked)

| File | Status | What |
|---|---|---|
| `0001` / `0002` | applied | phase 1 + phase 3 schema |
| `0003_phase4_goals_mistakes.sql` | **applied by operator** | `mistake` event kind + `app_settings` singleton (`mrr_goal`) |
| `0004_mrr_snapshots.sql` | **NOT applied yet** | `mrr_snapshots` (one row/day). MRR trend chart shows "tracking starts today" until this runs. |

Client data: all 6 clients from `os/clients/*/` (brief + history + overrides) were
imported into Supabase via a one-off script (already run, script deleted). They're
live in `clients` + `client_events`.

---

## Verify / run

```
cd web
npx tsc --noEmit            # clean
npx eslint . --quiet        # clean (charts dir excluded)
npx vitest run              # 191 passing
npm run dev                 # localhost:3000; APP_PASSWORD in .env.local
```

Visual QA was done with Playwright MCP (screenshots to repo root, cleaned up
after). Dashboard, clients list/detail, groups, todo, creator, login, assistant
panel, delete dialog all verified at 1440px + one mobile pass.

---

## Open follow-ups

- **Push `origin/master`?** `47ba573` (phase labels, clear-chat, revenue-goal +
  mistake-log, migration 0003) is committed on `master` locally but not pushed.
  Ask the operator.
- Apply migration `0004` in Supabase.
- Schedule / Library / Playbook pages are 5-line stubs — not built out, nothing
  migrated there.
- Dashboard content overflows horizontally at ~400px viewport (pre-existing
  responsive gap in the panels/charts, not caused by this branch).
- Creator page's real-AI path (needs a live `ANTHROPIC_API_KEY`) has never been
  verified end-to-end; only template/fallback mode is proven.
- `os/tickets/phase-3-crm-assistant/06-*.md` covers the model-switch +
  create-client work that shipped on `master` before this branch.
