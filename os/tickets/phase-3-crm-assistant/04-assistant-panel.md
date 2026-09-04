# 04: Slide-out assistant panel

**What to build:** The UI — a panel reachable from any page, context-aware
of the client you're looking at, showing the conversation, pending-action
cards, and the auto-mode toggle.

**Blocked by:** 03.

**Status:** ready-for-agent

- [ ] Panel trigger in the sidebar footer, opens over whatever page is
      current. Client-record pages pass their `clientId`; everywhere else
      opens the general (`clientId: null`) thread.
- [ ] `components/assistant/AssistantPanel.tsx` — message history (loaded
      from `listMessages`), an input + send, calls
      `POST /api/assistant/message`.
- [ ] Pending-action cards: before/after diff of the proposed change,
      Approve/Reject buttons (`Panel`/`Button`/`Stamp` primitives — no
      exact precedent in the codebase, first new card-shaped component this
      phase).
- [ ] Auto-mode toggle in the panel header (`.toggle-group` pattern reused
      from Creator).
- [ ] All user- and AI-generated text escaped on render — same convention as
      every other page, nothing new to invent.
- [ ] No emoji, tokens only — same design-system bar as everywhere else.
- [ ] Manual verify: open from a client record, ask a real question, get a
      grounded answer; propose a low-stakes action with auto mode off, see
      the pending card, approve it, see it land as a timeline entry.
