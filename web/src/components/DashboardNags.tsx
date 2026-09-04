import Link from "next/link";
import {
  dashboardNags,
  STALE_DAYS,
  type DashboardNags as Nags,
} from "@/lib/derive/nags";
import type { Client } from "@/lib/data/types";

const BUCKETS: { key: keyof Nags; label: string }[] = [
  { key: "overdue", label: "Overdue next-action" },
  { key: "deferralReady", label: "Deferral window open" },
  { key: "deferralPending", label: "Deferral counting down" },
  { key: "stale", label: `Stale (${STALE_DAYS}d+)` },
  { key: "missingPaypal", label: "Missing PayPal plan" },
  { key: "textableNow", label: "Textable now" },
  { key: "ascensionSignals", label: "Open ascension signals" },
];

export function DashboardNags({
  clients,
  openSignalClientIds,
  now,
}: {
  clients: Client[];
  openSignalClientIds: Set<string>;
  now: Date;
}) {
  const nags = dashboardNags(clients, openSignalClientIds, now);

  return (
    <div className="nags">
      {BUCKETS.map((b) => {
        const rows = nags[b.key];
        return (
          <div key={b.key} className="nag-bucket">
            <div className="nag-bucket-head">
              <span>{b.label}</span>
              <span className="nag-count">{rows.length}</span>
            </div>
            {rows.length === 0 ? (
              <div className="nag-empty">nothing here</div>
            ) : (
              <ul className="nag-list">
                {rows.map((r) => (
                  <li key={r.id}>
                    <Link href={`/clients/${r.id}`} className="nag-row">
                      <span className="nag-name">{r.businessName}</span>
                      <span className="nag-detail">{r.detail}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
