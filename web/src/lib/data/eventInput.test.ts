import { describe, expect, it } from "vitest";
import { ValidationError } from "@/lib/data/errors";
import { parseEventForm } from "@/lib/data/eventInput";

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

describe("parseEventForm", () => {
  it("accepts a valid user event", () => {
    expect(parseEventForm(form({ kind: "touch", body: "  texted him  " }))).toEqual({
      kind: "touch",
      body: "texted him",
    });
  });

  it("rejects a system-only kind", () => {
    expect(() => parseEventForm(form({ kind: "phase-change", body: "x" }))).toThrow(
      ValidationError,
    );
    expect(() => parseEventForm(form({ kind: "system", body: "x" }))).toThrow(
      ValidationError,
    );
  });

  it("rejects an unknown or missing kind", () => {
    expect(() => parseEventForm(form({ kind: "email", body: "x" }))).toThrow(ValidationError);
    expect(() => parseEventForm(form({ body: "x" }))).toThrow(ValidationError);
  });

  it("rejects an empty body", () => {
    expect(() => parseEventForm(form({ kind: "note", body: "   " }))).toThrow(ValidationError);
    expect(() => parseEventForm(form({ kind: "note" }))).toThrow(ValidationError);
  });

  it("rejects an over-long body", () => {
    expect(() =>
      parseEventForm(form({ kind: "note", body: "x".repeat(2001) })),
    ).toThrow(ValidationError);
  });
});
