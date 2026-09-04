import { NextResponse } from "next/server";
import { appendMessage, listMessages } from "@/lib/data/assistantMessages";
import { createAgentRun } from "@/lib/data/agentRuns";
import { callWorker } from "@/lib/assistant/callWorker";
import { classifyAction } from "@/lib/assistant/guardrail";
import { applyAction } from "@/lib/assistant/applyAction";
import type { ProposedAction } from "@/lib/assistant/guardrail";

type RequestBody = { clientId: string | null; message: string; autoMode: boolean };

function isValidBody(body: unknown): body is RequestBody {
  const b = body as Partial<RequestBody> | null;
  if (!b || typeof b !== "object") return false;
  if (b.clientId !== null && typeof b.clientId !== "string") return false;
  if (typeof b.message !== "string" || !b.message.trim()) return false;
  if (typeof b.autoMode !== "boolean") return false;
  return true;
}

export type ResolvedAction = {
  action: ProposedAction;
  classification: "auto-eligible" | "always-confirm";
  status: "applied" | "pending";
};

/**
 * POST /api/assistant/message — the chat route. Persists the turn, calls the
 * worker, classifies whatever it proposes, auto-applies what's eligible
 * (when auto mode is on), leaves the rest pending for the UI to show as a
 * card. This route — and /api/assistant/approve, sharing the same
 * `applyAction` — are the only things in this phase that ever write to
 * Supabase; the worker never gets that chance.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isValidBody(body)) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  const prior = await listMessages(body.clientId);
  await appendMessage({ clientId: body.clientId, role: "user", content: body.message });

  let result;
  try {
    result = await callWorker({
      clientId: body.clientId,
      history: prior.map((m) => ({ role: m.role, content: m.content })),
      message: body.message,
    });
  } catch {
    return NextResponse.json({ error: "Assistant call failed." }, { status: 502 });
  }

  const resolved: ResolvedAction[] = [];
  for (const action of result.proposedActions) {
    const classification = classifyAction(action);
    if (classification === "auto-eligible" && body.autoMode) {
      await applyAction(action);
      resolved.push({ action, classification, status: "applied" });
    } else {
      resolved.push({ action, classification, status: "pending" });
    }
  }

  await appendMessage({
    clientId: body.clientId,
    role: "assistant",
    content: result.reply,
    proposedActions: resolved,
  });

  await createAgentRun({
    kind: "assistant",
    clientId: body.clientId,
    input: { message: body.message },
    output: { reply: result.reply, actions: resolved },
    tokensIn: result.tokensIn,
    tokensOut: result.tokensOut,
    model: result.model,
  });

  return NextResponse.json({ reply: result.reply, actions: resolved });
}
