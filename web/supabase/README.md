# Database

Raw SQL migrations, applied to the Supabase Postgres. No ORM (per
`os/decisions/0001-os-folder-structure.md` / spec 0001).

## Applying a migration

**Quickest (no tooling):** open the Supabase dashboard → **SQL Editor** → paste
the contents of the migration file → **Run**. Every statement is `IF NOT
EXISTS`, so re-running is safe.

**With the CLI** (optional, later): `supabase link` the project once, then
`supabase db push`.

## Migrations

| File | What it does |
|---|---|
| `migrations/0001_phase1_init.sql` | All six Phase 1 tables: `clients`, `groups`, `client_events`, `todos`, `posts` (unused until Phase 4), `agent_runs` (unused until Phase 2). RLS off by design. |

## Seeding

The six real clients are loaded by `pnpm seed` (ticket 04) from `os/clients/`,
not from SQL.
