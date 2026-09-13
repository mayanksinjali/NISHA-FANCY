import { getSupabase } from "./supabase/client";
import { getSupabaseAdmin, isAdminSupabaseConfigured } from "./supabase/admin";

/** One row of the `products` table. */
export type Product = {
  id: string;
  name: string;
  price: number;
  category: string | null;
  description: string | null;
  image_url: string | null;
  in_stock: boolean;
  created_at: string | null;
};

const COLUMNS = "id,name,price,category,description,image_url,in_stock,created_at";

/**
 * Storefront product list. Newest first.
 * Returns [] (instead of throwing) if Supabase isn't configured yet, so the
 * design is still viewable on a fresh clone.
 */
export async function getProducts(options?: {
  limit?: number;
  category?: string | null;
}): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("products")
    .select(COLUMNS)
    .order("created_at", { ascending: false });

  if (options?.category) query = query.eq("category", options.category);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) {
    console.error("[products] getProducts failed:", error.message);
    return [];
  }
  return (data ?? []) as Product[];
}

/** Distinct category values currently in use, for the shop filter. */
export async function getCategories(): Promise<string[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select("category")
    .not("category", "is", null);

  if (error) {
    console.error("[products] getCategories failed:", error.message);
    return [];
  }

  const unique = new Set(
    (data ?? [])
      .map((row) => (row as { category: string | null }).category?.trim())
      .filter((c): c is string => Boolean(c)),
  );
  return [...unique].sort((a, b) => a.localeCompare(b));
}

/* ------------------------------------------------------------------ */
/* Admin reads (service role — sees everything, used by /admin only)   */
/* ------------------------------------------------------------------ */

export async function getAllProductsForAdmin(): Promise<Product[]> {
  if (!isAdminSupabaseConfigured()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .select(COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function getProductForAdmin(id: string): Promise<Product | null> {
  if (!isAdminSupabaseConfigured()) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Product) ?? null;
}
