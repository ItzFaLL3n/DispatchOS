import { describe, expect, it } from "vitest";
import { dashboardNags } from "@/lib/derive/nags";
import type { Client } from "@/lib/data/types";

const NOW = new Date("2026-09-10T12:00:00.000Z");

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
    phase: 3,
    phaseSubstate: null,
    phaseUpdatedAt: "2026-09-09T00:00:00.000Z",
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
    createdAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

const NONE = new Set<string>();

describe("dashboardNags", () => {
  it("is all-empty for a quiet pipeline", () => {
    const n = dashboardNags([client()], NONE, NOW);
    expect(Object.values(n).every((b) => b.length === 0)).toBe(true);
  });

  it("puts one client into every bucket it qualifies for", () => {
    const c = client({
      id: "x",
      nextActionAt: "2026-09-05", // overdue
      phaseUpdatedAt: "2026-08-01T00:00:00.000Z", // stale
      buildStatus: "delivered",
      phase: 9,
      paypalPlanUrl: null, // missing paypal
    });
    const n = dashboardNags([c], new Set(["x"]), NOW);
    expect(n.overdue.map((r) => r.id)).toEqual(["x"]);
    expect(n.stale.map((r) => r.id)).toEqual(["x"]);
    expect(n.missingPaypal.map((r) => r.id)).toEqual(["x"]);
    expect(n.ascensionSignals.map((r) => r.id)).toEqual(["x"]);
  });

  it("overdue: yesterday is in, today is out", () => {
    expect(
      dashboardNags([client({ nextActionAt: "2026-09-09" })], NONE, NOW).overdue,
    ).toHaveLength(1);
    expect(
      dashboardNags([client({ nextActionAt: "2026-09-10" })], NONE, NOW).overdue,
    ).toHaveLength(0);
  });

  it("splits deferrals into ready vs pending with a countdown", () => {
    const ready = dashboardNags(
      [client({ doNotPitchUntil: "2026-09-09" })],
      NONE,
      NOW,
    );
    expect(ready.deferralReady).toHaveLength(1);
    expect(ready.deferralPending).toHaveLength(0);

    const pending = dashboardNags(
      [client({ doNotPitchUntil: "2026-09-13" })],
      NONE,
      NOW,
    );
    expect(pending.deferralPending).toHaveLength(1);
    expect(pending.deferralPending[0].detail).toMatch(/3 days/);
  });

  it("stale: 15 days is in, 14 is the cutoff", () => {
    expect(
      dashboardNags(
        [client({ phaseUpdatedAt: "2026-08-26T00:00:00.000Z" })],
        NONE,
        NOW,
      ).stale,
    ).toHaveLength(1); // 15 days
    expect(
      dashboardNags(
        [client({ phaseUpdatedAt: "2026-08-27T00:00:00.000Z" })],
        NONE,
        NOW,
      ).stale,
    ).toHaveLength(0); // 14 days
  });

  it("stale falls back to createdAt when phase was never updated", () => {
    expect(
      dashboardNags(
        [client({ phaseUpdatedAt: null, createdAt: "2026-08-01T00:00:00.000Z" })],
        NONE,
        NOW,
      ).stale,
    ).toHaveLength(1);
  });

  it("missingPaypal only for delivered clients at phase 8+ with no link", () => {
    const base = { buildStatus: "delivered" as const, paypalPlanUrl: null };
    expect(dashboardNags([client({ ...base, phase: 8 })], NONE, NOW).missingPaypal).toHaveLength(1);
    expect(dashboardNags([client({ ...base, phase: 7 })], NONE, NOW).missingPaypal).toHaveLength(0);
    expect(
      dashboardNags([client({ ...base, phase: 9, paypalPlanUrl: "https://pp/x" })], NONE, NOW)
        .missingPaypal,
    ).toHaveLength(0);
    expect(
      dashboardNags([client({ buildStatus: "in-progress", phase: 9 })], NONE, NOW).missingPaypal,
    ).toHaveLength(0);
  });

  it("textableNow: green before amber, red and no-timezone excluded", () => {
    // 2026-09-10T12:00Z -> local: Chicago 07:00 (amber), Denver 06:00 (red),
    // New_York 08:00 (amber), Los_Angeles 05:00 (red). Use offsets to force
    // green vs amber vs red deliberately:
    const green = client({ id: "g", businessName: "Green", timezone: "Asia/Kolkata" }); // 17:30 -> green
    const amber = client({ id: "a", businessName: "Amber", timezone: "America/New_York" }); // 08:00 -> amber
    const red = client({ id: "r", businessName: "Red", timezone: "America/Los_Angeles" }); // 05:00 -> red
    const notz = client({ id: "n", businessName: "NoTz", timezone: null });
    const n = dashboardNags([red, amber, green, notz], NONE, NOW);
    expect(n.textableNow.map((r) => r.id)).toEqual(["g", "a"]);
  });
});
