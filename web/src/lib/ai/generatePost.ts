import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { runGeneratePost, type GeneratePostCtx, type GeneratePostResult, type MessagesCreateFn } from "@/lib/ai/postResponse";
import { serverEnv } from "@/lib/env";

export type { GeneratePostCtx, GeneratePostResult };
export { POST_GENERATOR_MODEL } from "@/lib/ai/postResponse";

function defaultCreateMessage(): MessagesCreateFn {
  const client = new Anthropic({ apiKey: serverEnv.anthropicApiKey });
  return client.messages.create.bind(client.messages) as MessagesCreateFn;
}

/**
 * Calls the real Messages API and returns a validated post. Throws on any
 * failure (bad key, network error, malformed response) — the caller
 * (the route handler) is responsible for the silent fallback to
 * `templateGenerate`. The actual request/response handling lives in the
 * pure `runGeneratePost` (`postResponse.ts`) — this file only supplies the
 * real Anthropic client, which is why it's the one carrying `server-only`.
 */
export async function generatePost(
  ctx: GeneratePostCtx,
  opts: { groupRulesNotes?: string | null; createMessage?: MessagesCreateFn } = {},
): Promise<GeneratePostResult> {
  const createMessage = opts.createMessage ?? defaultCreateMessage();
  return runGeneratePost(ctx, { groupRulesNotes: opts.groupRulesNotes, createMessage });
}
