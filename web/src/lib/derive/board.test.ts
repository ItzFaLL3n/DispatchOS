import { describe, expect, it } from "vitest";
import { boardCardHint, conversionColumn } from "@/lib/derive/board";
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
    deliveredAt: "2026-08-20",
    retainerStatus: "not-pitched",
    retainerTier: null,
    phase: 8,
    phaseSubstate: null,
    phaseUpdatedAt: null,
    nextActionAt: null,
    nextActionNote: null,
    doNotPitchUntil: null,
    checkinLanded: false,
    nothingAskedSinceDelivery: false,
    siteUrl: "https://x.vercel.app",
    domain: null,
    paypalPlanUrl: null,
    mrr: 0,
    briefMd: null,
    notes: null,
    createdAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("conversionColumn", () => {
  it("active retainer → won, regardless of phase", () => {
    expect(conversionColumn(client({ retainerStatus: "active", phase: 3 }))).toEqual({
      column: "won",
      dataWarning: false,
    });
  });

  it("declined retainer → closed, regardless of phase", () => {
    expect(conversionColumn(client({ retainerStatus: "declined", phase: 9 }))).toEqual({
      column: "closed",
      dataWarning: false,
    });
  });

  it("phase 10 → growth", () => {
    expect(conversionColumn(client({ phase: 10 })).column).toBe("growth");
  });

  it("phase 9 → retainer, or domain-trigger with that sub-state", () => {
    expect(conversionColumn(client({ phase: 9 })).column).toBe("retainer");
    expect(
      conversionColumn(client({ phase: 9, phaseSubstate: "domain-trigger" })).column,
    ).toBe("domain-trigger");
  });

  it("phase 8 → check-in, or bridge with that sub-state", () => {
    expect(conversionColumn(client({ phase: 8 })).column).toBe("check-in");
    expect(
      conversionColumn(client({ phase: 8, phaseSubstate: "bridge" })).column,
    ).toBe("bridge");
  });

  it("delivered but phase < 8 → check-in with a data warning", () => {
    expect(conversionColumn(client({ phase: 5 }))).toEqual({
      column: "check-in",
      dataWarning: true,
    });
    expect(conversionColumn(client({ phase: 7 })).dataWarning).toBe(true);
  });
});

describe("boardCardHint", () => {
  it("check-in: prompts to log the check-in, then to move to the bridge", () => {
    expect(boardCardHint(client({ phase: 8, checkinLanded: false }), NOW)).toMatch(
      /check-in/i,
    );
    expect(boardCardHint(client({ phase: 8, checkinLanded: true }), NOW)).toMatch(
      /bridge/i,
    );
  });

  it("bridge: flags a missing PayPal link, else waits for a door", () => {
    expect(
      boardCardHint(client({ phase: 8, phaseSubstate: "bridge" }), NOW),
    ).toMatch(/paypal/i);
    expect(
      boardCardHint(
        client({ phase: 8, phaseSubstate: "bridge", paypalPlanUrl: "https://pp/x" }),
        NOW,
      ),
    ).toMatch(/door/i);
  });

  it("retainer + deferred: counts down to do_not_pitch_until", () => {
    expect(
      boardCardHint(
        client({
          phase: 9,
          retainerStatus: "deferred",
          paypalPlanUrl: "https://pp/x",
          doNotPitchUntil: "2026-09-18",
        }),
        NOW,
      ),
    ).toBe("pitch opens in 8 days");
  });

  it("retainer + deferred, window already open", () => {
    expect(
      boardCardHint(
        client({
          phase: 9,
          retainerStatus: "deferred",
          paypalPlanUrl: "https://pp/x",
          doNotPitchUntil: "2026-09-01",
        }),
        NOW,
      ),
    ).toMatch(/window (is )?open|ready/i);
  });

  it("retainer: missing PayPal link beats everything else", () => {
    expect(boardCardHint(client({ phase: 9, retainerStatus: "pitched" }), NOW)).toMatch(
      /paypal/i,
    );
  });

  it("retainer + pitched with a link: awaiting reply", () => {
    expect(
      boardCardHint(
        client({ phase: 9, retainerStatus: "pitched", paypalPlanUrl: "https://pp/x" }),
        NOW,
      ),
    ).toMatch(/awaiting|reply/i);
  });

  it("won: shows MRR when present", () => {
    expect(
      boardCardHint(client({ retainerStatus: "active", mrr: 197 }), NOW),
    ).toMatch(/197/);
  });

  it("closed: the site stays theirs", () => {
    expect(boardCardHint(client({ retainerStatus: "declined" }), NOW)).toMatch(
      /site stays|theirs/i,
    );
  });
});
