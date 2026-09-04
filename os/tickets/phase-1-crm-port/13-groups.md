# 13: Groups

**What to build:** A working Groups page — the list of Facebook groups being
worked, with create / edit / delete — so the data the Phase 2+ post generator
will need already exists and is maintainable now.

**Blocked by:** 03.

**Status:** ready-for-agent

- [ ] The Groups page lists groups with name, status, rules notes, rules URL,
      and last-post date.
- [ ] Create / edit / delete all work; delete uses the custom confirm modal.
- [ ] `status` ∈ {active, pending, flagged, needs-review}, a constrained input,
      rendered with a `.stamp`.
- [ ] `rules_notes` is multi-line free text; `rules_url` is an optional URL.
- [ ] `last_post_date` is editable now (Phase 4 will auto-update it when a post
      is marked posted — out of scope here).
- [ ] All user-entered text escaped on render.
- [ ] Test (CRUD boundary): create a group → read it back; update its status →
      persists; delete → gone.
