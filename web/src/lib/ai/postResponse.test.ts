import { describe, expect, it } from "vitest";
import {
  buildUserPrompt,
  parseGeneratedPost,
  runGeneratePost,
  stripJsonFences,
  POST_GENERATOR_MODEL,
} from "@/lib/ai/postResponse";

describe("stripJsonFences", () => {
  it("strips ```json fences", () => {
    expect(stripJsonFences('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("strips bare ``` fences", () => {
    expect(stripJsonFences('```\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it("leaves already-clean JSON untouched (trimmed)", () => {
    expect(stripJsonFences('  {"a":1}  ')).toBe('{"a":1}');
  });
});

describe("parseGeneratedPost", () => {
  it("parses a valid response", () => {
    const out = parseGeneratedPost('{"gifVersion":"g","normalVersion":"n"}');
    expect(out).toEqual({ gifVersion: "g", normalVersion: "n" });
  });

  it("parses through markdown fences defensively", () => {
    const out = parseGeneratedPost('```json\n{"gifVersion":"g","normalVersion":"n"}\n```');
    expect(out).toEqual({ gifVersion: "g", normalVersion: "n" });
  });

  it("throws on malformed JSON", () => {
    expect(() => parseGeneratedPost("not json")).toThrow();
  });

  it("throws when gifVersion is missing", () => {
    expect(() => parseGeneratedPost('{"normalVersion":"n"}')).toThrow(/gifVersion/);
  });

  it("throws when normalVersion is empty", () => {
    expect(() => parseGeneratedPost('{"gifVersion":"g","normalVersion":""}')).toThrow(
      /normalVersion/,
    );
  });
});

describe("buildUserPrompt", () => {
  const ctx = {
    niche: "junk removal businesses",
    offerType: "website" as const,
    spots: 2,
    costPhrase: "free",
  };

  it("includes the core fields", () => {
    const prompt = buildUserPrompt(ctx);
    expect(prompt).toContain("Niche: junk removal businesses");
    expect(prompt).toContain("Offer: website");
    expect(prompt).toContain("Spots available: 2");
    expect(prompt).toContain("Cost phrasing to use: free");
    expect(prompt).toContain("Additional context: none");
  });

  it("includes extra context when given", () => {
    const prompt = buildUserPrompt({ ...ctx, extra: "posting in a generalized group" });
    expect(prompt).toContain("Additional context: posting in a generalized group");
  });

  it("appends group rules notes when present", () => {
    const prompt = buildUserPrompt(ctx, { groupRulesNotes: "no self-promo before 10 posts" });
    expect(prompt).toContain("no self-promo before 10 posts");
  });

  it("omits any group-rules line when absent", () => {
    const prompt = buildUserPrompt(ctx, { groupRulesNotes: null });
    expect(prompt.toLowerCase()).not.toContain("posting rules");
  });

  it("omits a blank group-rules note", () => {
    const prompt = buildUserPrompt(ctx, { groupRulesNotes: "   " });
    expect(prompt.toLowerCase()).not.toContain("posting rules");
  });
});

describe("runGeneratePost", () => {
  const ctx = {
    niche: "junk removal businesses",
    offerType: "website" as const,
    spots: 2,
    costPhrase: "free",
  };

  it("returns the parsed post plus usage/model from the injected client", async () => {
    const createMessage = async () => ({
      content: [{ type: "text", text: '{"gifVersion":"g","normalVersion":"n"}' }],
      usage: { input_tokens: 42, output_tokens: 17 },
      model: POST_GENERATOR_MODEL,
    });
    const out = await runGeneratePost(ctx, { createMessage });
    expect(out).toEqual({
      post: { gifVersion: "g", normalVersion: "n" },
      tokensIn: 42,
      tokensOut: 17,
      model: POST_GENERATOR_MODEL,
    });
  });

  it("propagates a parse failure from a malformed response", async () => {
    const createMessage = async () => ({
      content: [{ type: "text", text: "not json" }],
      usage: { input_tokens: 1, output_tokens: 1 },
      model: POST_GENERATOR_MODEL,
    });
    await expect(runGeneratePost(ctx, { createMessage })).rejects.toThrow();
  });

  it("joins multiple text blocks and ignores non-text blocks", async () => {
    const createMessage = async () => ({
      content: [
        { type: "text", text: '{"gifVersion":"g",' },
        { type: "tool_use", text: undefined },
        { type: "text", text: '"normalVersion":"n"}' },
      ],
      usage: { input_tokens: 1, output_tokens: 1 },
      model: POST_GENERATOR_MODEL,
    });
    const out = await runGeneratePost(ctx, { createMessage });
    expect(out.post).toEqual({ gifVersion: "g", normalVersion: "n" });
  });

  it("passes group rules notes through into the built prompt", async () => {
    let seenPrompt = "";
    const createMessage = async (params: { messages: { content: string }[] }) => {
      seenPrompt = params.messages[0].content;
      return {
        content: [{ type: "text", text: '{"gifVersion":"g","normalVersion":"n"}' }],
        usage: { input_tokens: 1, output_tokens: 1 },
        model: POST_GENERATOR_MODEL,
      };
    };
    await runGeneratePost(ctx, { groupRulesNotes: "no links in posts", createMessage });
    expect(seenPrompt).toContain("no links in posts");
  });
});
