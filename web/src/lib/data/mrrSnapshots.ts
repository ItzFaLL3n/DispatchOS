import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";

export type MrrSnapshot = { at: string; mrr: number };

// Postgres raw "relation does not exist", or PostgREST's own "not in schema
// cache" (what actually comes back through supabase-js for a missing table).
const TABLE_MISSING_CODES = new Set(["42P01", "PGRST205"]);
function isTableMissing(code: string | undefined): boolean {
  return code !== undefined && TABLE_MISSING_CODES.has(code);
}

/**
 * Upserts today's MRR total. Called on every dashboard load — the trend
 * fills in naturally over time (see migration 0004_mrr_snapshots.sql).
 * Silently no-ops if that migration hasn't been applied yet.
 */
export async function recordMrrSnapshot(mrr: number): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await getSupabaseAdmin()
    .from("mrr_snapshots")
    .upsert({ at: today, mrr }, { onConflict: "at" });

  if (error && !isTableMissing(error.code)) {
    throw new Error(`recordMrrSnapshot: ${error.message}`);
  }
}

/** Last `days` of MRR history, oldest first. Empty if the migration is missing. */
export async function listMrrSnapshots(days = 30): Promise<MrrSnapshot[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("mrr_snapshots")
    .select("at, mrr")
    .order("at", { ascending: false })
    .limit(days);

  if (error) {
    if (isTableMissing(error.code)) return [];
    throw new Error(`listMrrSnapshots: ${error.message}`);
  }
  return (data ?? []).reverse().map((r) => ({ at: r.at as string, mrr: Number(r.mrr) }));
}
