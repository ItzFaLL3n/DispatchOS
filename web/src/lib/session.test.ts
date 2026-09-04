import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  safeEqual,
  safeNextPath,
  verifySessionToken,
} from "@/lib/session";

const SECRET = "test-secret-0123456789abcdef";
const OTHER = "different-secret-abcdef0123456789";

describe("session token", () => {
  it("verifies a token it just created with the same secret", () => {
    const token = createSessionToken(SECRET);
    expect(verifySessionToken(token, SECRET)).toBe(true);
  });

  it("rejects a token verified with a different secret", () => {
    const token = createSessionToken(SECRET);
    expect(verifySessionToken(token, OTHER)).toBe(false);
  });

  it("rejects a token with a tampered signature", () => {
    const token = createSessionToken(SECRET);
    const flipped = token.slice(0, -1) + (token.at(-1) === "a" ? "b" : "a");
    expect(verifySessionToken(flipped, SECRET)).toBe(false);
  });

  it("rejects a token with a tampered payload", () => {
    const token = createSessionToken(SECRET, 1_000_000);
    const [version, , sig] = token.split(".");
    const forged = `${version}.9999999.${sig}`;
    expect(verifySessionToken(forged, SECRET)).toBe(false);
  });

  it("rejects a token with the wrong version", () => {
    const token = createSessionToken(SECRET, 1_000_000);
    const [, issuedAt, sig] = token.split(".");
    expect(verifySessionToken(`2.${issuedAt}.${sig}`, SECRET)).toBe(false);
  });

  it("rejects malformed / empty / missing tokens", () => {
    expect(verifySessionToken("", SECRET)).toBe(false);
    expect(verifySessionToken(undefined, SECRET)).toBe(false);
    expect(verifySessionToken(null, SECRET)).toBe(false);
    expect(verifySessionToken("garbage", SECRET)).toBe(false);
    expect(verifySessionToken("a.b", SECRET)).toBe(false);
    expect(verifySessionToken("a.b.c.d", SECRET)).toBe(false);
    expect(verifySessionToken("1.notanumber.sig", SECRET)).toBe(false);
  });

  it("produces a different token on each call", () => {
    const a = createSessionToken(SECRET, 1);
    const b = createSessionToken(SECRET, 2);
    expect(a).not.toBe(b);
  });
});

describe("safeEqual", () => {
  it("is true only for identical strings", () => {
    expect(safeEqual("hunter2", "hunter2")).toBe(true);
    expect(safeEqual("hunter2", "hunter3")).toBe(false);
    expect(safeEqual("hunter2", "hunter22")).toBe(false);
    expect(safeEqual("", "")).toBe(true);
  });
});

describe("safeNextPath", () => {
  it("passes through same-origin absolute paths", () => {
    expect(safeNextPath("/clients")).toBe("/clients");
    expect(safeNextPath("/clients/abc")).toBe("/clients/abc");
  });

  it("falls back to / for anything not a plain absolute path", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath("")).toBe("/");
    expect(safeNextPath("clients")).toBe("/");
    expect(safeNextPath("//evil.com")).toBe("/");
    expect(safeNextPath("https://evil.com")).toBe("/");
    expect(safeNextPath("/\t/evil")).toBe("/");
  });
});
