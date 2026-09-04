# 03: Schema + data module + Clients list (read path)

**What to build:** The full Phase 1 database schema, a `data` module that is the
only place Supabase is queried and the only place snake_case↔camelCase
translation happens, and a Clients page that renders the real client rows from
the database (business name, contact name, phase, retainer status).

**Blocked by:** 01, 02.

**Status:** code done - migration + live check pending operator

- [x] A migration creates every Phase 1 table with the columns and enum-valued
      text fields from the spec's schema block: `clients` (incl. `slug` unique,
      `delivered_at`, `phase_substate`, `phase_updated_at`, `next_action_note`,
      `checkin_landed`, `nothing_asked_since_delivery`), `client_events`
      (incl. `resolved_at`), `groups`, `posts`, `todos`, `agent_runs`.
      `posts` and `agent_runs` are created but unused.
- [x] `client_events.client_id` cascades on client delete.
- [x] The `data` module exposes `listClients()` and `getClient(id)` returning
      camelCase objects; the snake↔camel mapper is internal to this module.
- [x] RLS is off; all access uses the service-role key server-side.
- [x] The Clients page (behind the gate) lists real rows: business name,
      contact name, phase, retainer status. Empty DB → an empty-state, not an
      error.
- [x] Test (CRUD boundary, throwaway Supabase schema): insert a client row,
      call `getClient`, assert the returned object is camelCase and values
      round-trip.
