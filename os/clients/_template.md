# Client Brief Template

Copy this into `clients/<slug>/brief.md`. Each client folder holds:

- `brief.md` — facts + current phase tracker (this shape). Kept current.
- `history.md` — dated log, newest entry at the bottom. Append only.
- `overrides.md` — deviations from `../../knowledge/intake-playbook.md`. Skills
  read this **before** the canonical playbook. If none: the file says "None."

---

## <Business Name>

| Field | Value |
|---|---|
| Slug | `<kebab-slug>` |
| Contact name | |
| Location / service area | |
| Timezone | IANA name, e.g. `America/Chicago`. Drives the client-local clock + contact-window |
| Contact hours | override for the 9am–8pm client-local default, nullable, e.g. "evenings only" |
| Source | `fb-comment` \| `fb-dm` \| `fb-post-reply` \| `other` |
| Offer type | `free-website` \| `free-review-agent` \| `both` \| `direct-pitch` |
| Build status | `not-started` \| `in-progress` \| `delivered` |
| Retainer status | `not-pitched` \| `pitched` \| `deferred` \| `active` \| `declined` |
| Retainer tier | free text, nullable |
| MRR | 0 until a retainer is active |
| Site URL | |
| Domain | |
| PayPal plan URL | must be populated before a Phase 9 pitch |

## Phase tracker

- **Current phase:** `<1..10>` — `<phase name from intake-playbook.md>`
- **Phase updated:** `<YYYY-MM-DD>`
- **Next action:** `<what>` — due `<YYYY-MM-DD>`
- **do_not_pitch_until:** `<YYYY-MM-DD or —>`

## What we still need (drives the build / next message)

- [ ] ...

## Notes

Free-form. Business context, personality, anything that shapes the next touch.

## Open ascension signals

Any client-originated signal from the `acquisition-strategy.md` trigger table
(asked about Google, mentioned a missed call, etc.), with the date it appeared.
