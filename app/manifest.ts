import type { MetadataRoute } from "next";
import { STORE } from "@/lib/config";

/**
 * Basic PWA manifest (Task 8). Enables "Add to Home Screen" installability.
 * Icons reuse the square 1080×1080 brand logo (served at 192/512 declarations)
 * plus an SVG maskable mark for platforms that support it.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
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
      { src: "/logo.jpeg", sizes: "192x192", type: "image/jpeg", purpose: "any" },
      { src: "/logo.jpeg", sizes: "512x512", type: "image/jpeg", purpose: "maskable" },
    ],
  };
}
