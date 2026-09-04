---
name: fb-post-writer
description: >-
  Generate Facebook group outreach posts for the agency's free-website offer.
  Use when writing, drafting, or revising an FB post or "gif post", when a niche
  or group is given and a post is needed, or when the Dispatch OS post generator
  runs. Produces two versions every time — a ~3-line gif-post version and a 4–6
  line normal version — in a lowercase, human, non-salesy voice.
---

# FB Post Writer

Writes agency outreach posts for the free-website (or free-review-agent) offer.

**Canonical rules:** `os/knowledge/content-rules.md`. Read it for anything not
covered by the checklist below. **If a group is selected**, read that group's
`rules_notes` and apply them before generating.

## Output shape

Return exactly `{ gifVersion, normalVersion }` — valid JSON, no markdown
fences, no preamble. Strip fences defensively if you post-process.

- `gifVersion` — ~3 lines. Short, one strong hook. For background-image posts.
- `normalVersion` — 4–6 short lines. Explains one real benefit.

## Hot-path checklist (run every time — mirrors content-rules.md)

- [ ] Two versions produced: `gifVersion` (~3 lines) + `normalVersion` (4–6
      short lines).
- [ ] Lowercase, casual, no hashtags, no em dashes, no corporate / AI phrasing.
- [ ] No CTA from the blocklist ("comment below", "dm me", "drop a [emoji]
      if…"). Open-ended CTA only ("reach out if that's you", "send a message my
      way").
- [ ] Leads with the outcome **of the deliverable** ("a site that looks like
      your operation"), never a business result ("more calls", "more jobs").
- [ ] No outcome promise — no leads, calls, rankings, or recognition, ever.
- [ ] Cost phrase is a swappable token ("at no cost", "on the house"), never a
      hardcoded "free".
- [ ] No links, no hosting cost, no fine print in the post body.
- [ ] Genuine operational scarcity only, if any is used.
- [ ] Group `rules_notes` read and applied when a group is selected.

## Never

Promise a result. Sound like a landing page. Bundle two offers. Put a link in
the post. Hardcode "free".
