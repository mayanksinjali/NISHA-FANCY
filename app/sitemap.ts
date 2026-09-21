import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

/**
 * Static pages + one URL per product.
 *
 * Cached for an hour: this used to run `revalidate = 0`, so EVERY crawl of
 * /sitemap.xml pulled up to 1000 rows out of Supabase. Admin mutations still
 * publish immediately because revalidateStorefront() in app/owner/actions.ts
 * purges this route by path.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  let catalogFailed = false;
  try {
    products = await getProducts({ limit: 1000 });
  } catch (error) {
    // A crawler should still get a valid sitemap of the static pages, but the
    // failure must be visible in the logs rather than silent — an empty
    // product section previously looked identical to "no products exist".
    catalogFailed = true;
    console.error("[sitemap] product lookup failed:", error);
  }

  // Newest product timestamp drives <lastmod> for the pages whose content is
  // the catalog itself, so Google sees real change dates instead of "now".
  const latestProductDate = products.reduce<Date | null>((latest, product) => {
    if (!product.created_at) return latest;
    const date = new Date(product.created_at);
    if (Number.isNaN(date.getTime())) return latest;
    return !latest || date > latest ? date : latest;
  }, null);
  const shopLastModified = latestProductDate ?? new Date();

  return [
    {
      url: SITE_URL,
      lastModified: shopLastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: shopLastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...(catalogFailed ? [] : products).map((product) => ({
      url: `${SITE_URL}/shop/${product.id}`,
      lastModified: product.created_at ? new Date(product.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
