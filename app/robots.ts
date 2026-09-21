import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Allow everything except the owner panel, the JSON endpoints it calls, and
 * the two pages that render nothing without a customer's own localStorage
 * (a crawler always sees an empty cart).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/owner", "/owner/", "/admin", "/api/", "/cart"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
