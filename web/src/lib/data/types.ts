/**
 * Camelcase domain types for the Phase 1 tables. The canonical schema is
 * web/supabase/migrations/0001_phase1_init.sql — keep these in sync with it.
 */

export type ClientSource = "fb-comment" | "fb-dm" | "fb-post-reply" | "other";
export type OfferType =
  | "free-website"
  | "free-review-agent"
  | "both"
  | "direct-pitch";
export type BuildStatus = "not-started" | "in-progress" | "delivered";
export type RetainerStatus =
  | "not-pitched"
  | "pitched"
  | "deferred"
  | "active"
  | "declined";
export type PhaseSubstate = "bridge" | "domain-trigger";

export type Client = {
  id: string;
  slug: string;
  businessName: string;
  contactName: string | null;
  location: string | null;
  timezone: string | null;
  contactHours: string | null;
  source: ClientSource | null;
  offerType: OfferType | null;
  buildStatus: BuildStatus;
  deliveredAt: string | null; // ISO date
  retainerStatus: RetainerStatus;
  retainerTier: string | null;
  phase: number; // 1..10
  phaseSubstate: PhaseSubstate | null;
  phaseUpdatedAt: string | null; // ISO timestamp
  nextActionAt: string | null; // ISO date
  nextActionNote: string | null;
  doNotPitchUntil: string | null; // ISO date
  checkinLanded: boolean;
  nothingAskedSinceDelivery: boolean;
  siteUrl: string | null;
  domain: string | null;
  paypalPlanUrl: string | null;
  mrr: number;
  briefMd: string | null;
  notes: string | null;
  createdAt: string; // ISO timestamp
};
