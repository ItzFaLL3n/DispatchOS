# 06: Model switching, create-client tool, persistent panel

**What to build:** Three small extensions on top of the shipped Phase 3
assistant, requested directly after real-worker testing rather than through
a fresh grilling session (additive to an already-scoped system, not a new
architecture).

**Blocked by:** 05.

**Status:** done — 190 tests, model-switch + create-client live-verified against the deployed worker/prod app; panel UI verified by tsc/eslint (no fresh browser click-through this pass).

- [x] **Model switch.** A picker in the panel (Sonnet / Opus / Haiku) sets
      `options.model` on the Agent SDK `query()` call. Threaded:
      `AssistantPanel` toggle → `/api/assistant/message` body.model →
      `callWorker` → worker `handleMessage` → `query({ options: { model }})`.
      Default stays Sonnet if unset.
- [x] **`propose_create_client` tool.** The assistant currently can update an
      existing client but can't create one — the operator wants to paste a
      raw brief and have the assistant extract fields and create the record,
      through the same guardrail flow as everything else. Required fields
      mirror `parseClientForm(mode: "create")`'s own requirements
      (businessName, source, offerType, buildStatus); everything else
      optional. `classifyAction` needs no change — creates only become
      `always-confirm` when they touch a protected field via `update`, and a
      brand-new record has no prior state to protect, so this stays
      `auto-eligible` like todo/event creation.
- [x] **Persistent panel.** Reported bug: clicking anywhere outside the
      420px panel (including the sidebar, since the backdrop is a
      full-viewport `position: fixed; inset: 0` catching the click) closes
      it. Operator wants it to feel like part of the CRM, not a dismissible
      modal. Fix: drop the click-to-close backdrop; the panel becomes a
      docked flex item in `.app`'s layout, closable only via the explicit ×
      (or the sidebar trigger again).

**Guardrail scope confirmed unchanged**: asked directly whether
phase/retainerStatus/doNotPitchUntil updates should also go auto — operator
said no, keep those confirm-gated same as deletes. Only the missing
create-client capability was the actual ask.
