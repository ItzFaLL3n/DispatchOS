import { NextResponse } from "next/server";
import { applyAction } from "@/lib/assistant/applyAction";
import type { ProposedAction } from "@/lib/assistant/guardrail";

function isValidAction(action: unknown): action is ProposedAction {
  const a = action as Partial<ProposedAction> | null;
  if (!a || typeof a !== "object") return false;
  if (a.kind === "delete") return typeof a.entity === "string" && typeof a.id === "string";
  if (a.kind === "update") return a.entity === "client" && typeof a.id === "string" && !!a.fields;
  if (a.kind === "create") return typeof a.entity === "string" && !!a.data;
  return false;
}

/**
 * POST /api/assistant/approve — applies a pending action the operator
 * approved from the UI. Runs through the exact same `applyAction` the
 * auto-apply branch of /api/assistant/message uses — one apply
 * implementation, two callers. No re-classification here: a pending card
 * only exists because it was already classified `always-confirm` (or
 * `auto-eligible` with auto mode off) — approving it is the confirm.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action = (body as { action?: unknown } | null)?.action;
  if (!isValidAction(action)) {
    return NextResponse.json({ error: "Missing or invalid action." }, { status: 400 });
  }

  try {
    await applyAction(action);
  } catch {
    return NextResponse.json({ error: "Failed to apply action." }, { status: 500 });
  }

  return NextResponse.json({ applied: true });
}
