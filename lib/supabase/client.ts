import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Public (anon) Supabase client for reading products.
 *
 * Used by server components on the storefront. The anon key is safe to expose;
 * row level security on the `products` table only allows SELECT (see
 * supabase/schema.sql), all writes go through the service-role client.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * True once real credentials are in place. Lets the site build and render
 * (with empty product lists) before Supabase has been wired up.
 */
export function isSupabaseConfigured(): boolean {
  return url.startsWith("http") && anonKey.length > 20;
}

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    cached = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
