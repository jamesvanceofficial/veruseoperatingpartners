// NEXT_PUBLIC_* vars must be read as a static `process.env.X` member
// expression — Next.js inlines them into the browser bundle at build time
// by static analysis, and cannot do that for a dynamic process.env[name]
// lookup. A dynamic lookup here silently resolves to undefined in the
// browser (this broke login on a prior build — never repeat it).
export function supabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  return value;
}

export function supabasePublishableKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!value) throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  return value;
}

// Server-only — never imported from a "use client" file.
export function supabaseSecretKey(): string {
  const value = process.env.SUPABASE_SECRET_KEY;
  if (!value) throw new Error("Missing required environment variable: SUPABASE_SECRET_KEY");
  return value;
}
