import { STORE } from "@/lib/config";

/**
 * Storefront web app manifest, served as an explicit route at
 * /manifest.webmanifest.
 *
 * This is a route handler rather than app/(site)/manifest.ts because Next.js
 * 15 only picks up manifest.* convention files directly under app/ — nested
 * under a route group it silently registers nothing (verified: `next build`
 * lists robots.txt and sitemap.xml but no manifest route). A route handler
 * gives us a guaranteed, cacheable URL that app/(site)/layout.tsx references.
 *
 * Cached for an hour — content is static, and redeploys ship a new build.
 */
export const revalidate = 3600;

export function GET(): Response {
  return Response.json({
    name: `${STORE.name} — ${STORE.tagline}`,
    short_name: STORE.name,
    description: STORE.tagline,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0d0d0c",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
      { src: "/logo.jpeg", sizes: "1080x1080", type: "image/jpeg", purpose: "any" },
    ],
  });
}
