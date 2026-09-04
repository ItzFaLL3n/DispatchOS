---
name: client-brief
description: >-
  Create or update a client record in os/clients/. Use when onboarding a new
  prospect, formatting or revising a client brief, updating a phase tracker,
  appending to a client history log, or recording a playbook override. Keeps
  every client folder in the standard three-file shape (brief.md, history.md,
  overrides.md).
---

# Client Brief

Maintains the `os/clients/<slug>/` record.

**Canonical shape:** `os/clients/_template.md`. Copy it for a new client.

## The three files

- `brief.md` — facts + the phase tracker. Kept current (overwrite fields as
  they change).
- `history.md` — dated log, newest entry at the bottom. **Append only** — never
  edit or delete a past entry.
- `overrides.md` — deviations from `os/knowledge/intake-playbook.md`. If none,
  the file explicitly says "None." Skills read this before the canonical
  playbook.

## Hot-path checklist

- [ ] Slug is kebab-case and matches the folder name.
- [ ] `brief.md` has every template field, `—` where unknown (not blank/absent).
- [ ] `timezone` is a valid IANA name (drives the client-local clock +
      contact-window); `contact_hours` set only if it differs from the
      9am–8pm-local default.
- [ ] Phase tracker: current phase + name, phase-updated date, next action +
      due date, `do_not_pitch_until` (or `—`).
- [ ] `source` ∈ {`fb-comment`, `fb-dm`, `fb-post-reply`, `other`}.
- [ ] `offer_type` ∈ {`free-website`, `free-review-agent`, `both`,
      `direct-pitch`}.
- [ ] `build_status` ∈ {`not-started`, `in-progress`, `delivered`}.
- [ ] `retainer_status` ∈ {`not-pitched`, `pitched`, `deferred`, `active`,
      `declined`}.
- [ ] MRR is 0 unless a retainer is `active`.
- [ ] A new `history.md` entry is appended (not inserted) with a date heading.
- [ ] `overrides.md` exists — "None." if there are none.
- [ ] Any ascension signal captured with the date it appeared.
- [ ] User-entered free text is escaped wherever the app will render it.

## Never

Rewrite history. Leave a template field silently missing. Put a deviation only
in `brief.md` notes without also recording it in `overrides.md`.
