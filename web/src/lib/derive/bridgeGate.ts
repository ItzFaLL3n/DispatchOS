import type { Client } from "@/lib/data/types";
import { daysBetween, isoDay } from "@/lib/derive/dates";

export const MIN_DAYS_SINCE_DELIVERY = 3;

export type GateItemKey =
  | "site-live"
  | "time-since-delivery"
  | "paypal-ready"
  | "checkin-landed"
  | "nothing-asked";

export type GateItem = {
  key: GateItemKey;
  label: string;
  met: boolean;
  source: "auto" | "manual";
};

export type BridgeGate = {
  ready: boolean;
  items: GateItem[];
  /** Labels of the unmet items. */
  missing: string[];
};

/**
 * The Phase 8.5 "bridge" preconditions for a delivered client. Three are derived
 * from the record; two ("landed" / "nothing asked since delivery") can't be
 * detected, so they are manual flags on the client (ticket 06).
 */
export function bridgeGateStatus(client: Client, now: Date): BridgeGate {
  const siteLive =
    client.buildStatus === "delivered" && Boolean(client.siteUrl);

  const daysSinceDelivery = client.deliveredAt
    ? daysBetween(client.deliveredAt, isoDay(now))
    : null;
  const enoughTime =
    daysSinceDelivery !== null && daysSinceDelivery >= MIN_DAYS_SINCE_DELIVERY;

  const items: GateItem[] = [
    { key: "site-live", label: "Site delivered and live", met: siteLive, source: "auto" },
    {
      key: "time-since-delivery",
      label: `At least ${MIN_DAYS_SINCE_DELIVERY} days since delivery`,
      met: enoughTime,
      source: "auto",
    },
    {
      key: "paypal-ready",
      label: "PayPal plan link ready",
      met: Boolean(client.paypalPlanUrl),
      source: "auto",
    },
    {
      key: "checkin-landed",
      label: "Zero-ask check-in landed",
      met: client.checkinLanded,
      source: "manual",
    },
    {
      key: "nothing-asked",
      label: "Nothing asked since delivery",
      met: client.nothingAskedSinceDelivery,
      source: "manual",
    },
  ];

  const missing = items.filter((i) => !i.met).map((i) => i.label);
  return { ready: missing.length === 0, items, missing };
}
