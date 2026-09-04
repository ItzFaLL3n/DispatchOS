# 05: Client record — view / inline edit / add / delete

**What to build:** A full client record page showing every brief field plus the
free-form `brief_md`, with inline editing that saves and confirms; a form to add
a new client; and a delete that requires a confirm step.

**Blocked by:** 03.

**Status:** done - verified live (create/read/update/delete) against real Supabase; whole-record edit toggle

- [x] Opening a client from the list shows all structured brief fields
      (business, contact, location, timezone, contact hours, source, offer
      type, build/retainer status, retainer tier, MRR, site URL, domain, PayPal
      plan URL, notes) and the `brief_md` body.
- [x] Each field edits inline; save persists via a server action through the
      `data` module and shows a confirmation toast.
- [x] `brief_md` edits in a multi-line editor and saves the same way.
- [x] An "add client" form creates a record with at least business name +
      source + offer type + build status; the rest optional.
- [x] Enum fields (source, offer type, build/retainer status) are constrained
      inputs, not free text.
- [x] Deleting a client opens a custom confirm modal (not native `confirm()`);
      confirming removes the client and cascades its events.
- [x] All user-entered text is escaped on render.
- [x] Tests (CRUD boundary): create → `getClient` returns it; update a field →
      persists; delete → `getClient` returns nothing.
