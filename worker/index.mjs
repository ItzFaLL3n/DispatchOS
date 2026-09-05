import http from "node:http";
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { CHAT_SYSTEM_PROMPT, DM_MODE_SYSTEM_PROMPT } from "./prompts.mjs";

/**
 * Dispatch OS's CRM-assistant worker (spec 0003). Deploys separately from
 * web/ — a small always-on Node process, not a Vercel serverless function
 * (the Agent SDK's native binary doesn't fit Vercel's 250MB cap; see
 * docs/agents/agent-sdk-serverless.md).
 *
 * Holds no Supabase credentials. Its "read" tools call back into the
 * Next.js app's own read-only routes (/api/assistant/data); its "propose"
 * tools never write anywhere — they just surface a structured action in
 * this worker's HTTP response. The Next.js app (POST /api/assistant/message,
 * ticket 03) is the only thing that ever classifies and applies an action.
 */

const PORT = process.env.PORT || 8787;
const SHARED_SECRET = requiredEnv("WORKER_SHARED_SECRET");
const APP_URL = requiredEnv("VERCEL_APP_URL");
if (!process.env.SKIP_OAUTH_CHECK_FOR_LOCAL_TEST) requiredEnv("CLAUDE_CODE_OAUTH_TOKEN"); // read implicitly by the Agent SDK itself

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

// --- Read tools: proxy to the Next.js app, never touch Supabase directly ---

async function callReadRoute(toolName, args) {
  const res = await fetch(`${APP_URL}/api/assistant/data`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SHARED_SECRET}` },
    body: JSON.stringify({ tool: toolName, args }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`read route ${toolName} failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return data.result;
}

function textResult(value) {
  return { content: [{ type: "text", text: JSON.stringify(value) }] };
}

const readTools = [
  tool(
    "search_clients",
    "Search the CRM's clients by business or contact name. Omit query to list all.",
    { query: z.string().optional() },
    async (args) => textResult(await callReadRoute("search_clients", args)),
  ),
  tool(
    "get_client",
    "Get one client record by id, including its full brief fields.",
    { id: z.string() },
    async (args) => textResult(await callReadRoute("get_client", args)),
  ),
  tool(
    "list_groups",
    "List every Facebook group being worked, with status and rules notes.",
    {},
    async () => textResult(await callReadRoute("list_groups", {})),
  ),
  tool(
    "list_open_todos",
    "List open (not-done) todos. Pass clientId to scope to one client, omit for all.",
    { clientId: z.string().optional() },
    async (args) => textResult(await callReadRoute("list_open_todos", args)),
  ),
];

// --- Propose tools: never write anywhere. The tool result just confirms to
// the model that a proposal was queued; the actual ProposedAction the app
// applies is built from the tool_use block's own `input`, in the message
// loop below — not from what these handlers return. ---

const proposeTools = [
  tool(
    "propose_client_update",
    "Propose updating one or more fields on a client record. Pass only the fields that are actually changing. This does NOT apply the change — it queues a proposal the operator must approve (or, for low-stakes fields, that auto-applies if the operator has auto mode on). Never tell the operator the change has been made; say it's been proposed.",
    {
      clientId: z.string(),
      businessName: z.string().optional(),
      contactName: z.string().optional(),
      location: z.string().optional(),
      timezone: z.string().optional(),
      contactHours: z.string().optional(),
      source: z.enum(["fb-comment", "fb-dm", "fb-post-reply", "other"]).optional(),
      offerType: z
        .enum(["free-website", "free-review-agent", "both", "direct-pitch"])
        .optional(),
      buildStatus: z.enum(["not-started", "in-progress", "delivered"]).optional(),
      retainerStatus: z
        .enum(["not-pitched", "pitched", "deferred", "active", "declined"])
        .optional(),
      retainerTier: z.string().optional(),
      mrr: z.number().optional(),
      siteUrl: z.string().optional(),
      domain: z.string().optional(),
      paypalPlanUrl: z.string().optional(),
      notes: z.string().optional(),
      briefMd: z.string().optional(),
      phase: z.number().int().min(1).max(10).optional(),
      phaseSubstate: z.enum(["bridge", "domain-trigger"]).nullable().optional(),
      nextActionAt: z.string().optional().describe("ISO date, YYYY-MM-DD"),
      nextActionNote: z.string().optional(),
      doNotPitchUntil: z.string().optional().describe("ISO date, YYYY-MM-DD"),
    },
    async () => textResult({ proposed: true }),
  ),
  tool(
    "propose_create_todo",
    "Propose a new todo. Does not create it — queues a proposal.",
    {
      title: z.string(),
      dueDate: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]).optional(),
      clientId: z.string().optional(),
      groupId: z.string().optional(),
    },
    async () => textResult({ proposed: true }),
  ),
  tool(
    "propose_create_client_event",
    "Propose logging a timeline entry on a client (a note, touch, ascension-signal, or mistake). Does not log it — queues a proposal.",
    {
      clientId: z.string(),
      kind: z.enum(["note", "touch", "ascension-signal", "mistake"]),
      body: z.string(),
    },
    async () => textResult({ proposed: true }),
  ),
  tool(
    "propose_create_client",
    "Propose creating a brand-new client record — use this when the operator pastes a raw brief (a prospect's intake info) and wants it turned into a CRM record. Does not create it — queues a proposal. businessName, source, offerType, and buildStatus are required; infer everything else you can from the brief and leave the rest unset rather than guessing wildly.",
    {
      businessName: z.string(),
      source: z.enum(["fb-comment", "fb-dm", "fb-post-reply", "other"]),
      offerType: z.enum(["free-website", "free-review-agent", "both", "direct-pitch"]),
      buildStatus: z.enum(["not-started", "in-progress", "delivered"]),
      contactName: z.string().optional(),
      location: z.string().optional(),
      timezone: z.string().optional(),
      contactHours: z.string().optional(),
      retainerStatus: z
        .enum(["not-pitched", "pitched", "deferred", "active", "declined"])
        .optional(),
      retainerTier: z.string().optional(),
      mrr: z.number().optional(),
      siteUrl: z.string().optional(),
      domain: z.string().optional(),
      paypalPlanUrl: z.string().optional(),
      notes: z.string().optional(),
      briefMd: z.string().optional(),
    },
    async () => textResult({ proposed: true }),
  ),
];

const crmServer = createSdkMcpServer({ name: "crm", tools: [...readTools, ...proposeTools] });

// Maps an MCP tool_use block to the ProposedAction shape lib/assistant/guardrail.ts expects.
const ACTION_BUILDERS = {
  mcp__crm__propose_client_update: (input) => {
    const { clientId, ...fields } = input;
    return { kind: "update", entity: "client", id: clientId, fields };
  },
  mcp__crm__propose_create_todo: (input) => ({ kind: "create", entity: "todo", data: input }),
  mcp__crm__propose_create_client_event: (input) => ({
    kind: "create",
    entity: "clientEvent",
    data: input,
  }),
  mcp__crm__propose_create_client: (input) => ({ kind: "create", entity: "client", data: input }),
};

function buildPrompt(clientId, history, message) {
  const lines = [];
  if (clientId) {
    lines.push(
      `[Context: this conversation is scoped to client id ${clientId}. "This client" / "him" / "them" refers to this id — call get_client({ id: "${clientId}" }) yourself rather than asking which client.]`,
    );
  }
  for (const m of history ?? []) {
    lines.push(`${m.role === "user" ? "Operator" : "You"}: ${m.content}`);
  }
  lines.push(`Operator: ${message}`);
  return lines.join("\n\n");
}

// Aliases the panel can send; full model IDs also pass through untouched.
const MODEL_ALIASES = {
  sonnet: "claude-sonnet-5",
  opus: "claude-opus-5",
  haiku: "claude-haiku-4-5-20251001",
};

async function handleMessage({ clientId, history, message, mode, model: requestedModel }) {
  const proposedActions = [];
  let reply = "";
  let model = null;
  let tokensIn = null;
  let tokensOut = null;

  const iter = query({
    prompt: buildPrompt(clientId, history, message),
    options: {
      model: requestedModel ? (MODEL_ALIASES[requestedModel] ?? requestedModel) : undefined,
      tools: [],
      mcpServers: { crm: crmServer },
      systemPrompt: {
        type: "custom",
        prompt: mode === "dm" ? DM_MODE_SYSTEM_PROMPT : CHAT_SYSTEM_PROMPT,
      },
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      // SDK isolation mode — this worker must never inherit CLAUDE.md, skills,
      // or settings.json from whatever filesystem it happens to run on.
      settingSources: [],
      // Read a client, propose a couple of things, answer — a chat turn here
      // should never need many round-trips. Caps a runaway loop.
      maxTurns: 8,
    },
  });

  for await (const msg of iter) {
    if (msg.type === "assistant") {
      model = msg.message?.model ?? model;
      for (const block of msg.message?.content ?? []) {
        if (block.type === "tool_use" && ACTION_BUILDERS[block.name]) {
          proposedActions.push(ACTION_BUILDERS[block.name](block.input));
        }
      }
    }
    if (msg.type === "result") {
      if (msg.subtype === "success") {
        reply = msg.result;
        tokensIn = msg.usage?.input_tokens ?? null;
        tokensOut = msg.usage?.output_tokens ?? null;
      } else {
        throw new Error(`assistant turn ended in error: ${msg.subtype}`);
      }
    }
  }

  return { reply, proposedActions, model, tokensIn, tokensOut };
}

// --- HTTP server -----------------------------------------------------------

function checkAuth(req) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");
  return scheme === "Bearer" && token === SHARED_SECRET;
}

const server = http.createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/assistant/message") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }
  if (!checkAuth(req)) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
    return;
  }

  let body = "";
  for await (const chunk of req) body += chunk;

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid JSON body." }));
    return;
  }
  if (typeof parsed.message !== "string" || !parsed.message.trim()) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing message." }));
    return;
  }

  try {
    const result = await handleMessage(parsed);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
  } catch (err) {
    console.error("assistant/message error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Assistant call failed." }));
  }
});

server.listen(PORT, () => {
  console.log(`assistant worker listening on :${PORT}`);
});
