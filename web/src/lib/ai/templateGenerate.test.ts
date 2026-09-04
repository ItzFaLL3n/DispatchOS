import { describe, expect, it } from "vitest";
import { templateGenerate } from "@/lib/ai/templateGenerate";

const base = { niche: "junk removal businesses", spots: 2 };

describe("templateGenerate", () => {
  it("returns the { gifVersion, normalVersion } shape, both strings", () => {
    const out = templateGenerate({ ...base, offerType: "website", costPhrase: "free" });
    expect(typeof out.gifVersion).toBe("string");
    expect(typeof out.normalVersion).toBe("string");
    expect(out.gifVersion.length).toBeGreaterThan(0);
    expect(out.normalVersion.length).toBeGreaterThan(0);
  });

  it("interpolates niche and spots into both versions", () => {
    const out = templateGenerate({
      niche: "hauling companies",
      spots: 3,
      offerType: "website",
      costPhrase: "free",
    });
    expect(out.gifVersion).toContain("3 hauling companies");
    expect(out.normalVersion).toContain("3 hauling companies");
    expect(out.normalVersion).toContain("only taking 3 right now");
  });

  it.each([
    ["website", "a free website built for them"],
    ["review-agent", "a free google review agent built for them"],
    ["both", "a free website and google review agent built for them"],
  ] as const)("offerType %s labels the deliverable correctly (free)", (offerType, expected) => {
    const out = templateGenerate({ ...base, offerType, costPhrase: "free" });
    expect(out.gifVersion).toContain(expected);
  });

  it("never produces a double article (both + free)", () => {
    const out = templateGenerate({ ...base, offerType: "both", costPhrase: "free" });
    expect(out.gifVersion).not.toContain("a free a ");
  });

  it("swaps in a non-free cost phrase instead of hardcoding 'free'", () => {
    const out = templateGenerate({ ...base, offerType: "website", costPhrase: "at no cost" });
    expect(out.gifVersion).toContain("a website built for them, at no cost");
    expect(out.gifVersion).not.toMatch(/\bfree\b/);
  });

  it("gif version is short (~3 lines) and normal version is longer (4-6 lines)", () => {
    const out = templateGenerate({ ...base, offerType: "website", costPhrase: "free" });
    expect(out.gifVersion.split("\n").length).toBeLessThanOrEqual(3);
    const normalLines = out.normalVersion.split("\n").filter((l) => l.trim() !== "");
    expect(normalLines.length).toBeGreaterThanOrEqual(4);
    expect(normalLines.length).toBeLessThanOrEqual(6);
  });

  it("never uses a blocklisted CTA", () => {
    const out = templateGenerate({ ...base, offerType: "both", costPhrase: "on the house" });
    for (const text of [out.gifVersion, out.normalVersion]) {
      expect(text.toLowerCase()).not.toContain("comment below");
      expect(text.toLowerCase()).not.toContain("dm me");
    }
  });

  it("never claims a business-outcome result (hard rule 1)", () => {
    const out = templateGenerate({ ...base, offerType: "website", costPhrase: "free" });
    for (const text of [out.gifVersion, out.normalVersion]) {
      expect(text.toLowerCase()).not.toContain("more calls");
      expect(text.toLowerCase()).not.toContain("more jobs");
      expect(text.toLowerCase()).not.toContain("bring in");
    }
  });
});
