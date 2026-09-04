import type { Client, PhaseSubstate } from "@/lib/data/types";
import type { PhasePatch } from "@/lib/data/phaseInput";

export type NewClientEvent = { kind: "phase-change" | "system"; body: string };

export type PhaseUpdate = {
  /** snake_case columns to write to `clients` (empty = no-op). */
  update: Record<string, unknown>;
  /** `client_events` rows to append (client_id added by the caller). */
  events: NewClientEvent[];
};

const SUBSTATE_PHASE: Record<PhaseSubstate, number> = {
  bridge: 8,
  "domain-trigger": 9,
};

function phaseLabel(phase: number, substate: PhaseSubstate | null): string {
  return substate ? `${phase} (${substate})` : `${phase}`;
}

function isoDate(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Pure. Given the current client, a partial patch and the clock, produce the
 * DB update and the events to log:
 *  - a change to phase or phase_substate stamps phase_updated_at and logs a
 *    `phase-change` event;
 *  - a sub-state that no longer fits the (new) phase is dropped;
 *  - build_status -> 'delivered' sets delivered_at (if unset) and logs a
 *    `system` event.
 */
export function computePhaseUpdate(
  current: Client,
  patch: PhasePatch,
  now: Date,
): PhaseUpdate {
  const update: Record<string, unknown> = {};
  const events: NewClientEvent[] = [];

  const newPhase = patch.phase ?? current.phase;

  let newSubstate: PhaseSubstate | null =
    "phaseSubstate" in patch
      ? (patch.phaseSubstate ?? null)
      : current.phaseSubstate;
  if (newSubstate && SUBSTATE_PHASE[newSubstate] !== newPhase) {
    newSubstate = null;
  }

  const phaseChanged = newPhase !== current.phase;
  const substateChanged = newSubstate !== current.phaseSubstate;

  if (phaseChanged) update.phase = newPhase;
  if (substateChanged) update.phase_substate = newSubstate;
  if (phaseChanged || substateChanged) {
    update.phase_updated_at = now.toISOString();
    events.push({
      kind: "phase-change",
      body: `Phase ${phaseLabel(current.phase, current.phaseSubstate)} → ${phaseLabel(
        newPhase,
        newSubstate,
      )}`,
    });
  }

  if (patch.nextActionAt !== undefined) update.next_action_at = patch.nextActionAt;
  if (patch.nextActionNote !== undefined) {
    update.next_action_note = patch.nextActionNote;
  }
  if (patch.doNotPitchUntil !== undefined) {
    update.do_not_pitch_until = patch.doNotPitchUntil;
  }

  if (patch.buildStatus !== undefined && patch.buildStatus !== current.buildStatus) {
    update.build_status = patch.buildStatus;
    if (patch.buildStatus === "delivered" && !current.deliveredAt) {
      update.delivered_at = isoDate(now);
      events.push({ kind: "system", body: "Marked delivered." });
    }
  }

  return { update, events };
}
