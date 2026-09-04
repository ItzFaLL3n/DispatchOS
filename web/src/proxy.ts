import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/lib/env";
import { decideAccess } from "@/lib/authPolicy";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Auth gate. Next 16 renamed Middleware to Proxy; it runs on the Node.js
 * runtime by default, so `node:crypto` in session verification is fine here.
 * The decision itself lives in the pure `decideAccess` (src/lib/authPolicy.ts).
 */
export function proxy(request: NextRequest): NextResponse {
  const decision = decideAccess({
    pathname: request.nextUrl.pathname,
    token: request.cookies.get(SESSION_COOKIE)?.value,
    secret: serverEnv.appSessionSecret,
  });

  if (decision.allow) return NextResponse.next();
  return NextResponse.redirect(new URL(decision.redirectTo, request.url));
}

export const config = {
  // Run on everything except Next internals and static asset files. Without
  // this, the gate would also block the login page's own CSS/JS.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
