/**
 * Offline template generator — no network, no AI. Ported from the artifact's
 * `templateGenerate()`. Used directly in Template mode and as the silent
 * fallback when a Live AI call fails.
 *
 * Two corrections from the artifact:
 * - Its normalVersion said "...feedback on how it's actually helping bring
 *   in more calls and jobs" — an implicit outcome claim (fails
 *   hard-rules.md rule 1's test: it would not "still be true" if the client
 *   got zero calls). Reworded to describe the deliverable, not a business
 *   result, per content-rules.md's reconciliation note.
 * - Its `offerType: 'both'` sentence read "a free a website and google
 *   review agent built for them" — a double article, from building the
 *   adjective by string-replacing an "a free " prefix that "both"'s label
 *   never had. Rebuilt without the fragile replace.
 */

export type PostOfferType = "website" | "review-agent" | "both";

export type TemplateGenerateCtx = {
  niche: string;
  offerType: PostOfferType;
  spots: string | number;
  costPhrase: string;
};

export type GeneratedPost = {
  gifVersion: string;
  normalVersion: string;
};

function offerNoun(offerType: PostOfferType): string {
  if (offerType === "review-agent") return "google review agent";
  if (offerType === "both") return "website and google review agent";
  return "website";
}

function costAdjective(offerType: PostOfferType, costPhrase: string): string {
  const noun = offerNoun(offerType);
  if (costPhrase === "free") {
    return `a free ${noun} built for them`;
  }
  return `a ${noun} built for them, ${costPhrase}`;
}

export function templateGenerate(ctx: TemplateGenerateCtx): GeneratedPost {
  const costAdj = costAdjective(ctx.offerType, ctx.costPhrase);

  const gifVersion = `looking for ${ctx.spots} ${ctx.niche} to get ${costAdj}.\nyou own it, host it anywhere; all i ask for is feedback.\nreach out if that's you.`;

  const normalVersion = `looking for ${ctx.spots} ${ctx.niche} to get ${costAdj}.\n\nyou own it, host it anywhere, no strings — all i ask for is feedback on how it actually works for your day-to-day.\n\nonly taking ${ctx.spots} right now so i can put real time into each one instead of spreading thin.\n\nif that's you, reach out and we'll get started.`;

  return { gifVersion, normalVersion };
}
