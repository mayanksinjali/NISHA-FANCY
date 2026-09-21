/**
 * Pure product rules shared by the storefront, the admin panel and the API.
 *
 * Deliberately dependency-free: nothing here touches Supabase, React or
 * `next/headers`, so it can be reasoned about — and unit tested — on its own.
 * The database reads live in lib/products.ts and import from here.
 */

/** How many photos one product may carry. Upload validation and galleries share this. */
export const MAX_PRODUCT_IMAGES = 4;

/** Column added by a later revision of schema.sql — safe to omit when absent. */
const OPTIONAL_COLUMNS = ["type", "sale_price", "image_urls", "sizes", "colors"] as const;

/**
 * Did this PostgREST error come from the table predating one of the newer
 * columns (i.e. supabase/schema.sql's migration hasn't been run)? Every read
 * and write funnels through here instead of string-matching individual column
 * names in five places.
 */
export function isLegacySchemaError(message: string | null | undefined): boolean {
  if (!message) return false;
  const text = message.toLowerCase();
  if (!text.includes("column") && !text.includes("schema cache")) return false;
  return OPTIONAL_COLUMNS.some((column) => text.includes(column));
}

/**
 * Characters that would change the meaning of a PostgREST `or()` filter if a
 * customer typed them into the search box: `,` separates conditions and `()`
 * nest them, while `%` and `_` are `ilike` wildcards. Blanking them (rather
 * than rejecting the search) means a query like "shirt, red" still finds
 * "shirt" instead of taking the whole shop page down with a bad request.
 */
const RESERVED_FILTER_CHARS = /[%_*(),\\"]/g;

/** Trim, cap and neutralise a raw search term. Returns null when nothing is left. */
export function sanitizeSearchTerm(search: string): string | null {
  const term = search
    .trim()
    .slice(0, 80)
    .replace(RESERVED_FILTER_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim();
  return term || null;
}

/**
 * The PostgREST `or()` predicate for a search: name, the internal `type` tag
 * and description in one filter. Returns null when the term sanitises away.
 * `includeType` is false for the pre-`type` legacy fallback query.
 */
export function buildSearchFilter(search: string, includeType: boolean): string | null {
  const term = sanitizeSearchTerm(search);
  if (!term) return null;
  const pattern = `%${term}%`;
  return includeType
    ? `name.ilike.${pattern},type.ilike.${pattern},description.ilike.${pattern}`
    : `name.ilike.${pattern},description.ilike.${pattern}`;
}

/**
 * The ordered, de-duplicated photo list for a product: the cover photo first,
 * then the gallery, capped at MAX_PRODUCT_IMAGES. Used by the product page,
 * the gallery, the admin form and the cart so the order can never drift.
 */
export function productImages(product: {
  image_url: string | null;
  image_urls: string[] | null;
}): string[] {
  return [
    ...(product.image_url ? [product.image_url] : []),
    ...(product.image_urls ?? []),
  ]
    .filter((url, index, all) => all.indexOf(url) === index)
    .slice(0, MAX_PRODUCT_IMAGES);
}

/**
 * Parse the JSON array of photo URLs submitted by the admin form.
 *
 * Anything malformed (an old cached form, a hand-crafted request) degrades to
 * an empty list instead of throwing an unhandled 500 out of JSON.parse.
 */
export function parseSubmittedImageUrls(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((url): url is string => typeof url === "string" && url.length > 0)
      .filter((url, index, all) => all.indexOf(url) === index)
      .slice(0, MAX_PRODUCT_IMAGES);
  } catch {
    console.warn("[admin] ignoring malformed existing_image_urls payload");
    return [];
  }
}

/**
 * Rebuild a write payload without the columns the database just said it
 * doesn't have, so an un-migrated table still accepts the save. Keeps working
 * if a project is several migrations behind rather than only one.
 */
export function stripUnsupportedColumns<T extends Record<string, unknown>>(
  payload: T,
  message: string,
): Partial<T> {
  const text = message.toLowerCase();
  const copy: Record<string, unknown> = { ...payload };
  for (const column of OPTIONAL_COLUMNS) {
    if (text.includes(column)) delete copy[column];
  }
  return copy as Partial<T>;
}
