import type { Client } from "@/lib/data/types";
import { daysBetween, isoDay } from "@/lib/derive/dates";

export type BoardColumn =
  | "check-in"
  | "bridge"
  | "retainer"
  | "domain-trigger"
  | "growth"
  | "won"
  | "closed";

export const BOARD_COLUMNS: { key: BoardColumn; label: string }[] = [
  { key: "check-in", label: "Check-in" },
  { key: "bridge", label: "Bridge" },
  { key: "retainer", label: "Retainer" },
  { key: "domain-trigger", label: "Domain trigger" },
  { key: "growth", label: "Growth" },
  { key: "won", label: "Won" },
  { key: "closed", label: "Closed" },
];

export type Placement = { column: BoardColumn; dataWarning: boolean };

/**
 * Where a *delivered* client sits in the post-delivery sequence. Callers filter
 * to `buildStatus === "delivered"` first; a delivered client below phase 8 is a
 * data anomaly and lands in Check-in flagged.
 */
export function conversionColumn(client: Client): Placement {
  if (client.retainerStatus === "active") return { column: "won", dataWarning: false };
  if (client.retainerStatus === "declined") {
    return { column: "closed", dataWarning: false };
  }

  if (client.phase >= 10) return { column: "growth", dataWarning: false };
  if (client.phase === 9) {
    return {
      column: client.phaseSubstate === "domain-trigger" ? "domain-trigger" : "retainer",
      dataWarning: false,
    };
  }
  if (client.phase === 8) {
    return {
      column: client.phaseSubstate === "bridge" ? "bridge" : "check-in",
      dataWarning: false,
    };
  }
  return { column: "check-in", dataWarning: true };
}

function deferralHint(client: Client, now: Date): string | null {
  if (client.retainerStatus !== "deferred") return null;
  if (!client.doNotPitchUntil) return "deferred — no re-check date set";
  const days = daysBetween(isoDay(now), client.doNotPitchUntil);
  if (days <= 0) return "pitch window is open";
  return `pitch opens in ${days} day${days === 1 ? "" : "s"}`;
}

/** One line per card: the single thing standing between this client and the next step. */
export function boardCardHint(client: Client, now: Date): string {
  const { column } = conversionColumn(client);
  const hasPaypal = Boolean(client.paypalPlanUrl);

  switch (column) {
    case "won":
      return client.mrr > 0 ? `converted · $${client.mrr}/mo` : "retainer active";
    case "closed":
      return "declined — the site stays theirs";
    case "growth":
      return "on the growth track";
    case "check-in":
      return client.checkinLanded
        ? "check-in logged — move to the bridge"
        : "zero-ask check-in not logged";
    case "bridge":
      return hasPaypal ? "waiting for a client-driven door" : "PayPal plan link missing";
    case "domain-trigger": {
      const deferred = deferralHint(client, now);
      if (deferred) return deferred;
      if (!hasPaypal) return "PayPal plan link missing";
      return "circling the domain — offer the $49 tier";
    }
    case "retainer": {
      const deferred = deferralHint(client, now);
      if (deferred) return deferred;
      if (!hasPaypal) return "PayPal plan link missing";
      if (client.retainerStatus === "pitched") return "pitched — awaiting a reply";
      return "ready to open the retainer offer";
    }
  }
}
