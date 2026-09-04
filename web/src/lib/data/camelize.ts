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

export function camelToSnake(key: string): string {
  return key.replace(/[A-Z]/g, (ch) => `_${ch.toLowerCase()}`);
}

/** camelCase object → snake_case, for writing back to Supabase. */
export function snakeizeKeys(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    out[camelToSnake(key)] = value;
  }
  return out;
}
