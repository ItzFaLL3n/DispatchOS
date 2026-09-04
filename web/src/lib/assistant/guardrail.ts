/**
 * The safety core of the CRM assistant (spec 0003). Pure — no I/O. Decides
 * whether a proposed CRM write can auto-apply (when auto mode is on) or must
 * always wait for the operator's confirm, regardless of mode.
 *
 * Always-confirm: any client update touching a hard-rule-adjacent field
 * (retainerStatus, phase, phaseSubstate, doNotPitchUntil — the fields
 * os/knowledge/hard-rules.md protects), or any delete of any entity. One
 * protected field in an update taints the whole action — there is no
 * partial-apply.
 */

export type ProposedAction =
  | { kind: "update"; entity: "client"; id: string; fields: Record<string, unknown> }
  | { kind: "create"; entity: "todo" | "clientEvent"; data: Record<string, unknown> }
  | { kind: "delete"; entity: "client" | "group" | "todo"; id: string };

export type ActionClassification = "auto-eligible" | "always-confirm";

const ALWAYS_CONFIRM_CLIENT_FIELDS = [
  "retainerStatus",
  "phase",
  "phaseSubstate",
  "doNotPitchUntil",
] as const;

export function classifyAction(action: ProposedAction): ActionClassification {
  if (action.kind === "delete") return "always-confirm";

  if (action.kind === "update" && action.entity === "client") {
    const touchesProtectedField = ALWAYS_CONFIRM_CLIENT_FIELDS.some(
      (field) => field in action.fields,
    );
    if (touchesProtectedField) return "always-confirm";
  }

  return "auto-eligible";
}
