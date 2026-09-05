import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import { snakeizeKeys } from "@/lib/data/camelize";
import { mapAssistantMessageRow } from "@/lib/data/mappers";
import type { AssistantMessage, AssistantMessageRole } from "@/lib/data/types";

const SELECT = "*";

export type AppendMessageInput = {
  clientId: string | null;
  role: AssistantMessageRole;
  content: string;
  proposedActions?: unknown;
};

/** A thread's messages, oldest first — `clientId: null` is the general thread. */
export async function listMessages(clientId: string | null): Promise<AssistantMessage[]> {
  let query = getSupabaseAdmin()
    .from("assistant_messages")
    .select(SELECT)
    .order("created_at", { ascending: true });

  query = clientId === null ? query.is("client_id", null) : query.eq("client_id", clientId);

  const { data, error } = await query;
  if (error) throw new Error(`listMessages(${clientId}): ${error.message}`);
  return (data ?? []).map((r) => mapAssistantMessageRow(r as Record<string, unknown>));
}

/** Deletes every message in a thread — `clientId: null` clears the general thread. */
export async function clearMessages(clientId: string | null): Promise<void> {
  let query = getSupabaseAdmin().from("assistant_messages").delete();
  query = clientId === null ? query.is("client_id", null) : query.eq("client_id", clientId);

  const { error } = await query;
  if (error) throw new Error(`clearMessages(${clientId}): ${error.message}`);
}

export async function appendMessage(input: AppendMessageInput): Promise<AssistantMessage> {
  const { data, error } = await getSupabaseAdmin()
    .from("assistant_messages")
    .insert(snakeizeKeys(input as Record<string, unknown>))
    .select(SELECT)
    .single();

  if (error) throw new Error(`appendMessage: ${error.message}`);
  return mapAssistantMessageRow(data as Record<string, unknown>);
}
