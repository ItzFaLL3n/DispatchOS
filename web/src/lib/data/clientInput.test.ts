import { describe, expect, it } from "vitest";
import {
  parseClientForm,
  slugify,
  ValidationError,
} from "@/lib/data/clientInput";

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

const validCreate = {
  businessName: "HD Junk Removal & Demolition LLC",
  source: "fb-comment",
  offerType: "free-website",
  buildStatus: "delivered",
};

describe("slugify", () => {
  it("kebab-cases a business name", () => {
    expect(slugify("HD Junk Removal & Demolition LLC")).toBe(
      "hd-junk-removal-demolition-llc",
    );
  });
  it("strips accents and trims separators", () => {
    expect(slugify("  Café Déjà Vu!!! ")).toBe("cafe-deja-vu");
  });
  it("falls back to 'client' for an empty result", () => {
    expect(slugify("   ")).toBe("client");
    expect(slugify("!!!")).toBe("client");
  });
});

describe("parseClientForm — create", () => {
  it("accepts the minimal valid set and derives a slug + mrr 0", () => {
    const out = parseClientForm(form(validCreate), { mode: "create" });
    expect(out).toMatchObject({
      businessName: "HD Junk Removal & Demolition LLC",
      slug: "hd-junk-removal-demolition-llc",
      source: "fb-comment",
      offerType: "free-website",
      buildStatus: "delivered",
      mrr: 0,
    });
  });

  it("requires business name, source, offer type, build status", () => {
    expect(() => parseClientForm(form({}), { mode: "create" })).toThrow(ValidationError);
    expect(() =>
      parseClientForm(form({ businessName: "X" }), { mode: "create" }),
    ).toThrow(/source/i);
    expect(() =>
      parseClientForm(form({ businessName: "X", source: "other" }), { mode: "create" }),
    ).toThrow(/offer type/i);
    expect(() =>
      parseClientForm(
        form({ businessName: "X", source: "other", offerType: "both" }),
        { mode: "create" },
      ),
    ).toThrow(/build status/i);
  });

  it("rejects an out-of-set enum value", () => {
    expect(() =>
      parseClientForm(form({ ...validCreate, source: "linkedin" }), { mode: "create" }),
    ).toThrow(ValidationError);
  });

  it("turns blank optional text into null", () => {
    const out = parseClientForm(
      form({ ...validCreate, contactName: "  ", notes: "" }),
      { mode: "create" },
    );
    expect(out.contactName).toBeNull();
    expect(out.notes).toBeNull();
  });

  it("keeps multi-line brief_md intact", () => {
    const md = "# HD\n\n- line one\n- line two";
    const out = parseClientForm(form({ ...validCreate, briefMd: md }), { mode: "create" });
    expect(out.briefMd).toBe(md);
  });

  it("validates mrr as a number >= 0", () => {
    expect(() =>
      parseClientForm(form({ ...validCreate, mrr: "abc" }), { mode: "create" }),
    ).toThrow(ValidationError);
    expect(() =>
      parseClientForm(form({ ...validCreate, mrr: "-5" }), { mode: "create" }),
    ).toThrow(ValidationError);
    expect(parseClientForm(form({ ...validCreate, mrr: "39" }), { mode: "create" }).mrr).toBe(39);
  });
});

describe("parseClientForm — update", () => {
  it("returns only the fields present in the form (partial patch)", () => {
    const out = parseClientForm(form({ notes: "called him today" }), { mode: "update" });
    expect(out).toEqual({ notes: "called him today" });
  });

  it("lets a nullable field be explicitly cleared", () => {
    const out = parseClientForm(form({ contactName: "" }), { mode: "update" });
    expect(out).toEqual({ contactName: null });
  });

  it("rejects an empty business name on update", () => {
    expect(() =>
      parseClientForm(form({ businessName: "   " }), { mode: "update" }),
    ).toThrow(ValidationError);
  });

  it("does not require source / offer type / build status on update", () => {
    expect(() =>
      parseClientForm(form({ retainerTier: "$49/mo" }), { mode: "update" }),
    ).not.toThrow();
  });
});
