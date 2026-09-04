# 05: DM-copilot mode

**What to build:** The second toggle inside the same panel — paste a raw DM
thread, get a drafted reply plus the CRM writes that thread implies, all
through the same guardrail flow ticket 03 already built. Retires the
paste-and-draft-only behavior of the old `dm-copilot` skill in favor of one
that can actually touch the record.

**Blocked by:** 04.

**Status:** ready-for-agent

- [ ] `Chat` / `DM thread` toggle in the panel (same `.toggle-group` as the
      auto-mode toggle, or a second row of it).
- [ ] DM-mode system prompt compiled from `os/knowledge/content-rules.md` +
      **all seven** `hard-rules.md` rules (not just 1/5 — DM mode is
      sequencing-sensitive: one ask per message, zero-ask delivery, never
      re-pitch a deferral all apply to a drafted reply). Its own constant,
      separate from Creator's `contentRules.ts` — the rule subset differs.
- [ ] In DM mode, the pasted thread becomes the tool's context for
      `propose_client_update`/`propose_create_client_event` — a phase signal
      or ascension signal in the thread becomes a proposed action, same
      pending-card flow.
- [ ] Manual verify: paste a realistic thread (e.g. a client asking about
      Google reviews post-delivery), confirm a drafted reply comes back that
      passes the pre-send checklist (`hard-rules.md`), confirm an
      ascension-signal `client_events` action gets proposed for that same
      thread.
