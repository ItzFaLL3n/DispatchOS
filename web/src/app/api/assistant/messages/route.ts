import { NextResponse } from "next/server";
import { listMessages, clearMessages } from "@/lib/data/assistantMessages";
import { getClient } from "@/lib/data/clients";

/**
 * GET /api/assistant/messages?clientId=<id> — loads a thread's history for
 * the panel on open, plus the client's business name (so the panel can show
 * a real scope label instead of a generic "this client"). Omit clientId (or
 * pass nothing) for the general thread. Operator-facing (behind the session
 * cookie, same as every page) — not the worker-facing separately-authed
 * surface.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const clientId = new URL(request.url).searchParams.get("clientId");
  const [messages, client] = await Promise.all([
    listMessages(clientId),
    clientId ? getClient(clientId) : Promise.resolve(null),
  ]);
  return NextResponse.json({ messages, clientLabel: client?.businessName ?? null });
}

/** DELETE /api/assistant/messages?clientId=<id> — clears a thread's history. */
export async function DELETE(request: Request): Promise<NextResponse> {
  const clientId = new URL(request.url).searchParams.get("clientId");
  await clearMessages(clientId);
  return NextResponse.json({ ok: true });
}
