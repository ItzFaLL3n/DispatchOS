import { describe, expect, it } from "vitest";
import { bridgeGateStatus } from "@/lib/derive/bridgeGate";
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
    buildStatus: "delivered",
    deliveredAt: "2026-09-01", // 9 days before NOW
    retainerStatus: "not-pitched",
    retainerTier: null,
    phase: 8,
    phaseSubstate: null,
    phaseUpdatedAt: null,
    nextActionAt: null,
    nextActionNote: null,
    doNotPitchUntil: null,
    checkinLanded: true,
    nothingAskedSinceDelivery: true,
    siteUrl: "https://x.vercel.app",
    domain: null,
    paypalPlanUrl: "https://paypal.com/plan/x",
    mrr: 0,
    briefMd: null,
    notes: null,
    createdAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("bridgeGateStatus", () => {
  it("is ready when all five preconditions are met", () => {
    const g = bridgeGateStatus(client(), NOW);
    expect(g.ready).toBe(true);
    expect(g.missing).toEqual([]);
    expect(g.items).toHaveLength(5);
  });

  it("labels each item auto or manual", () => {
    const g = bridgeGateStatus(client(), NOW);
    const bySource = Object.fromEntries(g.items.map((i) => [i.key, i.source]));
    expect(bySource["site-live"]).toBe("auto");
    expect(bySource["time-since-delivery"]).toBe("auto");
    expect(bySource["paypal-ready"]).toBe("auto");
    expect(bySource["checkin-landed"]).toBe("manual");
    expect(bySource["nothing-asked"]).toBe("manual");
  });

  it("site not live (no URL) → not ready", () => {
    const g = bridgeGateStatus(client({ siteUrl: null }), NOW);
    expect(g.ready).toBe(false);
    expect(g.missing).toContain("Site delivered and live");
  });

  it("under 3 days since delivery → not ready", () => {
    const g = bridgeGateStatus(client({ deliveredAt: "2026-09-09" }), NOW); // 1 day
    expect(g.ready).toBe(false);
    expect(g.missing.some((m) => /3 days/.test(m))).toBe(true);
  });

  it("exactly 3 days since delivery → met (boundary)", () => {
    expect(bridgeGateStatus(client({ deliveredAt: "2026-09-07" }), NOW).ready).toBe(true);
    expect(bridgeGateStatus(client({ deliveredAt: "2026-09-08" }), NOW).ready).toBe(false);
  });

  it("no delivered_at → time-since is unmet", () => {
    const g = bridgeGateStatus(client({ deliveredAt: null }), NOW);
    expect(g.items.find((i) => i.key === "time-since-delivery")?.met).toBe(false);
  });

  it("no PayPal plan link → not ready", () => {
    const g = bridgeGateStatus(client({ paypalPlanUrl: null }), NOW);
    expect(g.ready).toBe(false);
    expect(g.missing).toContain("PayPal plan link ready");
  });

  it("check-in not marked landed → not ready", () => {
    const g = bridgeGateStatus(client({ checkinLanded: false }), NOW);
    expect(g.ready).toBe(false);
    expect(g.missing).toContain("Zero-ask check-in landed");
  });

  it("nothing-asked not marked → not ready", () => {
    const g = bridgeGateStatus(client({ nothingAskedSinceDelivery: false }), NOW);
    expect(g.ready).toBe(false);
    expect(g.missing).toContain("Nothing asked since delivery");
  });
});
