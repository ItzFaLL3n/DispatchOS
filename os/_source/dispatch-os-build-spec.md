# Dispatch OS — Build Spec v2 (for Claude Code)

Supersedes the v1 spec. v1 said "port the artifact to Next.js + Supabase." That's still step one, but it undersold what this thing should become. v2 adds the agent layer: the markdown playbooks in this project stop being documents Bruce reads and become skills the app's agents actually run on.

Hand this file to Claude Code alongside `CLAUDE.md`, `outreach-os.html`, and the playbook docs.

---

## 0. What this is

Dispatch OS is Bruce's personal operations system for a local-service web agency (junk removal / hauling clients). One place holding: every client and prospect in the pipeline, the FB groups being worked, generated outreach posts, and follow-up tasks.

`outreach-os.html` is the working prototype — a single self-contained HTML file built inside a Claude.ai artifact. It works. It's stuck in a sandbox: no cross-device sync, and the AI generator only works because Claude.ai proxies the API call.

**Single user (Bruce), desktop + phone. No multi-tenant auth. This is a personal tool, not a product.**

The design is deliberate and Bruce likes it. Carry it over as-is. Do not restyle.

---

## 1. Blocking constraints from v1 (unchanged)

### 1a. `window.storage` doesn't exist outside the artifact
All reads/writes funnel through `loadState()`, `persist()`, and the raw `window.storage.*` calls inside them. Swapping the backend means touching those three, not the render logic.

### 1b. `fetch("https://api.anthropic.com/v1/messages")` with no key doesn't work outside the artifact
Needs a server-side route holding a real key. Never a key in client JS.

### 1c. No auth
One shared password in an env var, checked server-side, session cookie. Or Supabase magic link. Nothing more.

---

## 2. The architectural decision that matters most: where agents actually earn their keep

Bruce's instinct is "build it with the Agent SDK." Half right. Be precise about which SDK goes where, because getting this wrong costs latency, tokens, and deployment headaches.

There are two Anthropic libraries and they are not interchangeable:

| | `@anthropic-ai/sdk` (Messages API) | `@anthropic-ai/claude-agent-sdk` (Agent SDK) |
|---|---|---|
| What it does | One model call, you handle everything | Full agent loop — tool calls, context management, subagents, hooks |
| Entry point | `client.messages.create()` | `query()` with `ClaudeAgentOptions` |
| Built-in tools | none | Read, Write, Edit, Bash, Glob, Grep, WebSearch |
| Runs on serverless cleanly | yes | needs care — see below |
| Right for | single-shot generation | multi-step work with file/web access |

**Rule for this codebase:**

- **Single-shot generation → plain Messages API (`@anthropic-ai/sdk`).** Post generator, DM reply drafting, client-brief formatting. These are one prompt in, structured JSON out. An agent loop adds nothing but cost and latency. Runs fine in a Next.js route handler.
- **Multi-step, tool-using work → Agent SDK.** Pipeline auditor (reads records, checks dates against playbook rules, searches the web), site builder (writes actual files), prospect recon. These need tools and iteration.

### Deployment gotcha to spike on day one

The TypeScript Agent SDK bundles a native Claude Code binary and spawns it as a subprocess. **Verify early whether that runs inside a Vercel serverless function** before designing around it. If it doesn't, the fallback is clean: keep the Next.js app on Vercel, and run the agent jobs on a small always-on Node worker (Railway, Fly, or Render) that the app calls over HTTP. Do this spike in the first hour of Phase 2, not after building on the assumption.

The single-shot Messages API routes have no such issue and should ship first regardless.

### Billing note
As of June 15, 2026, Agent SDK and `claude -p` usage on Claude subscription plans draws from a separate monthly Agent SDK credit, distinct from interactive usage limits. Production deployments on an API key bill per token as normal. Budget accordingly — the pipeline auditor running nightly is the recurring cost, not the post generator.

---

## 3. Solo agent or subagents?

**v1 answer: solo agent with skills. Ship that. Add subagents only where noted below.**

Subagents each get their own context window, which is the point — they keep a long research job from eating the main conversation. They also cost a full extra round trip each and can't spawn their own subagents. For a single-user CRUD app with a generator bolted on, most jobs are one-shot and a subagent is pure overhead.

Two jobs genuinely justify subagents, and only once Phase 4 is reached:

1. **Site builder** — recon (read the client brief, pull FB photos, check the service area) is a separate context from writing HTML/CSS. Split it: a `recon` subagent produces a structured brief, a `builder` subagent writes files.
2. **Prospect research** — web searching a town's junk-removal competitive landscape for a future GBP pitch generates a lot of throwaway context. Isolate it.

Everything in Phases 1–3 is a solo agent or a plain API call. Don't build an orchestra to play a bugle line.

---

## 4. Skills: the unification move

This is the part worth getting excited about. The Agent SDK loads skills as filesystem artifacts — a directory with a `SKILL.md` (YAML frontmatter + instructions). The playbook documents in this project *are already* skill bodies. They just need frontmatter and a home.

**Create `.claude/skills/` in the repo with these, ported from the existing docs:**

| Skill | Source doc | What it governs |
|---|---|---|
| `fb-post-writer` | `CLAUDE.md` content rules + Playbook page | Two-version post format, tone, CTA rules, word-choice watch-outs |
| `intake-playbook` | `prospect-intake-playbook.md` | Phase 1–10 sequencing, golden rules, what to never mention before Phase 9 |
| `dm-copilot` | existing `dm-copilot` skill | Next-message drafting, phase detection, jargon translation |
| `pipeline-rules` | `hd-junk-removal-demolition-llc.md` + playbook | Never re-pitch a deferral, one ask per message, no outcome promises |
| `client-brief` | the two client-brief docs | Standard brief shape, phase tracker format |
| `growth-system` | `growth-system-upgrade-offer.md` | Tier definitions, eligibility timing, guarantee language |

**Loading gotcha:** the SDK discovers skills from `~/.claude/skills/` (user) and `.claude/skills/` in the working directory and its parents (project). If you set `settingSources` explicitly in `ClaudeAgentOptions`, you must include `"user"` and/or `"project"` — omitting them silently loads zero skills. This is the single most common "my skills aren't firing" cause. Set it explicitly and correctly rather than relying on defaults.

**Why this matters more than it sounds:** right now Bruce's rules live in markdown he has to remember to paste into a chat. Once they're skills, the app enforces them. The post generator can't produce "dm me" copy. The pipeline auditor can't suggest re-pitching Tyler before September 18. The rules stop being advice and become behavior.

---

## 5. Recommended Claude Code setup (for building this, not for the app)

Install these before starting. They shape how Claude Code works on the repo.

**Core stack — install all four:**

1. **`mattpocock/skills`** — Matt Pocock's public `.claude` directory. The relevant ones here: `grill-me` (interrogates a plan until assumptions are explicit — run this on this spec before writing code), `to-spec` and `to-tickets` (turn decisions into bounded work), `tdd`, `code-review`, `domain-modeling`, `git-guardrails-claude-code` (hooks that block destructive git commands). Run `setup-matt-pocock-skills` once in the repo first — it's interactive, and it writes a skills block into `CLAUDE.md` plus reference docs under `docs/agents/`. Note it assumes TypeScript/Node conventions, which matches this stack.
   ```
   /plugin marketplace add mattpocock/skills
   ```

2. **`superpowers`** (from Anthropic's official marketplace) — brainstorming, subagent-driven development, systematic debugging, red/green TDD, and skill authoring. Overlaps with Pocock's set on TDD and review; the non-overlapping value is the brainstorming gate and the skill-authoring workflow, which is exactly what Section 4 needs.
   ```
   /plugin marketplace add anthropics/claude-plugins-official
   /plugin install superpowers@claude-plugins-official
   ```

3. **`frontend-design`** (Anthropic official) — pushes UI away from templated defaults. Relevant because the existing dispatch/manifest aesthetic must survive the React port intact.

4. **Context7 MCP** — live, version-specific docs. Next.js App Router and Supabase both move fast enough that stale training data is a real failure mode here.

**Worth adding, situationally:**
- **Supabase MCP** — schema work and queries without leaving the session.
- **Chrome DevTools MCP** or **Playwright MCP** — verifying the ported UI actually renders identically to the artifact, rather than assuming.
- **Vercel MCP** — deploy and log inspection.

**Ordering advice:** don't install all of these at once. Every plugin adds context. Start with Pocock's set + Context7, add the rest when a phase actually needs them.

**Before writing any code:** run `grill-me` against this spec. Half the value of that skill is catching the thing this document got wrong.

---

## 6. Stack

- **Framework:** Next.js (App Router). One codebase, API routes, deploys to Vercel — already in use for client sites.
- **Database:** Supabase (Postgres). Free tier is far more than one user needs. Gives hosted auth for free.
- **Styling:** Tailwind, with the existing CSS custom properties from `CLAUDE.md` mapped as the theme. **Do not install shadcn/ui defaults** — its look is the opposite of what's here. Port the `.stamp`, `pageHeader()`, and panel components by hand.
- **Single-shot AI:** `@anthropic-ai/sdk` in Next.js route handlers.
- **Agentic AI:** `@anthropic-ai/claude-agent-sdk`, location pending the Section 2 spike.
- **Scheduled jobs:** Vercel Cron for the nightly pipeline audit.
- **Hosting:** Vercel.

---

## 7. Data model

Four collections carry over unchanged in shape: `clients`, `groups`, `posts`, `todos`. Exact fields in `CLAUDE.md`. In Postgres these become four tables; `group_id` / `client_id` foreign keys replace plain-string id references.

**New fields to add (these are real gaps in the current model):**

```
clients:
  + phase            int        -- 1..10, current playbook phase
  + phase_updated_at timestamp  -- drives staleness detection
  + next_action_at   date       -- e.g. Tyler's Sept 18 window
  + do_not_pitch_until date      -- hard block, enforced by the auditor
  + site_url         text
  + domain           text
  + paypal_plan_url  text        -- the per-tier subscription link
  + mrr              numeric     -- 0 for free-build clients
  + brief_md         text        -- the full client brief, editable in-app

groups:
  + rules_url        text

posts:
  + client_id        uuid null   -- some posts target a specific prospect

todos:
  + client_id        uuid null   -- link a follow-up to the client it's about
```

The `phase` + `do_not_pitch_until` pair is what makes the pipeline auditor possible. Without them it's guessing.

**New table:**
```
agent_runs:
  id, kind ('post'|'dm'|'audit'|'build'|'recon'),
  client_id null, input jsonb, output jsonb,
  tokens_in, tokens_out, model, created_at
```
Every agent call logged. This is how Bruce finds out what the tool actually costs him per month, and it's the substrate for evaluating whether the generator is getting better or worse.

---

## 8. Build phases

Each phase ships something usable. Don't start the next one until the current is deployed and Bruce has used it once.

### Phase 1 — Port (no AI)
1. Scaffold Next.js + Supabase, connect them.
2. Create the four tables with the new fields from Section 7.
3. Port each `renderX()` into a React component. Visual output identical to the artifact — compare side by side, don't eyeball it.
4. Replace `loadState()`/`persist()` with API routes over Supabase.
5. Password gate.
6. Deploy. Env vars in Vercel, never committed.
7. One-time data migration: open the artifact, `window.storage.list()` + `get()` in the console, export `clients`/`groups`/`posts`/`todos`, import.

**Done when:** Bruce can open it on his phone and see his real pipeline.

### Phase 2 — Post generator on a real key
1. Spike the Agent SDK serverless question (Section 2). Record the answer in `docs/agents/`.
2. Build `.claude/skills/fb-post-writer/SKILL.md` from the content rules.
3. `POST /api/generate-post` using `@anthropic-ai/sdk`, system prompt carried over from `aiGenerate()` and extended with the group's own `rulesNotes` when a group is selected.
4. Keep `templateGenerate()` as the offline fallback. It already exists and it works.
5. Log to `agent_runs`.

**Done when:** the Live AI toggle works outside the artifact and respects the group's rules.

### Phase 3 — The two features that actually change Bruce's week

**3a. Pipeline Auditor** (Agent SDK, nightly Vercel Cron + on-demand button)

Reads every client row, applies `intake-playbook` and `pipeline-rules` skills, outputs a prioritized action list to the dashboard:
- who's overdue for a Phase 8 zero-ask check-in
- who's gone quiet and needs the one light follow-up (then to be dropped)
- who's past `do_not_pitch_until` and is genuinely ready for a retainer conversation
- who's showing an ascension signal in their notes (asked about Google, mentioned missed calls)
- **what it must never do:** suggest re-pitching a client inside their `do_not_pitch_until` window, or bundle two asks into one suggested message

This is the highest-value thing in the whole build. Bruce currently holds five clients' phase state in his head and it's already leaking.

**3b. DM Copilot** (single-shot Messages API)

Paste a thread → get the next message, in his texting voice, plus a read on which phase the conversation is in and what the next phase gate is. Ports his existing `dm-copilot` skill into the app. One-click "save to client notes."

### Phase 4 — Site builder (subagents, optional)
Recon subagent → structured brief. Builder subagent → writes the site files from a standardized template. Output to a repo or straight to a Vercel deploy hook. This is where the Stone Method's "deploy the same system with a new business name" actually becomes literal.

Only start this after 2–3 sites have been built by hand from the same template, so the template is real and not theoretical.

---

## 9. Upgrades worth making while you're in here

**Replace Web3Forms.** Bruce's free-tier account is at capacity — one recipient slot left. Every new client is now blocked on it. Once Supabase exists, client contact forms can post to a Dispatch OS endpoint that stores the submission *and* forwards it (Resend free tier, 3k emails/month). Upside beyond unblocking: submissions land in the client's dashboard permanently instead of vanishing after Web3Forms' 30-day retention, which is a real answer to Tyler's "how do I see estimate requests?" question and a genuine deliverable for the $39/$49 tier.

**Client-facing job dashboard.** Tyler asked for job tracking unprompted; ProLift asked too. It's already promised as part of the retainer. Building it once inside Dispatch OS with a per-client read-only view is far less work than building it per client, and it's the concrete thing that makes $39/month obviously worth paying.

**PayPal plan links stored per client.** The recurring "create the plan before the conversation" step keeps almost getting missed. Put the field in the DB and have the auditor flag any client at Phase 8 whose `paypal_plan_url` is empty.

**Don't build:** any always-on autonomous agent runtime. A nightly cron plus a button covers everything here. Revisit only if the nightly audit proves genuinely useful for a couple of months.

---

## 10. What to hand Claude Code, in order

1. This file.
2. `CLAUDE.md` (v2).
3. `outreach-os.html` — the reference implementation.
4. `prospect-intake-playbook.md`, `growth-system-upgrade-offer.md`, `client-acquisition-system.md` — source material for the skills in Section 4.

First command in the session, before any code:
```
run grill-me on dispatch-os-build-spec.md
```
