import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import { snakeizeKeys } from "@/lib/data/camelize";
import { mapClientRow } from "@/lib/data/mappers";
import type { ParsedClientForm } from "@/lib/data/clientInput";
import type { Client } from "@/lib/data/types";

const SELECT = "*";

export async function listClients(): Promise<Client[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("clients")
    .select(SELECT)
    .order("business_name", { ascending: true });

  if (error) throw new Error(`listClients: ${error.message}`);
  return (data ?? []).map((row) => mapClientRow(row as Record<string, unknown>));
}

export async function getClient(id: string): Promise<Client | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("clients")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getClient(${id}): ${error.message}`);
  return data ? mapClientRow(data as Record<string, unknown>) : null;
}

/** `input` comes from parseClientForm(mode: "create"), which guarantees the
 *  required columns; the DB not-null constraints are the backstop. */
export async function createClient(input: ParsedClientForm): Promise<Client> {
  const { data, error } = await getSupabaseAdmin()
    .from("clients")
    .insert(snakeizeKeys(input as Record<string, unknown>))
    .select(SELECT)
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("A client with a similar name already exists.");
    }
    throw new Error(`createClient: ${error.message}`);
  }
  return mapClientRow(data as Record<string, unknown>);
}

export async function updateClient(
  id: string,
  patch: ParsedClientForm,
): Promise<Client> {
  const body = snakeizeKeys(patch as Record<string, unknown>);
  if (Object.keys(body).length === 0) {
    const current = await getClient(id);
    if (!current) throw new Error(`updateClient(${id}): not found`);
    return current;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("clients")
    .update(body)
    .eq("id", id)
    .select(SELECT)
    .single();

  if (error) throw new Error(`updateClient(${id}): ${error.message}`);
  return mapClientRow(data as Record<string, unknown>);
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("clients").delete().eq("id", id);
  if (error) throw new Error(`deleteClient(${id}): ${error.message}`);
}
