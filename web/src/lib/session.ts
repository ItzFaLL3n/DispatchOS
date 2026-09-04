import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Session token for the single shared-password gate. There is no user identity —
 * the token only proves someone entered the right password. Format:
 *
 *   <version>.<issuedAtMs>.<hmacSHA256(version.issuedAtMs, secret)>
 *
 * `issuedAtMs` is signed so each login yields a distinct token; it is not
 * checked for age (no server-side expiry — the cookie's max-age is the lifetime).
 */

const VERSION = "1";
export const SESSION_COOKIE = "session";

/** Valid URL path characters (RFC 3986 pchar plus "/" and "%"). */
const SAFE_PATH = /^\/[A-Za-z0-9\-._~!$&'()*+,;=:@/%]*$/;

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function createSessionToken(secret: string, issuedAtMs: number = Date.now()): string {
  const payload = `${VERSION}.${issuedAtMs}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(
  token: string | undefined | null,
  secret: string,
): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [version, issuedAt, sig] = parts;
  if (version !== VERSION) return false;
  if (!/^\d+$/.test(issuedAt)) return false;
  return safeEqual(sig, sign(`${version}.${issuedAt}`, secret));
}

/**
 * A post-login redirect target is only honoured if it is a plain same-origin
 * absolute path. Anything else — protocol-relative (`//host`), external,
 * relative, or containing whitespace / control chars / backslashes — falls
 * back to "/".
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return "/";
  if (next.startsWith("//")) return "/";
  if (!SAFE_PATH.test(next)) return "/";
  return next;
}
