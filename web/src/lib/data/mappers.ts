import { camelizeKeys } from "@/lib/data/camelize";
import type { Client } from "@/lib/data/types";

/**
 * Row → domain object. Mostly a key rename (see camelize), plus the few
 * coercions PostgREST forces on us: `numeric` columns come back as strings.
 */
export function mapClientRow(row: Record<string, unknown>): Client {
  const c = camelizeKeys<Record<string, unknown>>(row);
  return {
    ...(c as unknown as Client),
    mrr: c.mrr == null ? 0 : Number(c.mrr),
  };
}
