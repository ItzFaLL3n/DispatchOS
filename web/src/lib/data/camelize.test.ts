import { describe, expect, it } from "vitest";
import {
  camelizeKeys,
  camelToSnake,
  snakeizeKeys,
  snakeToCamel,
} from "@/lib/data/camelize";

describe("snakeToCamel", () => {
  it("converts snake_case to camelCase", () => {
    expect(snakeToCamel("business_name")).toBe("businessName");
    expect(snakeToCamel("paypal_plan_url")).toBe("paypalPlanUrl");
    expect(snakeToCamel("do_not_pitch_until")).toBe("doNotPitchUntil");
  });

  it("leaves single-word keys unchanged", () => {
    expect(snakeToCamel("id")).toBe("id");
    expect(snakeToCamel("mrr")).toBe("mrr");
  });
});

describe("camelizeKeys", () => {
  it("camelizes every key and passes values through untouched", () => {
    expect(
      camelizeKeys({
        business_name: "HD Junk Removal",
        contact_name: null,
        checkin_landed: false,
        mrr: 0,
        notes: "",
        phase: 9,
      }),
    ).toEqual({
      businessName: "HD Junk Removal",
      contactName: null,
      checkinLanded: false,
      mrr: 0,
      notes: "",
      phase: 9,
    });
  });

  it("returns a new object", () => {
    const input = { a_b: 1 };
    const out = camelizeKeys(input);
    expect(out).not.toBe(input);
  });
});

describe("camelToSnake", () => {
  it("converts camelCase to snake_case", () => {
    expect(camelToSnake("businessName")).toBe("business_name");
    expect(camelToSnake("paypalPlanUrl")).toBe("paypal_plan_url");
    expect(camelToSnake("briefMd")).toBe("brief_md");
    expect(camelToSnake("mrr")).toBe("mrr");
  });
});

describe("snakeizeKeys", () => {
  it("snake_cases keys and preserves values including null", () => {
    expect(
      snakeizeKeys({ businessName: "X", contactName: null, mrr: 39 }),
    ).toEqual({ business_name: "X", contact_name: null, mrr: 39 });
  });

  it("round-trips with camelizeKeys", () => {
    const camel = { businessName: "X", doNotPitchUntil: "2026-09-18", mrr: 0 };
    expect(camelizeKeys(snakeizeKeys(camel))).toEqual(camel);
  });
});
