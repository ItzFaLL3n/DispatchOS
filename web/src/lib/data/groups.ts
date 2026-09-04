import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import { mapGroupRow } from "@/lib/data/mappers";
import type { Group } from "@/lib/data/types";

const SELECT = "*";

export async function listGroups(): Promise<Group[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("groups")
    .select(SELECT)
    .order("name", { ascending: true });

  if (error) throw new Error(`listGroups: ${error.message}`);
  return (data ?? []).map((r) => mapGroupRow(r as Record<string, unknown>));
}
