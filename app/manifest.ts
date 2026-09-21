import type { MetadataRoute } from "next";
import { STORE } from "@/lib/config";

/**
 * Basic PWA manifest (Task 8). Enables "Add to Home Screen" installability.
 *
 * Icon sizes are declared to match the FILES on disk — /logo.jpeg really is
 * 1080×1080, and the SVG is a full-bleed mark designed with enough margin to
 * survive Android's maskable safe zone. Declaring a 1080px file as 192/512
 * undersells it and trips Lighthouse's icon checks.
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
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
      { src: "/logo.jpeg", sizes: "1080x1080", type: "image/jpeg", purpose: "any" },
    ],
  };
}
