/** Date-only helpers for the derive layer. All comparisons are in UTC whole days. */

export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Whole days from `fromIsoDate` to `toIsoDate` (both `YYYY-MM-DD`). */
export function daysBetween(fromIsoDate: string, toIsoDate: string): number {
  const from = Date.parse(`${fromIsoDate}T00:00:00Z`);
  const to = Date.parse(`${toIsoDate}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}
