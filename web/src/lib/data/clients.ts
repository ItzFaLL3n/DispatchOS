import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import { mapClientRow } from "@/lib/data/mappers";
import type { Client } from "@/lib/data/types";

export async function listClients(): Promise<Client[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("clients")
    .select("*")
    .order("business_name", { ascending: true });

  if (error) throw new Error(`listClients: ${error.message}`);
  return (data ?? []).map((row) => mapClientRow(row as Record<string, unknown>));
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getClient(${id}): ${error.message}`);
  return data ? mapClientRow(data as Record<string, unknown>) : null;
}
