import { STORE } from "@/lib/config";

/**
 * OWNER app web app manifest, served as an explicit route at
 * /owner/manifest.webmanifest.
 *
 * Separate from the storefront manifest (app/(site)/manifest.webmanifest) so
 * installing from the owner panel yields a distinct home-screen app: its own
 * name, start_url, scope and icon. This used to be app/owner/manifest.ts, but
 * Next.js 15 never registered that nested convention file as a route (the
 * build listed no /owner/manifest.webmanifest), so the browser always fell
 * back to the storefront manifest — installing "the store" instead of the
 * owner app. An explicit route handler cannot silently disappear.
 *
 * Middleware keeps this reachable while signed out: installability is checked
 * by the browser before the owner has logged in.
 */
export const revalidate = 3600;

export function GET(): Response {
  return Response.json({
    name: `${STORE.name} Owner`,
    short_name: "Owner",
    description: `Private owner area for ${STORE.name} — products, prices, stock.`,
    start_url: "/owner",
    scope: "/owner",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f9fafb",
    theme_color: "#0d0d0c",
    // Deliberately different icon from the storefront manifest (slate +
    // green mark vs. the store's black + coral) so the two installed apps
    // are distinguishable at a glance in the launcher.
    icons: [
      { src: "/icon-owner.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-owner.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  });
}
