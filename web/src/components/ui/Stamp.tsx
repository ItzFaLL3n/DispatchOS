/**
 * Status stamp — ported from .stamp in os/_source/outreach-os.html.
 * Bordered, rotated -1deg, monospace, uppercase. The recurring motif for any
 * status-like value. Reuse this rather than inventing a badge.
 */

export type StampTone = "good" | "warn" | "info" | "bad" | "neutral";

export function Stamp({
  tone = "neutral",
  children,
}: {
  tone?: StampTone;
  children: React.ReactNode;
}) {
  return <span className={`stamp stamp-${tone}`}>{children}</span>;
}
