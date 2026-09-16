import { getSupabase } from "./supabase/client";
import { getSupabaseAdmin, isAdminSupabaseConfigured } from "./supabase/admin";

/** One row of the `products` table. */
export type Product = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  category: string | null;
  sizes: string[] | null;
  colors: string[] | null;
  description: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  in_stock: boolean;
  created_at: string | null;
};

export class ProductCatalogError extends Error {
  constructor() {
    super("Product catalog unavailable");
    this.name = "ProductCatalogError";
  }
}

const COLUMNS =
  "id,name,price,sale_price,category,sizes,colors,description,image_url,image_urls,in_stock,created_at";
const LEGACY_COLUMNS =
  "id,name,price,category,description,image_url,in_stock,created_at";

/**
 * Storefront product list. Newest first.
 * Returns [] (instead of throwing) if Supabase isn't configured yet, so the
 * design is still viewable on a fresh clone.
 */
export async function getProducts(options?: {
  limit?: number;
  category?: string | null;
  search?: string | null;
}): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("products")
    .select(COLUMNS)
    .order("created_at", { ascending: false });

  if (options?.category) query = query.eq("category", options.category);
  if (options?.search) {
    const search = options.search.trim().slice(0, 80).replace(/[%_]/g, " ");
    if (search) query = query.ilike("name", `%${search}%`);
  }
  if (options?.limit) query = query.limit(options.limit);

  let { data, error } = await query;
  if (error?.message.includes("sale_price") || error?.message.includes("image_urls") || error?.message.includes("sizes")) {
    let legacyQuery = supabase
      .from("products")
      .select(LEGACY_COLUMNS)
      .order("created_at", { ascending: false });
    if (options?.category) legacyQuery = legacyQuery.eq("category", options.category);
    if (options?.search) {
      const search = options.search.trim().slice(0, 80).replace(/[%_]/g, " ");
      if (search) legacyQuery = legacyQuery.ilike("name", `%${search}%`);
    }
    if (options?.limit) legacyQuery = legacyQuery.limit(options.limit);
    const legacyResult = await legacyQuery;
    data = legacyResult.data as typeof data;
    error = legacyResult.error;
  }
  if (error) {
    console.error("[products] getProducts failed:", error.message);
    throw new ProductCatalogError();
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

  if (error?.message.includes("sale_price") || error?.message.includes("sizes")) {
    const legacyResult = await getSupabaseAdmin()
      .from("products")
      .select(LEGACY_COLUMNS)
      .order("created_at", { ascending: false });
    if (legacyResult.error) throw new Error(legacyResult.error.message);
    return (legacyResult.data ?? []) as Product[];
  }
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

  if (error?.message.includes("sale_price") || error?.message.includes("sizes")) {
    const legacyResult = await getSupabaseAdmin()
      .from("products")
      .select(LEGACY_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (legacyResult.error) throw new Error(legacyResult.error.message);
    return (legacyResult.data as Product) ?? null;
  }
  if (error) throw new Error(error.message);
  return (data as Product) ?? null;
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  let { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error?.message.includes("sale_price") || error?.message.includes("image_urls") || error?.message.includes("sizes")) {
    const legacyResult = await supabase
      .from("products")
      .select(LEGACY_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    data = legacyResult.data as typeof data;
    error = legacyResult.error;
  }

  if (error) {
    console.error("[products] getProduct failed:", error.message);
    return null;
  }
  return (data as Product) ?? null;
}
