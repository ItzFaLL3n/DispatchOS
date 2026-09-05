import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import { applyPhaseUpdate, createClient, deleteClient, updateClient } from "@/lib/data/clients";
import { createClientEvent } from "@/lib/data/events";
import { createTodo, deleteTodo } from "@/lib/data/todos";
import { deleteGroup } from "@/lib/data/groups";
import { slugify } from "@/lib/data/clientInput";
import { actionClientId, planApply, summarizeAction } from "@/lib/assistant/applyPlan";
import type { ProposedAction } from "@/lib/assistant/guardrail";
import type { ParsedClientForm } from "@/lib/data/clientInput";
import type { PhasePatch } from "@/lib/data/phaseInput";
import type { ParsedTodoForm } from "@/lib/data/todoInput";
import type { UserEventKind } from "@/lib/data/types";

/**
 * `ai-action`, like `phase-change`/`system`, is app-written, not something a
 * person adds by hand — so it's deliberately outside `UserEventKind` and
 * `createClientEvent`'s typed surface. Raw insert instead, same precedent as
 * `clients.ts#applyPhaseUpdate`'s own `phase-change`/`system` event writes.
 */
async function logAiActionEvent(clientId: string, body: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("client_events")
    .insert({ client_id: clientId, kind: "ai-action", body });
  if (error) throw new Error(`logAiActionEvent(${clientId}): ${error.message}`);
}

/**
 * Executes a proposed action (already classified — this is the one place
 * both the auto-apply path and the approve route call, so there is exactly
 * one apply implementation). Logs an `ai-action` timeline entry for actions
 * that wouldn't otherwise be visible on the client's own record
 * (`propose_create_client_event` already creates a real timeline entry
 * itself — no redundant wrapper).
 */
export async function applyAction(action: ProposedAction): Promise<void> {
  let createdClientId: string | null = null;

  for (const step of planApply(action)) {
    switch (step.fn) {
      case "updateClient":
        await updateClient(step.id, step.patch as ParsedClientForm);
        break;
      case "applyPhaseUpdate":
        await applyPhaseUpdate(step.id, step.patch as PhasePatch);
        break;
      case "createTodo":
        await createTodo(step.data as ParsedTodoForm);
        break;
      case "createClientEvent":
        await createClientEvent(step.clientId, step.kind as UserEventKind, step.body);
        break;
      case "createClient": {
        const data = step.data as ParsedClientForm & { businessName: string };
        const created = await createClient({ ...data, slug: slugify(data.businessName) });
        createdClientId = created.id;
        break;
      }
      case "deleteClient":
        await deleteClient(step.id);
        break;
      case "deleteGroup":
        await deleteGroup(step.id);
        break;
      case "deleteTodo":
        await deleteTodo(step.id);
        break;
    }
  }

  if (action.kind === "create" && action.entity === "clientEvent") return; // already its own entry

  const clientId = createdClientId ?? actionClientId(action);
  if (clientId) {
    await logAiActionEvent(clientId, summarizeAction(action));
  }
}
