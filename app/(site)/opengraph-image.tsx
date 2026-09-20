import { ImageResponse } from "next/og";
import { STORE } from "@/lib/config";

export const alt = STORE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Branded fallback share card (Task 5) for non-product pages — home, shop,
 * contact — used as og:image / twitter:image wherever no per-product card
 * applies.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d0d0c",
          color: "#ffffff",
          padding: "72px",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#ff6548",
          }}
        >
          {STORE.tagline}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1 }}>
            {STORE.name}
          </div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.65)" }}>
            Order on WhatsApp · Cash on delivery
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
