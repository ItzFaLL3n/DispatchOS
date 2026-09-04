import "server-only";
import { serverEnv } from "@/lib/env";
import type { ProposedAction } from "@/lib/assistant/guardrail";

export type WorkerHistoryEntry = { role: "user" | "assistant"; content: string };

export type WorkerCallResult = {
  reply: string;
  proposedActions: ProposedAction[];
  model: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
};

/** Calls the deployed assistant worker (worker/, spec 0003). Throws on any failure. */
export async function callWorker(input: {
  clientId: string | null;
  history: WorkerHistoryEntry[];
  message: string;
}): Promise<WorkerCallResult> {
  const res = await fetch(`${serverEnv.assistantWorkerUrl}/assistant/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serverEnv.workerSharedSecret}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`callWorker: ${res.status} ${body}`);
  }
  return (await res.json()) as WorkerCallResult;
}
