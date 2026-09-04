import "server-only";

/**
 * Server-only environment access. Never import this from a client component.
 * Values are read lazily so `next build` does not fail when a var is absent
 * locally; a missing var throws with a clear message the first time it is used.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See web/.env.example.`,
    );
  }
  return value;
}

export const serverEnv = {
  get supabaseUrl() {
    return required("SUPABASE_URL");
  },
  get supabaseServiceRoleKey() {
    return required("SUPABASE_SERVICE_ROLE_KEY");
  },
  get appPassword() {
    return required("APP_PASSWORD");
  },
  get appSessionSecret() {
    return required("APP_SESSION_SECRET");
  },
  get anthropicApiKey() {
    return required("ANTHROPIC_API_KEY");
  },
  /** Operator's own timezone for the client-local clock. Defaults to IST. */
  get operatorTz() {
    return process.env.OPERATOR_TZ || "Asia/Kolkata";
  },
};
