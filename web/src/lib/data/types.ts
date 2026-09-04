/**
 * Camelcase domain types for the Phase 1 tables. The canonical schema is
 * web/supabase/migrations/0001_phase1_init.sql — keep these in sync with it.
 * The `*_VALUES` arrays are the single source for both <select> options and
 * input validation.
 */

export const CLIENT_SOURCES = [
  "fb-comment",
  "fb-dm",
  "fb-post-reply",
  "other",
] as const;
export type ClientSource = (typeof CLIENT_SOURCES)[number];

export const OFFER_TYPES = [
  "free-website",
  "free-review-agent",
  "both",
  "direct-pitch",
] as const;
export type OfferType = (typeof OFFER_TYPES)[number];

export const BUILD_STATUSES = ["not-started", "in-progress", "delivered"] as const;
export type BuildStatus = (typeof BUILD_STATUSES)[number];

export const RETAINER_STATUSES = [
  "not-pitched",
  "pitched",
  "deferred",
  "active",
  "declined",
] as const;
export type RetainerStatus = (typeof RETAINER_STATUSES)[number];

export const PHASE_SUBSTATES = ["bridge", "domain-trigger"] as const;
export type PhaseSubstate = (typeof PHASE_SUBSTATES)[number];

export const EVENT_KINDS = [
  "note",
  "touch",
  "ascension-signal",
  "phase-change",
  "system",
] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

/** The kinds a person can add by hand; phase-change / system are written by the app. */
export const USER_EVENT_KINDS = ["note", "touch", "ascension-signal"] as const;
export type UserEventKind = (typeof USER_EVENT_KINDS)[number];

export type ClientEvent = {
  id: string;
  clientId: string;
  at: string; // ISO timestamp
  kind: EventKind;
  body: string;
  resolvedAt: string | null; // ascension-signal: null = still open
  createdAt: string;
};

export const TODO_PRIORITIES = ["low", "medium", "high"] as const;
export type TodoPriority = (typeof TODO_PRIORITIES)[number];

export const TODO_STATUSES = ["todo", "in-progress", "done"] as const;
export type TodoStatus = (typeof TODO_STATUSES)[number];

export type Todo = {
  id: string;
  clientId: string | null;
  groupId: string | null;
  title: string;
  dueDate: string | null; // ISO date
  priority: TodoPriority;
  status: TodoStatus;
  createdAt: string;
};

export const GROUP_STATUSES = [
  "active",
  "pending",
  "flagged",
  "needs-review",
] as const;
export type GroupStatus = (typeof GROUP_STATUSES)[number];

export type Group = {
  id: string;
  name: string;
  status: GroupStatus;
  rulesNotes: string | null;
  rulesUrl: string | null;
  lastPostDate: string | null; // ISO date
  createdAt: string;
};

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
