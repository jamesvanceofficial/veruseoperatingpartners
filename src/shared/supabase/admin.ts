import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseSecretKey, supabaseUrl } from "./env";

/**
 * Full-access client using the secret key — server-only, never imported
 * from a "use client" file or exposed to the browser. Every table's RLS
 * policy is select-only for `authenticated`; all writes go through a
 * server route using this client, after that route has independently
 * checked the caller's role.
 */
export function createAdminClient() {
  return createSupabaseClient(supabaseUrl(), supabaseSecretKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
