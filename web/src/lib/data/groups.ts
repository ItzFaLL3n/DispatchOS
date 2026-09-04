import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import { snakeizeKeys } from "@/lib/data/camelize";
import { mapGroupRow } from "@/lib/data/mappers";
import type { ParsedGroupForm } from "@/lib/data/groupInput";
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

export async function createGroup(input: ParsedGroupForm): Promise<Group> {
  const { data, error } = await getSupabaseAdmin()
    .from("groups")
    .insert(snakeizeKeys(input as Record<string, unknown>))
    .select(SELECT)
    .single();

  if (error) throw new Error(`createGroup: ${error.message}`);
  return mapGroupRow(data as Record<string, unknown>);
}

export async function updateGroup(id: string, patch: ParsedGroupForm): Promise<Group> {
  const body = snakeizeKeys(patch as Record<string, unknown>);
  if (Object.keys(body).length === 0) {
    const { data, error } = await getSupabaseAdmin()
      .from("groups")
      .select(SELECT)
      .eq("id", id)
      .single();
    if (error) throw new Error(`updateGroup(${id}): ${error.message}`);
    return mapGroupRow(data as Record<string, unknown>);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("groups")
    .update(body)
    .eq("id", id)
    .select(SELECT)
    .single();

  if (error) throw new Error(`updateGroup(${id}): ${error.message}`);
  return mapGroupRow(data as Record<string, unknown>);
}

export async function deleteGroup(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("groups").delete().eq("id", id);
  if (error) throw new Error(`deleteGroup(${id}): ${error.message}`);
}
