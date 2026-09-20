import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** Allow everything except the owner panel. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/owner", "/owner/", "/admin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
