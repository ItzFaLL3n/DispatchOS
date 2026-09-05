import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { AppSettings } from "@/lib/data/types";

const DEFAULT_MRR_GOAL = 10000;

/**
 * Singleton row (id=1) — see migration 0003_phase4_goals_mistakes.sql. Falls
 * back to the default goal if that migration hasn't been applied yet
 * (undefined_table, 42P01) so the dashboard doesn't 500 on a stale DB.
 */
export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await getSupabaseAdmin()
    .from("app_settings")
    .select("mrr_goal")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01") return { mrrGoal: DEFAULT_MRR_GOAL };
    throw new Error(`getSettings: ${error.message}`);
  }
  return { mrrGoal: data ? Number(data.mrr_goal) : DEFAULT_MRR_GOAL };
}

export async function updateMrrGoal(mrrGoal: number): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("app_settings")
    .update({ mrr_goal: mrrGoal, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) throw new Error(`updateMrrGoal: ${error.message}`);
}
