import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Lazy Supabase singleton.
 * Reads the free-tier credentials from .env.local — never hard-code keys here.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and add your free Supabase URL + anon key."
    );
  }
  client = createClient(url, anon);
  return client;
}

/** True when Supabase env vars are present (used to gracefully disable cloud features). */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
