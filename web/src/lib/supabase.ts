import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";

/**
 * Server-side Supabase client using the service-role key. RLS is off by design
 * (see os/specs/0001-phase-1-crm-port.md): the password gate is the only auth
 * boundary, and this key must never reach the browser bundle. The `server-only`
 * import above turns any client-side import into a build error.
 */

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(serverEnv.supabaseUrl, serverEnv.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
