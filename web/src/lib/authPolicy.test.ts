import { describe, expect, it } from "vitest";
import { createSessionToken } from "@/lib/session";
import { decideAccess, isPublicPath, isSeparatelyAuthedPath } from "@/lib/authPolicy";

const SECRET = "policy-test-secret";
const validToken = createSessionToken(SECRET);

describe("isPublicPath", () => {
  it("treats the login route (and its children) as public", () => {
    expect(isPublicPath("/login")).toBe(true);
    expect(isPublicPath("/login/anything")).toBe(true);
  });

  it("treats everything else as protected", () => {
    expect(isPublicPath("/")).toBe(false);
    expect(isPublicPath("/clients")).toBe(false);
    expect(isPublicPath("/loginx")).toBe(false);
  });
});

describe("isSeparatelyAuthedPath", () => {
  it("treats /api/assistant/data (and its children) as separately authed", () => {
    expect(isSeparatelyAuthedPath("/api/assistant/data")).toBe(true);
    expect(isSeparatelyAuthedPath("/api/assistant/data/anything")).toBe(true);
  });

  it("keeps the operator-facing assistant routes behind the cookie gate", () => {
    expect(isSeparatelyAuthedPath("/api/assistant/message")).toBe(false);
    expect(isSeparatelyAuthedPath("/api/assistant/approve")).toBe(false);
  });

  it("treats everything else, including other /api routes, as not", () => {
    expect(isSeparatelyAuthedPath("/api/generate-post")).toBe(false);
    expect(isSeparatelyAuthedPath("/clients")).toBe(false);
    expect(isSeparatelyAuthedPath("/api/assistant/datax")).toBe(false);
  });
});

describe("decideAccess", () => {
  it("allows a separately-authed path with no session cookie", () => {
    expect(
      decideAccess({ pathname: "/api/assistant/data", token: undefined, secret: SECRET }),
    ).toEqual({ allow: true });
  });


  it("allows a public path with no token", () => {
    expect(decideAccess({ pathname: "/login", token: undefined, secret: SECRET })).toEqual({
      allow: true,
    });
  });

  it("allows a protected path with a valid token", () => {
    expect(decideAccess({ pathname: "/clients", token: validToken, secret: SECRET })).toEqual({
      allow: true,
    });
  });

  it("redirects a protected path with no token, carrying the attempted path", () => {
    expect(decideAccess({ pathname: "/clients", token: undefined, secret: SECRET })).toEqual({
      allow: false,
      redirectTo: "/login?next=%2Fclients",
    });
  });

  it("redirects the root with no next param", () => {
    expect(decideAccess({ pathname: "/", token: null, secret: SECRET })).toEqual({
      allow: false,
      redirectTo: "/login",
    });
  });

  it("redirects when the token is invalid or signed with another secret", () => {
    expect(
      decideAccess({ pathname: "/clients", token: "bad.token.here", secret: SECRET }).allow,
    ).toBe(false);
    expect(
      decideAccess({ pathname: "/clients", token: validToken, secret: "other-secret" }).allow,
    ).toBe(false);
  });
});
