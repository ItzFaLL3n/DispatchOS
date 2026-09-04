import { BUILD_STATUSES, PHASE_SUBSTATES } from "@/lib/data/types";
import type { BuildStatus, PhaseSubstate } from "@/lib/data/types";
import { ValidationError } from "@/lib/data/errors";

/**
 * A partial update to a client's phase / sequence state. `undefined` = field
 * absent (leave alone); `null` = present and cleared.
 */
export type PhasePatch = {
  phase?: number;
  phaseSubstate?: PhaseSubstate | null;
  nextActionAt?: string | null;
  nextActionNote?: string | null;
  doNotPitchUntil?: string | null;
  buildStatus?: BuildStatus;
};

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

function dateField(fd: FormData, key: string, label: string): string | null | undefined {
  if (!fd.has(key)) return undefined;
  const value = String(fd.get(key) ?? "").trim();
  if (value === "") return null;
  if (!isIsoDate(value)) throw new ValidationError(`${label} must be a valid date.`);
  return value;
}

export function parsePhaseForm(fd: FormData): PhasePatch {
  const patch: PhasePatch = {};

  if (fd.has("phase")) {
    const n = Number(String(fd.get("phase")));
    if (!Number.isInteger(n) || n < 1 || n > 10) {
      throw new ValidationError("Phase must be a whole number from 1 to 10.");
    }
    patch.phase = n;
  }

  if (fd.has("phaseSubstate")) {
    const raw = String(fd.get("phaseSubstate") ?? "").trim();
    if (raw === "") {
      patch.phaseSubstate = null;
    } else if ((PHASE_SUBSTATES as readonly string[]).includes(raw)) {
      patch.phaseSubstate = raw as PhaseSubstate;
    } else {
      throw new ValidationError("Unknown phase sub-state.");
    }
  }

  const nextActionAt = dateField(fd, "nextActionAt", "Next action date");
  if (nextActionAt !== undefined) patch.nextActionAt = nextActionAt;

  const doNotPitchUntil = dateField(fd, "doNotPitchUntil", "Do-not-pitch-until date");
  if (doNotPitchUntil !== undefined) patch.doNotPitchUntil = doNotPitchUntil;

  if (fd.has("nextActionNote")) {
    const note = String(fd.get("nextActionNote") ?? "").trim();
    patch.nextActionNote = note === "" ? null : note;
  }

  if (fd.has("buildStatus")) {
    const raw = String(fd.get("buildStatus") ?? "").trim();
    if (raw !== "") {
      if (!(BUILD_STATUSES as readonly string[]).includes(raw)) {
        throw new ValidationError("Invalid build status.");
      }
      patch.buildStatus = raw as BuildStatus;
    }
  }

  return patch;
}
