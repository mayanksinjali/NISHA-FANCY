import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — FULL database access, bypasses row level
 * security. Only ever import this from server code (server actions / server
 * components). Never from a "use client" file.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const PRODUCT_IMAGE_BUCKET = "product-images";

export function isAdminSupabaseConfigured(): boolean {
  return url.startsWith("http") && serviceKey.length > 20;
}

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  // Belt-and-braces guard: if this ever gets bundled into the browser, fail loudly.
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseAdmin() must only be called on the server.");
  }
  if (!isAdminSupabaseConfigured()) {
    throw new Error(
      "Supabase admin credentials missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  if (!cached) {
    cached = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
