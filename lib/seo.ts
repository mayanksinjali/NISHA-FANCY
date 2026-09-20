/**
 * Shared SEO helpers — one place that knows the canonical site URL and how to
 * describe a product for meta tags and structured data.
 */

/**
 * Canonical site origin — ONE hardcoded value, no env lookups, no fallbacks.
 *
 * It used to be computed from NEXT_PUBLIC_SITE_URL / VERCEL_URL with a stale
 * netlify.app fallback, which is how preview deployments (and one leftover
 * Netlify domain) leaked into canonicals, Open Graph and Twitter tags.
 * Every canonical, OG/Twitter URL, JSON-LD, sitemap.xml and robots.txt in the
 * app imports this constant — nothing else may derive a base URL.
 */
export const SITE_URL = "https://nisha-fancy.vercel.app";

/**
 * Short description used for meta tags and JSON-LD. Falls back to a
 * category + price sentence when the product has no description of its own.
 */
export function productDescription(
  description: string | null,
  name: string,
  category: string | null,
  price: number,
): string {
  const own = description?.trim();
  if (own) return own.length > 300 ? `${own.slice(0, 297).trimEnd()}…` : own;
  const base = category
    ? `${name} — ${category} at Nisha Ghumti Fancy.`
    : `${name} at Nisha Ghumti Fancy.`;
  return `${base} Rs. ${price.toLocaleString("en-US")}. Order on WhatsApp, cash on delivery.`;
}
