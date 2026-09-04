import { NextResponse } from "next/server";
import { getClient, listClients } from "@/lib/data/clients";
import { listGroups } from "@/lib/data/groups";
import { listOpenTodosForClient, listTodos } from "@/lib/data/todos";
import { safeEqual } from "@/lib/session";
import { serverEnv } from "@/lib/env";

type ToolName = "search_clients" | "get_client" | "list_groups" | "list_open_todos";

type RequestBody = { tool: ToolName; args?: Record<string, unknown> };

function isValidBody(body: unknown): body is RequestBody {
  const b = body as Partial<RequestBody> | null;
  const TOOLS: ToolName[] = ["search_clients", "get_client", "list_groups", "list_open_todos"];
  return !!b && typeof b === "object" && !!b.tool && TOOLS.includes(b.tool);
}

function checkAuth(request: Request): boolean {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return false;
  return safeEqual(token, serverEnv.workerSharedSecret);
}

/**
 * Read-only CRM data for the assistant worker (spec 0003). The worker never
 * holds Supabase credentials — every "read" tool it exposes to the model
 * calls back here instead. No write path exists on this route; writes only
 * ever happen through /api/assistant/message's apply path (ticket 03).
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isValidBody(body)) {
    return NextResponse.json({ error: "Missing or invalid tool." }, { status: 400 });
  }

  const args = body.args ?? {};

  switch (body.tool) {
    case "search_clients": {
      const q = typeof args.query === "string" ? args.query.trim().toLowerCase() : "";
      const clients = await listClients();
      const matched = q
        ? clients.filter(
            (c) =>
              c.businessName.toLowerCase().includes(q) ||
              (c.contactName ?? "").toLowerCase().includes(q),
          )
        : clients;
      return NextResponse.json({ result: matched });
    }
    case "get_client": {
      const id = typeof args.id === "string" ? args.id : "";
      if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });
      const client = await getClient(id);
      return NextResponse.json({ result: client });
    }
    case "list_groups": {
      return NextResponse.json({ result: await listGroups() });
    }
    case "list_open_todos": {
      const clientId = typeof args.clientId === "string" ? args.clientId : undefined;
      const todos = clientId ? await listOpenTodosForClient(clientId) : await listTodos();
      const open = clientId ? todos : todos.filter((t) => t.status !== "done");
      return NextResponse.json({ result: open });
    }
  }
}
