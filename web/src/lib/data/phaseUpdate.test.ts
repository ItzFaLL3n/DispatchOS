import { describe, expect, it } from "vitest";
import { computePhaseUpdate } from "@/lib/data/phaseUpdate";
import type { Client } from "@/lib/data/types";

const NOW = new Date("2026-09-10T08:30:00.000Z");

function client(overrides: Partial<Client> = {}): Client {
  return {
    id: "c1",
    slug: "acme",
    businessName: "Acme",
    contactName: null,
    location: null,
    timezone: null,
    contactHours: null,
    source: null,
    offerType: null,
    buildStatus: "in-progress",
    deliveredAt: null,
    retainerStatus: "not-pitched",
    retainerTier: null,
    phase: 8,
    phaseSubstate: null,
    phaseUpdatedAt: "2026-09-01T00:00:00.000Z",
    nextActionAt: null,
    nextActionNote: null,
    doNotPitchUntil: null,
    checkinLanded: false,
    nothingAskedSinceDelivery: false,
    siteUrl: null,
    domain: null,
    paypalPlanUrl: null,
    mrr: 0,
    briefMd: null,
    notes: null,
    createdAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("computePhaseUpdate", () => {
  it("stamps phase_updated_at and logs a phase-change event when the phase moves", () => {
    const { update, events } = computePhaseUpdate(client(), { phase: 9 }, NOW);
    expect(update).toEqual({
      phase: 9,
      phase_updated_at: NOW.toISOString(),
    });
    expect(events).toEqual([
      { kind: "phase-change", body: "Phase 8 → 9" },
    ]);
  });

  it("does nothing for an empty patch", () => {
    expect(computePhaseUpdate(client(), {}, NOW)).toEqual({ update: {}, events: [] });
  });

  it("does nothing when the patch equals the current state", () => {
    const { update, events } = computePhaseUpdate(
      client({ phase: 8 }),
      { phase: 8, phaseSubstate: null },
      NOW,
    );
    expect(update).toEqual({});
    expect(events).toEqual([]);
  });

  it("writes a non-phase field without stamping phase_updated_at or logging", () => {
    const { update, events } = computePhaseUpdate(
      client(),
      { nextActionNote: "call him", nextActionAt: "2026-09-18" },
      NOW,
    );
    expect(update).toEqual({
      next_action_note: "call him",
      next_action_at: "2026-09-18",
    });
    expect(events).toEqual([]);
  });

  it("records a sub-state change", () => {
    const { update, events } = computePhaseUpdate(
      client({ phase: 8 }),
      { phaseSubstate: "bridge" },
      NOW,
    );
    expect(update).toMatchObject({ phase_substate: "bridge", phase_updated_at: NOW.toISOString() });
    expect(events).toEqual([{ kind: "phase-change", body: "Phase 8 → 8 (bridge)" }]);
  });

  it("auto-clears a sub-state that no longer applies to the new phase", () => {
    const { update, events } = computePhaseUpdate(
      client({ phase: 8, phaseSubstate: "bridge" }),
      { phase: 9 },
      NOW,
    );
    expect(update).toMatchObject({ phase: 9, phase_substate: null });
    expect(events).toEqual([{ kind: "phase-change", body: "Phase 8 (bridge) → 9" }]);
  });

  it("sets delivered_at and logs a system event on first delivery", () => {
    const { update, events } = computePhaseUpdate(
      client({ buildStatus: "in-progress", deliveredAt: null }),
      { buildStatus: "delivered" },
      NOW,
    );
    expect(update).toEqual({
      build_status: "delivered",
      delivered_at: "2026-09-10",
    });
    expect(events).toEqual([{ kind: "system", body: "Marked delivered." }]);
  });

  it("does not re-set delivered_at if it is already set", () => {
    const { update, events } = computePhaseUpdate(
      client({ buildStatus: "in-progress", deliveredAt: "2026-08-20" }),
      { buildStatus: "delivered" },
      NOW,
    );
    expect(update).toEqual({ build_status: "delivered" });
    expect(events).toEqual([]);
  });

  it("clears do_not_pitch_until", () => {
    const { update } = computePhaseUpdate(
      client({ doNotPitchUntil: "2026-09-18" }),
      { doNotPitchUntil: null },
      NOW,
    );
    expect(update).toEqual({ do_not_pitch_until: null });
  });

  it("handles a phase move and a delivery in one patch", () => {
    const { update, events } = computePhaseUpdate(
      client({ phase: 7, buildStatus: "in-progress", deliveredAt: null }),
      { phase: 8, buildStatus: "delivered" },
      NOW,
    );
    expect(update).toMatchObject({
      phase: 8,
      phase_updated_at: NOW.toISOString(),
      build_status: "delivered",
      delivered_at: "2026-09-10",
    });
    expect(events).toEqual([
      { kind: "phase-change", body: "Phase 7 → 8" },
      { kind: "system", body: "Marked delivered." },
    ]);
  });
});
