# Dispatch OS — assistant worker

The CRM assistant's Agent SDK runtime (spec `os/specs/0003-phase-3-crm-assistant.md`).
Deploys separately from `web/` — its own small always-on Node process, not a
Vercel function (the Agent SDK's native binary is ~205MB, over Vercel's
250MB function-size cap; see `docs/agents/agent-sdk-serverless.md`).

**Holds no Supabase credentials.** Its read tools call back into the Next.js
app's `/api/assistant/data`; its propose tools never write anywhere.

## What you need to do (can't be done for you)

1. **Generate a Claude Code OAuth token**, in your own terminal, logged into
   your own Claude subscription:
   ```
   claude setup-token
   ```
   This is interactive and ties the token to your account — run it yourself,
   don't paste the resulting token into a chat with an AI assistant (including
   this one). It's valid for 1 year. Save it somewhere you control (a
   password manager, not a plaintext note) — you'll paste it into your host's
   environment-variable settings in step 3, not into this repo.

2. **Create a hosting account.** Render's free tier (sleeps after 15 min
   idle, ~1 min cold-start on the next request — fine for occasional use).
   Sign up at render.com if you haven't.

3. **Deploy this directory:**
   - New → Web Service (not Background Worker — it needs a public URL for
     Vercel to call).
   - Connect this repo, set **Root Directory** to `worker`.
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables (Render dashboard → Environment):
     - `WORKER_SHARED_SECRET` — generate with
       `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`,
       set the **same** value in `web`'s Vercel env vars.
     - `VERCEL_APP_URL` — your deployed Dispatch OS URL
       (e.g. `https://dispatch-os-delta.vercel.app`).
     - `CLAUDE_CODE_OAUTH_TOKEN` — from step 1.
   - Deploy. Render gives you a URL like `https://dispatch-os-assistant.onrender.com`.

4. **Tell me the deployed URL** so `web`'s `ASSISTANT_WORKER_URL` (ticket 03)
   can be set and the chat route wired up.

## Local dev

```
cd worker
cp .env.example .env   # fill in the three values
npm install
npm start
```

Then, from `web/`, point a local request at `http://localhost:8787` (a
one-off script — see ticket 03's live-smoke verification once it exists).

If you're developing from inside an already-logged-in Claude Code session
(like this one), you can skip generating a real `CLAUDE_CODE_OAUTH_TOKEN` for
local testing only: set `SKIP_OAUTH_CHECK_FOR_LOCAL_TEST=1` and leave
`CLAUDE_CODE_OAUTH_TOKEN` unset — the Agent SDK falls back to the ambient
session credentials. A real deploy must never set this; it has no effect
unless that exact env var is present, so a normal Render/Railway/Fly deploy
(which won't set it) always requires the real token.

## Endpoint

`POST /assistant/message`, `Authorization: Bearer <WORKER_SHARED_SECRET>`,
body `{ clientId, history: [{role, content}], message }`. Returns
`{ reply, proposedActions, model, tokensIn, tokensOut }`.
