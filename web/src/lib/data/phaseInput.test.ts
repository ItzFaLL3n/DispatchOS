import { describe, expect, it } from "vitest";
import { ValidationError } from "@/lib/data/errors";
import { parsePhaseForm } from "@/lib/data/phaseInput";

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

describe("parsePhaseForm", () => {
  it("returns an empty patch when nothing is submitted", () => {
    expect(parsePhaseForm(form({}))).toEqual({});
  });

  it("parses a valid phase", () => {
    expect(parsePhaseForm(form({ phase: "9" }))).toEqual({ phase: 9 });
  });

  it("rejects a non-integer or out-of-range phase", () => {
    expect(() => parsePhaseForm(form({ phase: "abc" }))).toThrow(ValidationError);
    expect(() => parsePhaseForm(form({ phase: "0" }))).toThrow(ValidationError);
    expect(() => parsePhaseForm(form({ phase: "11" }))).toThrow(ValidationError);
  });

  it("distinguishes an absent sub-state from a cleared one", () => {
    expect(parsePhaseForm(form({}))).not.toHaveProperty("phaseSubstate");
    expect(parsePhaseForm(form({ phaseSubstate: "" }))).toEqual({ phaseSubstate: null });
    expect(parsePhaseForm(form({ phaseSubstate: "bridge" }))).toEqual({
      phaseSubstate: "bridge",
    });
  });

  it("rejects an unknown sub-state", () => {
    expect(() => parsePhaseForm(form({ phaseSubstate: "xyz" }))).toThrow(ValidationError);
  });

  it("parses / clears the date fields", () => {
    expect(parsePhaseForm(form({ nextActionAt: "2026-09-18" }))).toEqual({
      nextActionAt: "2026-09-18",
    });
    expect(parsePhaseForm(form({ nextActionAt: "" }))).toEqual({ nextActionAt: null });
    expect(parsePhaseForm(form({ doNotPitchUntil: "" }))).toEqual({
      doNotPitchUntil: null,
    });
  });

  it("rejects a malformed date", () => {
    expect(() => parsePhaseForm(form({ nextActionAt: "soon" }))).toThrow(ValidationError);
    expect(() => parsePhaseForm(form({ doNotPitchUntil: "2026-13-40" }))).toThrow(
      ValidationError,
    );
  });

  it("trims the next-action note and clears a blank one", () => {
    expect(parsePhaseForm(form({ nextActionNote: "  call him  " }))).toEqual({
      nextActionNote: "call him",
    });
    expect(parsePhaseForm(form({ nextActionNote: "   " }))).toEqual({
      nextActionNote: null,
    });
  });

  it("validates build status against the allowed set", () => {
    expect(parsePhaseForm(form({ buildStatus: "delivered" }))).toEqual({
      buildStatus: "delivered",
    });
    expect(() => parsePhaseForm(form({ buildStatus: "shipping" }))).toThrow(ValidationError);
  });
});
