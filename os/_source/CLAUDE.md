# Dispatch OS

Project reference for Claude Code. Documents the design system, data model, agent architecture, and business rules so future work stays consistent instead of drifting.

**Read `dispatch-os-build-spec.md` for the build plan. Read this for how things must look and behave.**

---

## What this is

A personal operations system for a local-service web agency (currently junk removal / hauling clients). One console: track prospects and clients through a ten-phase intake playbook, track the Facebook groups being worked, generate on-brand outreach posts, schedule them, and manage follow-ups.

Single user. Desktop and phone. Not a product.

**Current state:** `outreach-os.html` is the working prototype — one self-contained HTML file, no build step, no framework. It is being ported to Next.js + Supabase + the Anthropic SDKs. Treat it as the reference implementation for both visuals and behavior.

---

## Core philosophy — read this before writing any client-facing copy

This drives every message, pitch, and piece of content this system generates. Everything else here is implementation detail in service of it.

**The free website is not the offer — it's the opening move.** It exists to prove value and earn trust, not to close a one-time transaction. The goal is to become the client's long-term growth partner, the one handling their entire online presence — not "some random guy who built me a site once."

**The arc, for every client:**
free website (or free review agent) → hosting/maintenance retainer → Google Business Profile → review agent → full growth system.

**Why this matters for generated output:** no message, post, or pitch should be optimized to close in isolation. It's optimized for the relationship it's building toward. By the time a client is a few steps in, they should genuinely need us — not from lock-in, but because we've shown up and delivered every step. Keep this front of mind for every agent system prompt and any feature touching client-facing copy.

---

## Hard rules (non-negotiable, enforce in code and in prompts)

These are load-bearing. Violating them costs real client trust, and several were learned the expensive way.

1. **No outcome promises, ever.** Never promise leads, calls, Google rankings, or local recognition — at any tier, in any post, in any DM. Describe only what the system *does*. This applies to every generated string in the app.
2. **One ask per message.** Never bundle two questions or two pitches into a single DM.
3. **Zero-ask delivery.** Never stack domain, hosting, SEO, or pricing mentions into or immediately after site delivery. The sequence is delivery → zero-ask check-in → retainer offer. Compressing the *time* between steps is fine when a prospect is engaged. Changing the *order* is not.
4. **Never re-pitch a deferral.** "Let me get a few more jobs first" is a soft yes-later, not silence to chase. It gets acknowledged once and left alone. The `do_not_pitch_until` field exists to enforce this; the pipeline auditor must respect it absolutely.
5. **No manufactured urgency.** Limited-spot framing must reflect a genuine operational cap. If it isn't real, it doesn't get said.
6. **Client-facing voice is texting-style.** Lowercase, casual, short, one thought at a time. No corporate polish. No em dashes. This applies to DM drafts, never to internal UI copy.

---

## Design system

The direction is a **dispatch console / job-ticket aesthetic** — deliberately not a generic SaaS dashboard. It's grounded in the subject: the clients are hauling and dispatch businesses, so the tool borrows that world's vernacular (manifests, stamps, work orders) instead of defaulting to a Notion-style productivity look.

**Do not restyle during the React port.** Compare rendered output side by side against the artifact.

### Color tokens

| Token | Hex | Use |
|---|---|---|
| `--rail-bg` | `#1D1B17` | Sidebar background (dark ink) |
| `--rail-line` | `rgba(255,255,255,0.08)` | Hairlines inside sidebar |
| `--rail-text` | `#B7AF9B` | Inactive sidebar nav text |
| `--rail-text-active` | `#F5F1E6` | Active/hover sidebar nav text |
| `--rail-active-bg` | `rgba(225,83,33,0.18)` | Active nav item background |
| `--paper` | `#F1ECDF` | Main canvas background (warm kraft) |
| `--paper-hover` | `#E7DFC7` | Hover on paper-toned elements |
| `--card` | `#FFFDF8` | Card/panel background |
| `--ink` | `#211D17` | Primary text |
| `--ink-soft` | `#6E6656` | Secondary text |
| `--ink-faint` | `#A79E89` | Tertiary text / captions |
| `--line` | `#DED2B8` | Standard hairline borders |
| `--line-strong` | `#C7B896` | Emphasized borders |
| `--accent` | `#E15321` | Primary accent — safety orange |
| `--accent-hover` | `#C4441A` | Accent hover |
| `--accent-soft` | `#FBE1CF` | Accent tint |
| `--good` | `#2F6B3D` | Active / posted |
| `--warn` | `#B4740E` | Pending |
| `--bad` | `#B23A2E` | Flagged |
| `--info` | `#2A5C8A` | Scheduled |

**Do not** reach for the AI-generic cream + terracotta combo (`#F4F1EA` + `~#D97757`) — that pairing is an overused default. This palette uses a higher-chroma safety orange and pairs warm paper against a dark ink rail for contrast, not a second neutral.

In Tailwind, expose these as CSS custom properties in the theme layer rather than hardcoding hexes in components. **Do not install shadcn/ui defaults** — its visual language is the opposite of this one. Port `.stamp`, `pageHeader()`, `.panel`, and the button set by hand.

### Typography — three roles, used deliberately

- **Display** (`--font-display`): `'Barlow Condensed', 'Arial Narrow', sans-serif`. Bold condensed, uppercase, tight tracking. Page titles, panel and modal headers, section headers only. Reads like warehouse signage.
- **Body** (`--font-body`): `'Inter', -apple-system, …`. All prose, form inputs, task and post content, list rows. Never headers.
- **Mono** (`--font-mono`): `'JetBrains Mono', …`. Every label, caption, status stamp, table header, stat number, and the "Form No." ticket metadata. This is what creates the manifest feel — it should touch anything that is a value, label, or system-generated marker, never free-form prose.

Keep the three-way split when adding UI. Don't let body font creep into headers, don't use display for anything that isn't a true heading.

### Signature components

**Status stamps** (`.stamp` + modifier): bordered, rotated −1deg, monospace, uppercase — not soft filled pills. This is the recurring motif. Reuse it for any new status-like value rather than inventing a badge style.

```css
.stamp {
  font-family: var(--font-mono); font-size: 10.5px; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  padding: 3px 8px; border: 1.4px solid currentColor; border-radius: 3px;
  background: rgba(255,255,255,0.55); transform: rotate(-1deg);
}
```

**Ticket page headers** (`pageHeader(formNo, title, sub)`): every page opens with a "Form No. 0XX · [date]" eyebrow, a large uppercase condensed title, a double hairline rule, and a subtitle. Any new page uses this component, not a bespoke header.

**Nav structure:** grouped `Overview` / `Workflow` (numbered 01–06, because those six pages are a genuine operational sequence: Clients → Groups → Creator → Schedule → Library → Todo) / `Reference`. If adding a page, decide honestly whether it belongs in the numbered sequence. Don't number things that aren't sequential.

**Icons:** hand-drawn inline SVG line icons, 20×20 viewBox, 1.6 stroke-width, `stroke="currentColor"`, no fill. **No emoji anywhere in the UI** — this was a deliberate cleanup. Keep new icons in the same minimal line-art style.

### Spacing & shape
- Radius: `--radius-sm: 4px` (buttons, inputs, badges), `--radius-md: 6px` (cards, panels, modals). Small and consistent, not pill-rounded.
- Shadows minimal: `--shadow-card: 0 1px 2px rgba(33,29,23,0.07)`. A hairline lift, not a glow.
- Background texture: faint dot grid, `radial-gradient(circle, rgba(33,29,23,0.06) 1px, transparent 1px)` at 15px. Should read as tooth, not pattern.

---

## Data model

```js
clients: {
  id, businessName, contactName, location,
  source,          // 'fb-comment' | 'fb-dm' | 'fb-post-reply' | 'other'
  offerType,       // 'free-website' | 'free-review-agent' | 'both' | 'direct-pitch'
  buildStatus,     // 'not-started' | 'in-progress' | 'delivered'
  retainerStatus,  // 'not-pitched' | 'pitched' | 'deferred' | 'active' | 'declined'
  retainerTier,    // free text, nullable
  phase,           // 1..10 — current intake playbook phase
  phaseUpdatedAt,  // drives staleness detection
  nextActionAt,    // date the next touch is due
  doNotPitchUntil, // hard block — the auditor must never suggest a pitch before this
  siteUrl, domain, paypalPlanUrl, mrr, briefMd,
  notes, createdAt
}

groups: { id, name, status, rulesNotes, rulesUrl, lastPostDate, createdAt }
  // status: 'active' | 'pending' | 'flagged' | 'needs-review'

posts:  { id, clientId?, niche, offerType, gifVersion, normalVersion,
          groupId?, scheduledDate?, status, createdAt }
  // status: 'draft' | 'scheduled' | 'posted' | 'pending' | 'flagged'

todos:  { id, clientId?, title, dueDate?, priority, groupId?, status, createdAt }
  // priority: 'low' | 'medium' | 'high'; status: 'todo' | 'in-progress' | 'done'

agentRuns: { id, kind, clientId?, input, output, tokensIn, tokensOut, model, createdAt }
  // kind: 'post' | 'dm' | 'audit' | 'build' | 'recon'
```

`groups.status` describes the account/group relationship (is it in good standing); `posts.status` describes what happened to that specific post. Marking a post `posted` auto-updates its linked group's `lastPostDate`.

`clients` is its own top-level collection, not nested under `groups` — a client is a real business relationship, not a property of the FB group they were found in.

---

## Agent architecture

Two Anthropic libraries, used for different things. Do not conflate them.

**`@anthropic-ai/sdk` (Messages API)** — single-shot generation. Post generator, DM copilot, client-brief formatting. Runs in Next.js route handlers. Prompt in, structured JSON out. No agent loop.

**`@anthropic-ai/claude-agent-sdk` (Agent SDK)** — multi-step, tool-using work. Pipeline auditor, prospect recon, site builder. Entry point is `query()` with `ClaudeAgentOptions`. Gives Read/Write/Edit/Bash/Glob/Grep/WebSearch, subagents, and hooks.

**Subagents:** solo agent by default. Only the site builder (recon → build) and prospect research justify a split, and only in Phase 4. Subagents can't spawn their own subagents, so never put the Agent tool in a subagent's tool list.

**Skills live in `.claude/skills/`.** Each is a directory with a `SKILL.md` (YAML frontmatter + body). The playbook markdown in this project is the source material. If you set `settingSources` explicitly in `ClaudeAgentOptions`, you **must** include `"user"` and/or `"project"` — omitting them silently loads zero skills, which is the most common "skills not firing" cause.

**Every agent call writes to `agentRuns`.** No exceptions. This is how token cost gets tracked and how output quality gets evaluated over time.

**Structured output:** when an agent must return parseable data, instruct it to return only valid JSON with no markdown fences and no preamble, then strip fences defensively before parsing anyway. Both `aiGenerate()` and its replacement must always produce the same shape: `{ gifVersion, normalVersion }`.

---

## Content rules (canonical — keep every agent system prompt in sync with this)

Not arbitrary style choices. Accumulated from real posting experience (Facebook Admin Assist flags, account trust issues) and from how the outreach is meant to feel.

**Format** — always two versions: a ~3-line "gif post" (short, strong hook, for background-image FB posts) and a fuller "normal" version (4–6 short lines, explains a real benefit).

**Tone** — lowercase, casual, human-written, short sentences, zero corporate or AI-sounding phrasing, no hashtags. Reads like a real person's FB post, never a landing page.

**CTAs** — never "comment below," "dm me," or "drop a [emoji] if…" (Facebook's engagement-bait detection suppresses these). Use open-ended alternatives: "reach out if that's you," "send a message my way."

**Offer framing** — lead with the outcome, never the mechanism or tool name. State ownership and no-strings plainly. Limited-spots framing stays a genuine operational constraint. Feedback is the low-friction "price" of the free build. Hosting costs and fine print are never in the post — that's for the DM, once someone's already curious.

**Word choice** — "free" is a commonly flagged keyword in Facebook Admin Assist configurations. The cost phrase must stay swappable ("at no cost," "on the house"), never hardcoded.

**Compliance** — always check a specific group's own posting rules before generating or posting for it. Human step; the app surfaces `groups.rulesNotes` to the generator but cannot verify it.

**Account health** (context, not app-enforced) — newer or recently reactivated FB accounts get scrutinized harder. Avoid links in posts, avoid editing right after publishing, space cross-posting the same content across groups by hours, not minutes.

---

## Payment infrastructure

Recurring billing runs on **PayPal Subscriptions**. Stripe isn't practically available (Stripe India is invite-only and skewed toward registered businesses with a GSTIN). PayPal works for individuals without business registration and is trusted by US clients.

Account verification and bank confirmation are done. **Per client, still required:** the actual subscription plan and payment link for the specific tier, created in PayPal *before* the retainer conversation, so it's ready the moment they say yes. This is a recurring per-client step, not one-time setup. Store the link in `clients.paypalPlanUrl` and have the pipeline auditor flag any client at Phase 8 with an empty value.

---

## Conventions for extending

- New pages: a route, a nav entry, a component following the existing pattern, always opening with the `PageHeader` component.
- New status-like fields: reuse `.stamp` with a new color-mapped modifier, don't invent a badge component.
- All user-entered text escaped before render. Every existing render path does this; don't skip it for new fields.
- Toasts for any save or delete confirmation; a custom confirm modal for destructive actions. Avoid native `confirm()`/`alert()` — unreliable in sandboxed iframes and deliberately avoided in the prototype.
- Secrets in env vars only. Never an API key in client-side code, never a key committed.

## Known gaps / next steps

- Client-facing job dashboard — promised as part of the $39/$49 tier, asked for unprompted by two clients, not built.
- Web3Forms free tier is at capacity (one recipient slot left) and only retains 30 days of submissions. Replacing it with a Dispatch OS endpoint is both an unblock and a real deliverable.
- No image/asset field on posts — if gif-post versions become actual background-image graphics, there's nowhere to store the asset.
