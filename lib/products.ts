import { getSupabase } from "./supabase/client";
import { getSupabaseAdmin, isAdminSupabaseConfigured } from "./supabase/admin";
import { buildSearchFilter, isLegacySchemaError } from "./product-rules";

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

/** Upper bound on the category lookup so a huge catalog can't blow up the page. */
const CATEGORY_SCAN_LIMIT = 2000;

export type ProductSort = "newest" | "price-asc" | "price-desc";

/**
 * Apply the shop's sort choice (Task 9). Newest = created_at desc; the price
 * sorts order by the listed `price` column. Shared by the storefront read and
 * the legacy fallback below.
 */
function applySort<T extends { order: (...args: any[]) => T }>(
  query: T,
  sort: ProductSort | null | undefined,
): T {
  if (sort === "price-asc") return query.order("price", { ascending: true });
  if (sort === "price-desc") return query.order("price", { ascending: false });
  return query.order("created_at", { ascending: false });
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
  /** Restrict to specific product IDs (wishlist/favorites view). */
  ids?: string[] | null;
  /** Shop sort order (Task 9). Defaults to newest first. */
  sort?: ProductSort | null;
}): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase.from("products").select(COLUMNS);

  if (options?.ids?.length) query = query.in("id", options.ids);
  if (options?.category) query = query.eq("category", options.category);
  if (options?.search) {
    const filter = buildSearchFilter(options.search, true);
    if (filter) query = query.or(filter);
  }
  query = applySort(query, options?.sort);
  if (options?.limit) query = query.limit(options.limit);

  let { data, error } = await query;
  if (isLegacySchemaError(error?.message)) {
    let legacyQuery = supabase.from("products").select(LEGACY_COLUMNS);
    // Every other filter must be re-applied too — dropping `ids` here used to
    // make the Favorites page show the newest products instead of the saved ones.
    if (options?.ids?.length) legacyQuery = legacyQuery.in("id", options.ids);
    if (options?.category) legacyQuery = legacyQuery.eq("category", options.category);
    if (options?.search) {
      const legacyFilter = buildSearchFilter(options.search, false);
      if (legacyFilter) legacyQuery = legacyQuery.or(legacyFilter);
    }
    legacyQuery = applySort(legacyQuery, options?.sort);
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
 * Falls back to the legacy predicate on a pre-`type` database so the header
 * count never reads "No pieces found" while the grid renders fine.
 */
export async function countProducts(options?: {
  category?: string | null;
  search?: string | null;
}): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  // Named const so the closure below keeps the non-null narrowing.
  const client = supabase;

  async function run(includeType: boolean) {
    let query = client
      .from("products")
      .select("id", { count: "exact", head: true });

    if (options?.category) query = query.eq("category", options.category);
    if (options?.search) {
      const filter = buildSearchFilter(options.search, includeType);
      if (filter) query = query.or(filter);
    }
    return query;
  }

  let { count, error } = await run(true);
  if (isLegacySchemaError(error?.message)) {
    ({ count, error } = await run(false));
  }
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
    .not("category", "is", null)
    .limit(CATEGORY_SCAN_LIMIT);

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

  if (isLegacySchemaError(error?.message)) {
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

  if (isLegacySchemaError(error?.message)) {
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

/**
 * One product, or null when it genuinely doesn't exist.
 *
 * A transient database failure throws ProductCatalogError instead of returning
 * null, so callers can tell "this product is gone" (404) apart from "Supabase
 * hiccuped" (retry / error state). Returning null for both is what used to
 * turn a 2-second outage into a 404 that also dropped the URL from Google.
 */
export async function getProduct(id: string): Promise<Product | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  let { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (isLegacySchemaError(error?.message)) {
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
    throw new ProductCatalogError();
  }
  return (data as Product) ?? null;
}
