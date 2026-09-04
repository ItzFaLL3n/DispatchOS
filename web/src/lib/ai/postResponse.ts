/**
 * Pure request/response handling for the post generator — no `server-only`,
 * no env access, no direct network call. `generatePost.ts` (server-only)
 * supplies the real Anthropic client; this is the unit-testable seam.
 */
import { POST_GENERATOR_SYSTEM_PROMPT } from "@/lib/ai/contentRules";
import type { GeneratedPost, PostOfferType } from "@/lib/ai/templateGenerate";

export const POST_GENERATOR_MODEL = "claude-sonnet-5";

export type GeneratePostCtx = {
  niche: string;
  offerType: PostOfferType;
  spots: string | number;
  costPhrase: string;
  extra?: string;
};

export type GeneratePostResult = {
  post: GeneratedPost;
  tokensIn: number;
  tokensOut: number;
  model: string;
};

/** A minimal shape covering what this module reads off an Anthropic Messages response. */
export type MessagesCreateFn = (params: {
  model: string;
  max_tokens: number;
  system: string;
  messages: { role: "user"; content: string }[];
}) => Promise<{
  content: { type: string; text?: string }[];
  usage: { input_tokens: number; output_tokens: number };
  model: string;
}>;

/** Strip ```json fences defensively; the prompt asks for none, but don't trust it. */
export function stripJsonFences(text: string): string {
  return text.replace(/```json|```/g, "").trim();
}

export function buildUserPrompt(
  ctx: GeneratePostCtx,
  opts: { groupRulesNotes?: string | null } = {},
): string {
  const lines = [
    `Niche: ${ctx.niche}`,
    `Offer: ${ctx.offerType}`,
    `Spots available: ${ctx.spots}`,
    `Cost phrasing to use: ${ctx.costPhrase}`,
    `Additional context: ${ctx.extra?.trim() || "none"}`,
  ];
  if (opts.groupRulesNotes?.trim()) {
    lines.push(`This group's own posting rules (follow these too): ${opts.groupRulesNotes.trim()}`);
  }
  return lines.join("\n");
}

/** Parses and validates the model's JSON response. Throws on any malformed shape. */
export function parseGeneratedPost(text: string): GeneratedPost {
  const clean = stripJsonFences(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(`generatePost: model did not return valid JSON: ${clean.slice(0, 200)}`);
  }
  const obj = parsed as Record<string, unknown>;
  if (typeof obj?.gifVersion !== "string" || !obj.gifVersion.trim()) {
    throw new Error("generatePost: response missing a non-empty gifVersion");
  }
  if (typeof obj?.normalVersion !== "string" || !obj.normalVersion.trim()) {
    throw new Error("generatePost: response missing a non-empty normalVersion");
  }
  return { gifVersion: obj.gifVersion, normalVersion: obj.normalVersion };
}

/**
 * Builds the prompt, calls the given `createMessage`, and validates the
 * result. Pure given its `createMessage` — the only I/O is what the caller
 * injects, so this is fully unit-testable without a real API key.
 */
export async function runGeneratePost(
  ctx: GeneratePostCtx,
  opts: { groupRulesNotes?: string | null; createMessage: MessagesCreateFn },
): Promise<GeneratePostResult> {
  const response = await opts.createMessage({
    model: POST_GENERATOR_MODEL,
    max_tokens: 1000,
    system: POST_GENERATOR_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(ctx, opts) }],
  });

  const text = response.content.map((block) => block.text ?? "").join("");

  return {
    post: parseGeneratedPost(text),
    tokensIn: response.usage.input_tokens,
    tokensOut: response.usage.output_tokens,
    model: response.model,
  };
}
