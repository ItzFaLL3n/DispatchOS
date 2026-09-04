# Content Rules — outreach posts

Canonical. Sources: `_source/CLAUDE.md` ("Content rules") + the prototype
Playbook page in `_source/outreach-os.html`. Accumulated from real posting
experience — Facebook Admin Assist flags, account-trust issues. Keep every
post-generating agent system prompt in sync with this file.

## Format — always two versions

- **Gif post version** — ~3 lines. Short, strong hook. For background-image FB
  posts.
- **Normal version** — 4–6 short lines. Explains one real benefit. Still casual
  and human.

Both `aiGenerate()` and any replacement return the same shape:
`{ gifVersion, normalVersion }`.

## Tone

Lowercase, casual, human-written. Short sentences. Zero corporate or
AI-sounding phrasing. No hashtags, no tags. Reads like a real person's FB post,
never a landing page.

## CTAs

- **Never:** "comment below", "dm me", "drop a [emoji] if…". Facebook's
  engagement-bait detection suppresses these.
- **Use:** open-ended alternatives — "reach out if that's you", "send a message
  my way".

## Offer framing

- Lead with the outcome *of the deliverable*, never the mechanism or tool name.
- State plainly: they own it, host anywhere, no strings, no hidden charges.
- Limited-spots framing stays a genuine operational constraint (see
  `hard-rules.md` rule 5).
- Feedback is the low-friction "price" of the free build.
- Hosting costs and fine print are **never** in the post — that's for the DM,
  once someone is already curious.

## Word choice

- **"free"** is a commonly configured keyword filter in Facebook group Admin
  Assist. The cost phrase must stay **swappable** ("at no cost", "on the
  house") — never hardcoded in a template or prompt.
- Avoid flagged/spammy keywords specific to a given group.

## Compliance

Always check a specific group's own posting rules before generating or posting
for it. Human step. The app surfaces `groups.rules_notes` to the generator but
cannot verify it.

## Account health (context — not app-enforced)

Newer or recently reactivated FB accounts get scrutinised harder.

- No links or URLs in posts.
- Don't edit a post right after publishing.
- Don't cross-post identical text across groups back-to-back — space it by
  hours, not minutes.
- Build genuine, non-promotional activity on the account over time.

## Hot-path checklist (mirrored by `fb-post-writer`)

- [ ] Two versions produced: `gifVersion` (~3 lines) + `normalVersion` (4–6
      short lines).
- [ ] Lowercase, casual, no hashtags, no em dashes, no corporate/AI phrasing.
- [ ] No CTA from the blocklist. Open-ended CTA only.
- [ ] Leads with the deliverable outcome, not the tool name or mechanism.
- [ ] No outcome promise (leads/calls/rankings).
- [ ] Cost phrase is a swappable token, not hardcoded "free".
- [ ] No links, no hosting cost, no fine print in the post body.
- [ ] Group `rules_notes` read and applied if a group is selected.

## Reconciliation notes

- `CLAUDE.md` says normal version is "4–6 short lines"; the prototype Playbook
  page says only "fuller length". Canonical = 4–6 short lines.
- `CLAUDE.md` offer framing says "lead with the outcome" and the prototype
  playbook page example parenthetically says *"('more jobs,' 'more calls')"* —
  that example **conflicts with `hard-rules.md` rule 1** (no outcome promises).
  Canonical: lead with the outcome *of the deliverable* ("a site that looks
  like your operation"), never a business result. The prototype's example
  wording is superseded.
