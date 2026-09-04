import { describe, expect, it } from "vitest";
import { ValidationError } from "@/lib/data/errors";
import { parseGroupForm } from "@/lib/data/groupInput";

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

describe("parseGroupForm — create", () => {
  it("needs a name", () => {
    expect(() => parseGroupForm(form({}), { mode: "create" })).toThrow(ValidationError);
    expect(() => parseGroupForm(form({ name: "  " }), { mode: "create" })).toThrow(
      ValidationError,
    );
  });

  it("defaults status to active", () => {
    expect(parseGroupForm(form({ name: "Junk Haulers Co-op" }), { mode: "create" })).toEqual({
      name: "Junk Haulers Co-op",
      status: "active",
    });
  });

  it("validates status against the allowed set", () => {
    expect(() =>
      parseGroupForm(form({ name: "x", status: "banned" }), { mode: "create" }),
    ).toThrow(ValidationError);
  });

  it("takes a valid last-post date, rejects a bad one, clears a blank one", () => {
    expect(
      parseGroupForm(form({ name: "x", lastPostDate: "2026-09-20" }), { mode: "create" })
        .lastPostDate,
    ).toBe("2026-09-20");
    expect(() =>
      parseGroupForm(form({ name: "x", lastPostDate: "soon" }), { mode: "create" }),
    ).toThrow(ValidationError);
    expect(
      parseGroupForm(form({ name: "x", lastPostDate: "" }), { mode: "create" }).lastPostDate,
    ).toBeNull();
  });

  it("keeps rules notes and url, trims blanks to null", () => {
    expect(
      parseGroupForm(
        form({ name: "x", rulesNotes: " no spam ", rulesUrl: " https://fb.com/g/x " }),
        { mode: "create" },
      ),
    ).toMatchObject({ rulesNotes: "no spam", rulesUrl: "https://fb.com/g/x" });
    expect(
      parseGroupForm(form({ name: "x", rulesNotes: "", rulesUrl: "" }), { mode: "create" }),
    ).toMatchObject({ rulesNotes: null, rulesUrl: null });
  });
});

describe("parseGroupForm — update", () => {
  it("returns only the submitted fields", () => {
    expect(parseGroupForm(form({ status: "flagged" }), { mode: "update" })).toEqual({
      status: "flagged",
    });
  });

  it("rejects a blank name on update", () => {
    expect(() => parseGroupForm(form({ name: " " }), { mode: "update" })).toThrow(
      ValidationError,
    );
  });
});
