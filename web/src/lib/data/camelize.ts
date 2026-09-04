/**
 * Snake_case → camelCase for flat Supabase rows. The DB uses snake_case
 * (Postgres convention); the ported React components expect camelCase. This is
 * the one place that translation happens.
 */

export function snakeToCamel(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, ch: string) => ch.toUpperCase());
}

export function camelizeKeys<T = Record<string, unknown>>(
  row: Record<string, unknown>,
): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[snakeToCamel(key)] = value;
  }
  return out as T;
}
