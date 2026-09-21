import type { MetadataRoute } from "next";
import { STORE } from "@/lib/config";

/**
 * PWA manifest for the OWNER app only, served at /owner/manifest.webmanifest
 * and referenced exclusively by app/owner/layout.tsx metadata. Scoped to
 * /owner so an installed owner app opens straight into the owner area and can
 * never be mistaken for (or serve) the customer storefront.
 *
 * The customer site keeps the site-wide manifest from app/manifest.ts —
 * nothing about the storefront changes.
 */
export default function ownerManifest(): MetadataRoute.Manifest {
  return {
    name: `${STORE.name} Owner`,
    short_name: "Owner",
    description: `Private owner area for ${STORE.name} — products, prices, stock.`,
    start_url: "/owner",
    scope: "/owner",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f9fafb",
    theme_color: "#0d0d0c",
    // Same assets as the storefront manifest — the owner app is told apart by
    // its name and scope, not by its icon. Sizes match the real files.
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
      { src: "/logo.jpeg", sizes: "1080x1080", type: "image/jpeg", purpose: "any" },
    ],
  };
}
