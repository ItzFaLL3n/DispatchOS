# 04: Slide-out assistant panel

**What to build:** The UI — a panel reachable from any page, context-aware
of the client you're looking at, showing the conversation, pending-action
cards, and the auto-mode toggle.

**Blocked by:** 03.

**Status:** code done, typechecked/linted/built clean; interactive click-through NOT verified (see note)

- [x] Panel trigger in the sidebar footer (`AssistantIcon` + label), opens
      over whatever page is current. Client-record pages
      (`/clients/<uuid>`, detected from the URL in `AppShell` via
      `usePathname()` — not `/clients/new` or the bare list) pass their
      `clientId`; everywhere else opens the general (`clientId: null`)
      thread.
- [x] `components/assistant/AssistantPanel.tsx` — message history (loaded
      from a new `GET /api/assistant/messages?clientId=` route, which also
      returns the client's business name for a real scope label instead of
      a generic "this client"), an input + send, calls
      `POST /api/assistant/message`.
- [x] Pending-action cards: a plain-language description of the proposed
      change, Approve/Reject buttons (new `.assistant-action-card`
      component — no exact precedent in the codebase, built from
      `Panel`/`Button`/`.stamp` primitives). Approve calls
      `POST /api/assistant/approve`; reject is a local-only dismissal
      (nothing was ever applied, so there's nothing to undo).
- [x] Auto-mode toggle in the panel header (`.toggle-group` pattern reused
      from Creator, labeled Confirm/Auto). Defaults to **off** (confirm-first)
      on every panel open — matches the spec's stated safe default.
- [x] All user- and AI-generated text escaped on render — plain JSX
      interpolation throughout, same convention as everywhere else.
- [x] No emoji, tokens only — same design-system bar as everywhere else.
- [x] Fixed one `react-hooks/set-state-in-effect` lint error (the history-load
      effect called `setLoading`/`setError` directly instead of from a
      nested async function) — same fix pattern already established in this
      codebase (`ContactWindow.tsx`, `PhasePanel.tsx`).
- [x] Verified via curl (page renders with the trigger present, `GET
      /api/assistant/messages` works and is cookie-gated, other pages still
      render fine with the new `AppShell` wiring) — build/typecheck/lint/
      test:run all clean.
- [ ] **Not verified this round**: opening the panel, sending a message, and
      approving a card through the actual browser UI. The Playwright MCP
      connection was lost mid-session (an earlier broad `taskkill /IM
      node.exe /T` during ticket 02's worker testing killed it along with
      the intended targets — noted at the time, consequence landing here).
      It needs a session restart to reconnect; I can't work around that from
      inside this session. The underlying request/response flow (message →
      classify → apply/pending → approve) is already proven end-to-end at
      the API level in ticket 03's live verification — what's unverified
      here is specifically the React state wiring (does clicking Approve
      really call the route, does the toggle really flip auto mode, etc.).
      Worth an actual click-through once Playwright's back, or a manual
      check from you.
