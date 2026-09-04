import { describe, expect, it } from "vitest";
import { mapClientRow } from "@/lib/data/mappers";

/** A row shaped exactly as `select('*')` from `clients` returns it. */
const dbRow = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "hd-junk-removal",
  business_name: "HD Junk Removal & Demolition LLC",
  contact_name: "Tyler M Morris",
  location: "Sheffield, AL",
  timezone: "America/Chicago",
  contact_hours: null,
  source: "fb-comment",
  offer_type: "free-website",
  build_status: "delivered",
  delivered_at: "2026-08-20",
  retainer_status: "deferred",
  retainer_tier: "$39/$49",
  phase: 9,
  phase_substate: null,
  phase_updated_at: "2026-09-04T00:00:00+00:00",
  next_action_at: "2026-09-18",
  next_action_note: "re-check-in",
  do_not_pitch_until: "2026-09-18",
  checkin_landed: false,
  nothing_asked_since_delivery: false,
  site_url: "https://hd-junk-removal-demolition.vercel.app/",
  domain: null,
  paypal_plan_url: null,
  mrr: "0", // PostgREST returns numeric as a string
  brief_md: "# HD Junk Removal",
  notes: null,
  created_at: "2026-09-04T11:00:00+00:00",
};

describe("mapClientRow", () => {
  it("maps every column to its camelCase field, values round-tripping", () => {
    const c = mapClientRow(dbRow);
    expect(c).toEqual({
      id: "11111111-1111-1111-1111-111111111111",
      slug: "hd-junk-removal",
      businessName: "HD Junk Removal & Demolition LLC",
      contactName: "Tyler M Morris",
      location: "Sheffield, AL",
      timezone: "America/Chicago",
      contactHours: null,
      source: "fb-comment",
      offerType: "free-website",
      buildStatus: "delivered",
      deliveredAt: "2026-08-20",
      retainerStatus: "deferred",
      retainerTier: "$39/$49",
      phase: 9,
      phaseSubstate: null,
      phaseUpdatedAt: "2026-09-04T00:00:00+00:00",
      nextActionAt: "2026-09-18",
      nextActionNote: "re-check-in",
      doNotPitchUntil: "2026-09-18",
      checkinLanded: false,
      nothingAskedSinceDelivery: false,
      siteUrl: "https://hd-junk-removal-demolition.vercel.app/",
      domain: null,
      paypalPlanUrl: null,
      mrr: 0,
      briefMd: "# HD Junk Removal",
      notes: null,
      createdAt: "2026-09-04T11:00:00+00:00",
    });
  });

  it("coerces the numeric mrr string to a number", () => {
    expect(mapClientRow({ ...dbRow, mrr: "1500.50" }).mrr).toBe(1500.5);
    expect(mapClientRow({ ...dbRow, mrr: 297 }).mrr).toBe(297);
  });

  it("treats a null mrr as 0", () => {
    expect(mapClientRow({ ...dbRow, mrr: null }).mrr).toBe(0);
  });

  it("keeps booleans as booleans", () => {
    const c = mapClientRow({ ...dbRow, checkin_landed: true, nothing_asked_since_delivery: true });
    expect(c.checkinLanded).toBe(true);
    expect(c.nothingAskedSinceDelivery).toBe(true);
  });
});
