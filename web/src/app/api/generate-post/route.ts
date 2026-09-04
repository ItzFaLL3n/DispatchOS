import { NextResponse } from "next/server";
import { generatePost, type GeneratePostCtx } from "@/lib/ai/generatePost";
import { templateGenerate, type PostOfferType } from "@/lib/ai/templateGenerate";
import { createAgentRun } from "@/lib/data/agentRuns";
import { listGroups } from "@/lib/data/groups";

const OFFER_TYPES: PostOfferType[] = ["website", "review-agent", "both"];

type RequestBody = {
  mode: "ai" | "template";
  niche: string;
  offerType: PostOfferType;
  spots: string | number;
  costPhrase: string;
  extra?: string;
  groupId?: string | null;
};

function isValidBody(body: unknown): body is RequestBody {
  const b = body as Partial<RequestBody> | null;
  if (!b || typeof b !== "object") return false;
  if (b.mode !== "ai" && b.mode !== "template") return false;
  if (typeof b.niche !== "string" || !b.niche.trim()) return false;
  if (!b.offerType || !OFFER_TYPES.includes(b.offerType)) return false;
  if (b.spots === undefined || b.spots === null || b.spots === "") return false;
  if (typeof b.costPhrase !== "string" || !b.costPhrase.trim()) return false;
  return true;
}

/**
 * POST /api/generate-post — generates a two-version outreach post.
 *
 * `mode: "template"` never touches the network or `agent_runs` — it's a pure
 * function, not an agent call. `mode: "ai"` calls the real Messages API;
 * success writes an `agent_runs` row and returns `usedTemplate: false`; any
 * failure (missing/bad key, network error, malformed response) falls back to
 * the template silently and returns `usedTemplate: true` — this is a handled
 * path, not an error, so the response is 200 either way mode allows.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!isValidBody(body)) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  const ctx: GeneratePostCtx = {
    niche: body.niche,
    offerType: body.offerType,
    spots: body.spots,
    costPhrase: body.costPhrase,
    extra: body.extra,
  };

  if (body.mode === "template") {
    return NextResponse.json({ result: templateGenerate(ctx), usedTemplate: true });
  }

  let groupRulesNotes: string | null = null;
  if (body.groupId) {
    const groups = await listGroups();
    groupRulesNotes = groups.find((g) => g.id === body.groupId)?.rulesNotes ?? null;
  }

  try {
    const { post, tokensIn, tokensOut, model } = await generatePost(ctx, { groupRulesNotes });
    await createAgentRun({
      kind: "post",
      input: { ...ctx, groupId: body.groupId ?? null },
      output: post,
      tokensIn,
      tokensOut,
      model,
    });
    return NextResponse.json({ result: post, usedTemplate: false });
  } catch {
    return NextResponse.json({ result: templateGenerate(ctx), usedTemplate: true });
  }
}
