import { getSupabase } from "./supabase/client";
import { getSupabaseAdmin, isAdminSupabaseConfigured } from "./supabase/admin";

/**
 * One row of the `products` table as the STOREFRONT sees it.
 * `type` (the internal search tag) is deliberately absent — it must never
 * reach the client. Admin code reads `AdminProduct` instead.
 */
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

/**
 * Same row as the ADMIN panel sees it, including the internal `type` search
 * tag. Never send this shape to a customer-facing client.
 */
export type AdminProduct = Product & {
  type: string | null;
};

export class ProductCatalogError extends Error {
  constructor() {
    super("Product catalog unavailable");
    this.name = "ProductCatalogError";
  }
}

/**
 * Storefront columns — no `type`. The internal search tag exists only so
 * search can match it inside Postgres; it never crosses the network boundary
 * to a customer.
 */
const COLUMNS =
  "id,name,price,sale_price,category,sizes,colors,description,image_url,image_urls,in_stock,created_at";
/** Admin columns — include the `type` search tag for the product form/list. */
const ADMIN_COLUMNS = `${COLUMNS},type`;
const LEGACY_COLUMNS =
  "id,name,price,category,description,image_url,in_stock,created_at";

/**
 * Search terms match name, the internal `type` tag, and description in one
 * Postgres `or()`. When the legacy fallback (pre-`type` schema) trips, the
 * same predicate without `type` is used instead.
 */
function searchFilter(search: string, includeType: boolean): string | null {
  const term = search.trim().slice(0, 80).replace(/[%_]/g, " ");
  if (!term) return null;
  const pattern = `%${term}%`;
  return includeType
    ? `name.ilike.${pattern},type.ilike.${pattern},description.ilike.${pattern}`
    : `name.ilike.${pattern},description.ilike.${pattern}`;
}

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
    const filter = searchFilter(options.search, true);
    if (filter) query = query.or(filter);
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
      const legacyFilter = searchFilter(options.search, false);
      if (legacyFilter) legacyQuery = legacyQuery.or(legacyFilter);
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

/**
 * Total matching products for the shop header count — same filters as
 * getProducts (category + search), but no limit/fetch, server-side count.
 */
export async function countProducts(options?: {
  category?: string | null;
  search?: string | null;
}): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  let query = supabase
    .from("products")
    .select("id", { count: "exact", head: true });

  if (options?.category) query = query.eq("category", options.category);
  if (options?.search) {
    const filter = searchFilter(options.search, true);
    if (filter) query = query.or(filter);
  }

  const { count, error } = await query;
  if (error) {
    console.error("[products] countProducts failed:", error.message);
    return 0;
  }
  return count ?? 0;
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

export async function getAllProductsForAdmin(): Promise<AdminProduct[]> {
  if (!isAdminSupabaseConfigured()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .select(ADMIN_COLUMNS)
    .order("created_at", { ascending: false });

  if (error?.message.includes("sale_price") || error?.message.includes("sizes") || error?.message.includes("type")) {
    const legacyResult = await getSupabaseAdmin()
      .from("products")
      .select(LEGACY_COLUMNS)
      .order("created_at", { ascending: false });
    if (legacyResult.error) throw new Error(legacyResult.error.message);
    return (legacyResult.data ?? []) as AdminProduct[];
  }
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminProduct[];
}

export async function getProductForAdmin(id: string): Promise<AdminProduct | null> {
  if (!isAdminSupabaseConfigured()) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .select(ADMIN_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error?.message.includes("sale_price") || error?.message.includes("sizes") || error?.message.includes("type")) {
    const legacyResult = await getSupabaseAdmin()
      .from("products")
      .select(LEGACY_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    if (legacyResult.error) throw new Error(legacyResult.error.message);
    return (legacyResult.data as AdminProduct) ?? null;
  }
  if (error) throw new Error(error.message);
  return (data as AdminProduct) ?? null;
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
