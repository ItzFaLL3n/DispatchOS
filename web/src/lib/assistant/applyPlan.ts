/**
 * Pure planning step between a classified `ProposedAction` and the actual
 * `lib/data/*` calls that apply it. No I/O — the unit-testable seam;
 * `applyAction.ts` (server-only) just executes whatever this returns.
 *
 * The one non-obvious piece: a client "update" action can touch two
 * different underlying tables' worth of behavior — `phase`, `phaseSubstate`,
 * `nextActionAt`, `nextActionNote`, `doNotPitchUntil`, and `buildStatus` all
 * go through `applyPhaseUpdate` (which stamps `phase_updated_at` and
 * auto-logs a `phase-change`/`system` event — see phaseUpdate.ts), never
 * `updateClient` — passing `buildStatus` to plain `updateClient` would skip
 * that bookkeeping silently. Everything else on a client goes through
 * `updateClient`. A single action can produce both steps.
 */
import type { ProposedAction } from "@/lib/assistant/guardrail";

const PHASE_TRACKER_FIELDS = new Set([
  "phase",
  "phaseSubstate",
  "nextActionAt",
  "nextActionNote",
  "doNotPitchUntil",
  "buildStatus",
]);

export type ApplyStep =
  | { fn: "updateClient"; id: string; patch: Record<string, unknown> }
  | { fn: "applyPhaseUpdate"; id: string; patch: Record<string, unknown> }
  | { fn: "createTodo"; data: Record<string, unknown> }
  | { fn: "createClientEvent"; clientId: string; kind: string; body: string }
  | { fn: "deleteClient"; id: string }
  | { fn: "deleteGroup"; id: string }
  | { fn: "deleteTodo"; id: string };

export function planApply(action: ProposedAction): ApplyStep[] {
  if (action.kind === "delete") {
    const fn =
      action.entity === "client"
        ? "deleteClient"
        : action.entity === "group"
          ? "deleteGroup"
          : "deleteTodo";
    return [{ fn, id: action.id }];
  }

  if (action.kind === "update" && action.entity === "client") {
    const phaseFields: Record<string, unknown> = {};
    const clientFields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(action.fields)) {
      (PHASE_TRACKER_FIELDS.has(key) ? phaseFields : clientFields)[key] = value;
    }
    const steps: ApplyStep[] = [];
    if (Object.keys(clientFields).length > 0) {
      steps.push({ fn: "updateClient", id: action.id, patch: clientFields });
    }
    if (Object.keys(phaseFields).length > 0) {
      steps.push({ fn: "applyPhaseUpdate", id: action.id, patch: phaseFields });
    }
    return steps;
  }

  if (action.kind === "create" && action.entity === "todo") {
    return [{ fn: "createTodo", data: action.data }];
  }

  if (action.kind === "create" && action.entity === "clientEvent") {
    const data = action.data as { clientId: string; kind: string; body: string };
    return [{ fn: "createClientEvent", clientId: data.clientId, kind: data.kind, body: data.body }];
  }

  return [];
}

/**
 * A short, human-readable summary of an update action, for the `ai-action`
 * timeline entry (`propose_create_client_event` writes its own natural
 * entry already — no summary needed there; a `create todo`/`update client`
 * action is otherwise invisible on the client's timeline without one).
 */
export function summarizeAction(action: ProposedAction): string {
  if (action.kind === "update" && action.entity === "client") {
    const fields = Object.keys(action.fields).join(", ");
    return `AI updated: ${fields}`;
  }
  if (action.kind === "create" && action.entity === "todo") {
    const title = (action.data as { title?: string }).title ?? "a todo";
    return `AI created todo: ${title}`;
  }
  if (action.kind === "delete") {
    return `AI deleted a ${action.entity} record`;
  }
  return "AI action applied";
}

/** The client id an applied action should log its `ai-action` entry against, if any. */
export function actionClientId(action: ProposedAction): string | null {
  if (action.kind === "update" && action.entity === "client") return action.id;
  if (action.kind === "create" && action.entity === "todo") {
    return (action.data as { clientId?: string }).clientId ?? null;
  }
  if (action.kind === "delete" && action.entity === "client") return action.id;
  return null;
}
