import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

/**
 * Static pages + one URL per product. The catalog is read at request time on
 * Vercel, so Google always sees the current collection.
 */
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: Awaited<ReturnType<typeof getProducts>> = [];
  try {
    products = await getProducts({ limit: 1000 });
  } catch {
    products = [];
  }

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...products.map((product) => ({
      url: `${SITE_URL}/shop/${product.id}`,
      lastModified: product.created_at ? new Date(product.created_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
