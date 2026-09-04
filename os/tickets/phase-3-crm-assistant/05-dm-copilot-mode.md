# 05: DM-copilot mode

**What to build:** The second toggle inside the same panel — paste a raw DM
thread, get a drafted reply plus the CRM writes that thread implies, all
through the same guardrail flow ticket 03 already built. Retires the
paste-and-draft-only behavior of the old `dm-copilot` skill in favor of one
that can actually touch the record.

**Blocked by:** 04.

**Status:** done - live-verified end-to-end (real local worker, real thread)

- [x] `Chat` / `DM thread` toggle in the panel — a second `.toggle-group` row
      below the header. Switching to DM mode also grows the input textarea
      (2 → 6 rows) and swaps the placeholder, since a pasted thread is
      multi-line.
- [x] `worker/prompts.mjs` — `CHAT_SYSTEM_PROMPT` (the base prompt, unchanged
      from ticket 02) + `DM_MODE_SYSTEM_PROMPT` (base prompt + all seven
      `hard-rules.md` rules + the pre-send checklist, compiled by hand — DM
      mode is sequencing-sensitive in a way Creator's standalone posts
      aren't, so it needed the full rule set, not Creator's rules 1/5
      subset). `mode` threaded through `AssistantPanel` → `/api/assistant/message`
      → `callWorker` → the worker's request body → which system prompt
      `handleMessage` selects.
- [x] In DM mode, the pasted thread is just the `message` — the worker
      reads it in context and its `propose_client_update`/
      `propose_create_client_event` tools work exactly as in chat mode (no
      guardrail special-casing needed; `classifyAction` doesn't care which
      mode produced an action).
- [x] **Real gap found and fixed, twice**: the model's final reply kept
      *referencing* a drafted message ("send the draft above") without ever
      actually including the draft text anywhere in its output — confirmed
      via the raw `agent_runs.output` row, not a truncation artifact (2082
      output tokens generated, genuinely none of it the draft). A first,
      softer instruction ("include the actual drafted message") didn't fix
      it. Fixed with a **fixed output format** (`DRAFT:` / `NOTES:` sections)
      plus an explicit failure condition ("no DRAFT: section = you failed")
      plus a worked example — model behavior, not a config bug, and only the
      combination of all three actually got reliable compliance.
- [x] Live-verified (disposable seed + manual cleanup, same pattern as
      tickets 02/03): pasted a realistic thread (a delivered client
      reporting a missed call + asking why they're not showing up on
      Google — a genuine ascension signal) in DM mode. Confirmed: the reply
      contains a real `DRAFT:` section in the operator's texting voice, no
      outcome promise, no pricing/retainer/SEO mentioned in the draft
      (zero-ask respected); an `ascension-signal` `client_events` action
      proposed (`auto-eligible`); a phase 8→9 update proposed with the
      bridge substate cleared and a next-action note to send the retainer
      pitch as its **own separate message** (rule 2/3 compliance, right out
      of the model's own reasoning) — correctly classified `always-confirm`
      since it touches `phase`/`phaseSubstate`.
