# 02: Password gate

**What to build:** A single shared-password login that protects the whole app.
Visiting any route without a valid session redirects to a login page; entering
the correct password sets a signed session cookie and lets you in and stay in
across visits and devices; a sign-out action drops the session.

**Blocked by:** 01.

**Status:** ready-for-agent

- [ ] A login page accepts a password and checks it against `APP_PASSWORD`
      server-side.
- [ ] On success, a signed httpOnly `session` cookie is set (HMAC via
      `APP_SESSION_SECRET`); on failure, a plain "wrong password" message, no
      lockout.
- [ ] Middleware guards every route except the login page and static assets;
      an unauthenticated request to any other route redirects to login.
- [ ] A tampered or absent cookie is treated as unauthenticated.
- [ ] A sign-out control clears the cookie and returns to login.
- [ ] The session persists across browser restarts (cookie max-age set, not
      session-only) so the phone stays logged in.
- [ ] Test: a request with no `session` cookie to a protected route is
      rejected by the middleware; a request with a validly signed cookie passes.
