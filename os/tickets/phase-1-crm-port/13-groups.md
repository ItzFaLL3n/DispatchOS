# 13: Groups

**What to build:** A working Groups page — the list of Facebook groups being
worked, with create / edit / delete — so the data the Phase 2+ post generator
will need already exists and is maintainable now.

**Blocked by:** 03.

**Status:** done - verified live (CRUD, XSS-escaped render, status stamp tones)

- [x] The Groups page lists groups with name, status, rules notes, rules URL,
      and last-post date.
- [x] Create / edit / delete all work; delete uses the custom confirm modal.
- [x] `status` ∈ {active, pending, flagged, needs-review}, a constrained input,
      rendered with a `.stamp`.
- [x] `rules_notes` is multi-line free text; `rules_url` is an optional URL.
- [x] `last_post_date` is editable now (Phase 4 will auto-update it when a post
      is marked posted — out of scope here).
- [x] All user-entered text escaped on render.
- [x] Test (CRUD boundary): create a group → read it back; update its status →
      persists; delete → gone.
