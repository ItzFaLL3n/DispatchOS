import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import { snakeizeKeys } from "@/lib/data/camelize";
import { mapClientRow } from "@/lib/data/mappers";
import { computePhaseUpdate } from "@/lib/data/phaseUpdate";
import type { ParsedClientForm } from "@/lib/data/clientInput";
import type { PhasePatch } from "@/lib/data/phaseInput";
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

/** Flip one of the two manual bridge-gate flags. */
export async function setBridgeGateFlag(
  id: string,
  flag: "checkin_landed" | "nothing_asked_since_delivery",
  value: boolean,
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("clients")
    .update({ [flag]: value })
    .eq("id", id);
  if (error) throw new Error(`setBridgeGateFlag(${id}, ${flag}): ${error.message}`);
}

/**
 * Apply a phase / sequence-state patch with its bookkeeping (see
 * computePhaseUpdate). The client update and the event inserts are sequential,
 * not a single transaction — acceptable for a single-user tool; a failed event
 * insert surfaces as an error and can be retried.
 */
export async function applyPhaseUpdate(
  id: string,
  patch: PhasePatch,
): Promise<Client> {
  const current = await getClient(id);
  if (!current) throw new Error(`applyPhaseUpdate(${id}): not found`);

  const { update, events } = computePhaseUpdate(current, patch, new Date());
  if (Object.keys(update).length === 0) return current;

  const { data, error } = await getSupabaseAdmin()
    .from("clients")
    .update(update)
    .eq("id", id)
    .select(SELECT)
    .single();
  if (error) throw new Error(`applyPhaseUpdate(${id}): ${error.message}`);

  if (events.length > 0) {
    const rows = events.map((e) => ({ client_id: id, kind: e.kind, body: e.body }));
    const { error: evError } = await getSupabaseAdmin()
      .from("client_events")
      .insert(rows);
    if (evError) {
      throw new Error(`applyPhaseUpdate(${id}) events: ${evError.message}`);
    }
  }

  return mapClientRow(data as Record<string, unknown>);
}
