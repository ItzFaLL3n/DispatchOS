# 12: Todos

**What to build:** A working Todo page — create, edit, complete, delete — with
status and priority filters and an optional link to a client or group, and the
open todos for a client shown on that client's record.

**Blocked by:** 03, 05.

**Status:** done - verified live (CRUD, filters, client open-todos, FK set-null)

- [x] The Todo page lists todos with title, due date, priority, status, and any
      linked client/group.
- [x] Create / edit / complete / delete all work; delete of a todo is a light
      action (no confirm modal needed — it is not a client).
- [x] `priority` ∈ {low, medium, high}; `status` ∈ {todo, in-progress, done},
      both constrained inputs.
- [x] Filters by `status` and by `priority` combine.
- [x] A todo can optionally reference a `client_id` and/or `group_id`; the
      picker only offers existing records.
- [x] The client record shows that client's open todos (`status != done`).
- [x] Tests (CRUD boundary): create a todo linked to a client → it appears in
      the client's open-todos list; mark done → it leaves that list; filter by
      priority returns the right set.
