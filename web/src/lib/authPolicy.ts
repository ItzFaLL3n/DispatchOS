import { verifySessionToken } from "@/lib/session";

/**
 * The access rule shared by the Proxy (edge gate) and any server-side check.
 * Pure: no request objects, no framework imports — just (path, token, secret).
 */

const PUBLIC_PREFIXES = ["/login"];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export type AccessDecision =
  | { allow: true }
  | { allow: false; redirectTo: string };

export function decideAccess(args: {
  pathname: string;
  token: string | undefined | null;
  secret: string;
}): AccessDecision {
  const { pathname, token, secret } = args;
  if (isPublicPath(pathname)) return { allow: true };
  if (verifySessionToken(token, secret)) return { allow: true };

  const query = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname)}`;
  return { allow: false, redirectTo: `/login${query}` };
}
