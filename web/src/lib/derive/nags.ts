import type { Client } from "@/lib/data/types";
import { daysBetween, isoDay } from "@/lib/derive/dates";
import { contactWindowStatus } from "@/lib/derive/contactWindow";

/** A client's phase counts as stale after this many days with no phase change. */
export const STALE_DAYS = 14;

export type NagRow = { id: string; businessName: string; detail: string };

export type DashboardNags = {
  overdue: NagRow[];
  deferralReady: NagRow[];
  deferralPending: NagRow[];
  stale: NagRow[];
  missingPaypal: NagRow[];
  textableNow: NagRow[];
  ascensionSignals: NagRow[];
};

function row(c: Client, detail: string): NagRow {
  return { id: c.id, businessName: c.businessName, detail };
}

/** Collect rows with a numeric sort key, then emit them sorted (ascending). */
type Keyed = { row: NagRow; key: number };
function sorted(items: Keyed[]): NagRow[] {
  return items.sort((a, b) => a.key - b.key).map((i) => i.row);
}

export function dashboardNags(
  clients: Client[],
  openSignalClientIds: Set<string>,
  now: Date,
): DashboardNags {
  const today = isoDay(now);

  const overdue: Keyed[] = [];
  const deferralReady: NagRow[] = [];
  const deferralPending: Keyed[] = [];
  const stale: Keyed[] = [];
  const missingPaypal: NagRow[] = [];
  const textable: Keyed[] = [];
  const ascensionSignals: NagRow[] = [];

  for (const c of clients) {
    if (c.nextActionAt && c.nextActionAt < today) {
      overdue.push({
        row: row(
          c,
          `due ${c.nextActionAt}${c.nextActionNote ? ` · ${c.nextActionNote}` : ""}`,
        ),
        key: daysBetween(c.nextActionAt, today), // most overdue (largest) first → negate below
      });
    }

    if (c.doNotPitchUntil) {
      if (c.doNotPitchUntil < today) {
        deferralReady.push(row(c, `window opened ${c.doNotPitchUntil}`));
      } else {
        const days = daysBetween(today, c.doNotPitchUntil);
        deferralPending.push({
          row: row(c, `opens in ${days} day${days === 1 ? "" : "s"}`),
          key: days,
        });
      }
    }

    const phaseAge = daysBetween(
      isoDay(new Date(c.phaseUpdatedAt ?? c.createdAt)),
      today,
    );
    if (phaseAge > STALE_DAYS) {
      stale.push({
        row: row(c, `phase ${c.phase} unchanged ${phaseAge}d`),
        key: -phaseAge, // oldest first
      });
    }

    if (c.buildStatus === "delivered" && c.phase >= 8 && !c.paypalPlanUrl) {
      missingPaypal.push(row(c, `phase ${c.phase} · no PayPal plan link`));
    }

    if (c.timezone) {
      const w = contactWindowStatus(c.timezone, now);
      if (w && (w.level === "green" || w.level === "amber")) {
        textable.push({
          row: row(c, `${w.level} · ${w.localDay} ${w.localTime}`),
          key: w.level === "green" ? 0 : 1,
        });
      }
    }

    if (openSignalClientIds.has(c.id)) {
      ascensionSignals.push(row(c, "open ascension signal — follow up"));
    }
  }

  return {
    overdue: sorted(overdue.map((k) => ({ row: k.row, key: -k.key }))),
    deferralReady,
    deferralPending: sorted(deferralPending),
    stale: sorted(stale),
    missingPaypal,
    textableNow: sorted(textable),
    ascensionSignals,
  };
}
