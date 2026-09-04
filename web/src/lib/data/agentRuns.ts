import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import { snakeizeKeys } from "@/lib/data/camelize";
import { mapAgentRunRow } from "@/lib/data/mappers";
import type { AgentRun, AgentRunKind } from "@/lib/data/types";

const SELECT = "*";

export type CreateAgentRunInput = {
  kind: AgentRunKind;
  clientId?: string | null;
  input: unknown;
  output: unknown;
  tokensIn?: number | null;
  tokensOut?: number | null;
  model?: string | null;
};

export async function createAgentRun(input: CreateAgentRunInput): Promise<AgentRun> {
  const { data, error } = await getSupabaseAdmin()
    .from("agent_runs")
    .insert(snakeizeKeys(input as Record<string, unknown>))
    .select(SELECT)
    .single();

  if (error) throw new Error(`createAgentRun: ${error.message}`);
  return mapAgentRunRow(data as Record<string, unknown>);
}
