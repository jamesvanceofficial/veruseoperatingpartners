import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./env";

/** Per-request Supabase client for Server Components/Route Handlers — reads the caller's session from cookies. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component that can't set cookies — the
          // proxy (middleware) refreshes the session on the next request.
        }
      },
    },
  });
}
