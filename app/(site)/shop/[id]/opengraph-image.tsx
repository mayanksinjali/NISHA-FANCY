import { ImageResponse } from "next/og";
import { getProduct } from "@/lib/products";
import { formatRs } from "@/lib/format";
import { STORE } from "@/lib/config";

export const alt = "Product share card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ id: string }> };

/**
 * Per-product branded share card (Task 5): product photo, name, price and the
 * store wordmark. Next wires this up as the og:image / twitter:image for the
 * product route, replacing the raw product photo.
 */
export default async function Image({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  const name = product?.name ?? STORE.name;
  const price = product ? formatRs(product.sale_price ?? product.price) : "";
  const photo = product?.image_url ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0d0d0c",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px",
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
            {STORE.name}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.1 }}>
              {name.length > 60 ? `${name.slice(0, 57)}…` : name}
            </div>
            <div style={{ fontSize: 44, fontWeight: 600, color: "#ff6548" }}>
              {price}
            </div>
          </div>
          <div style={{ fontSize: 26, color: "rgba(255,255,255,0.6)" }}>
            Order on WhatsApp · Cash on delivery
          </div>
        </div>

        <div
          style={{
            width: 520,
            height: "100%",
            display: "flex",
            background: "#f5f5f0",
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 160,
                color: "rgba(23,23,23,0.15)",
              }}
            >
              {name.slice(0, 1)}
            </div>
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
