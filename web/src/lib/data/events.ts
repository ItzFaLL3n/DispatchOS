import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import { mapClientEventRow } from "@/lib/data/mappers";
import type { ClientEvent, UserEventKind } from "@/lib/data/types";

export async function listClientEvents(clientId: string): Promise<ClientEvent[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("client_events")
    .select("*")
    .eq("client_id", clientId)
    .order("at", { ascending: false });

  if (error) throw new Error(`listClientEvents(${clientId}): ${error.message}`);
  return (data ?? []).map((r) => mapClientEventRow(r as Record<string, unknown>));
}

export async function createClientEvent(
  clientId: string,
  kind: UserEventKind,
  body: string,
): Promise<ClientEvent> {
  const { data, error } = await getSupabaseAdmin()
    .from("client_events")
    .insert({ client_id: clientId, kind, body })
    .select("*")
    .single();

  if (error) throw new Error(`createClientEvent(${clientId}): ${error.message}`);
  return mapClientEventRow(data as Record<string, unknown>);
}

/** Distinct client ids that have at least one unresolved ascension-signal. */
export async function listOpenAscensionSignalClientIds(): Promise<string[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("client_events")
    .select("client_id")
    .eq("kind", "ascension-signal")
    .is("resolved_at", null);

  if (error) {
    throw new Error(`listOpenAscensionSignalClientIds: ${error.message}`);
  }
  return [...new Set((data ?? []).map((r) => String((r as { client_id: string }).client_id)))];
}

/** Marks an open ascension-signal resolved. No-op if it is not an open signal. */
export async function resolveAscensionSignal(eventId: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("client_events")
    .update({ resolved_at: new Date().toISOString() })
    .eq("id", eventId)
    .eq("kind", "ascension-signal")
    .is("resolved_at", null);

  if (error) throw new Error(`resolveAscensionSignal(${eventId}): ${error.message}`);
}

/** Marks an open mistake addressed. No-op if it is not an open mistake. */
export async function resolveMistake(eventId: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("client_events")
    .update({ resolved_at: new Date().toISOString() })
    .eq("id", eventId)
    .eq("kind", "mistake")
    .is("resolved_at", null);

  if (error) throw new Error(`resolveMistake(${eventId}): ${error.message}`);
}

export type RecentMistake = ClientEvent & { businessName: string };

/** Most recent unresolved mistakes across every client, for the dashboard. */
export async function listRecentMistakes(limit = 8): Promise<RecentMistake[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("client_events")
    .select("*, clients(business_name)")
    .eq("kind", "mistake")
    .is("resolved_at", null)
    .order("at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`listRecentMistakes: ${error.message}`);
  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown> & { clients?: { business_name?: string } | null };
    return {
      ...mapClientEventRow(r),
      businessName: r.clients?.business_name ?? "Unknown client",
    };
  });
}
