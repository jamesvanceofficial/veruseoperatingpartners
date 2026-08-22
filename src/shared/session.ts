import { createClient as createServerSupabase } from "./supabase/server";
import type { Profile } from "./roles";

export type SessionUser = { id: string; email: string | null };

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}

export type ProfileResult =
  | { status: "ok"; profile: Profile }
  | { status: "not_configured" } // profiles table doesn't exist yet — migrations not run
  | { status: "not_found" }; // authenticated, but no profile row for this user

/**
 * `profiles` may not exist yet (migrations run manually by James in the
 * Supabase SQL Editor, not automatically). Every caller must handle
 * `not_configured` — never let a missing table crash the app shell.
 */
export async function getMyProfile(userId: string): Promise<ProfileResult> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, org_id")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    // "Table doesn't exist yet" can surface two ways: Postgres's own
    // undefined_table error (42P01), or PostgREST's schema-cache miss
    // (PGRST205) when a table was created via a direct DATABASE_URL
    // migration rather than the Supabase SQL Editor and the cache hasn't
    // reloaded. Both genuinely mean "not configured yet." Any other error
    // is a real problem — it must not be silently relabeled as "not
    // configured", which would hide the actual failure behind a
    // misleading "run the migrations" banner.
    if (error.code === "42P01" || error.code === "PGRST205") return { status: "not_configured" };
    throw error;
  }
  if (!data) return { status: "not_found" };
  return { status: "ok", profile: data as Profile };
}
