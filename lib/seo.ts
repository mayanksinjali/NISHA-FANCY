/**
 * Shared SEO helpers — one place that knows the canonical site URL and how to
 * describe a product for meta tags and structured data.
 */

/**
 * Canonical site origin. NEXT_PUBLIC_SITE_URL wins (set it in Vercel env),
 * then the Vercel deployment URL, then the historical fallback.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "https://nisha-fancy.netlify.app"
).replace(/\/+$/, "");

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
