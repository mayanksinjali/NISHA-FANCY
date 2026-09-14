import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatRs } from "@/lib/format";
import { getProduct } from "@/lib/products";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import ProductGallery from "@/components/product-gallery";

export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const images = [
    ...(product.image_url ? [product.image_url] : []),
    ...(product.image_urls ?? []),
  ].filter((url, index, all) => all.indexOf(url) === index).slice(0, 4);
  const soldOut = !product.in_stock;

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-10 md:py-14">
      <Link href="/shop" className="eyebrow link-rule text-ink-soft">
        ← Back to shop
      </Link>

      <div className="mt-8 grid gap-8 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <div className="relative">
            <span
              className={`absolute top-3 right-3 z-10 rounded-full px-2 py-1 text-[9px] font-medium uppercase tracking-[0.14em] ${
                soldOut ? "bg-terracotta text-paper" : "bg-black/60 text-paper"
              }`}
            >
              {soldOut ? "Sold out" : "In stock"}
            </span>
            <ProductGallery productName={product.name} images={images} />
          </div>
        </div>

        <div className="md:col-span-5 md:pt-2">
          <p className="eyebrow text-terracotta">
            {product.category ?? "Nisha Ghumti Fancy"}
          </p>

          <h1 className="mt-3 max-w-lg font-display text-[clamp(1.5rem,2.6vw,2.4rem)] leading-[0.96] tracking-[-0.04em] [text-wrap:balance]">
            {product.name}
          </h1>

          <p className="mt-4 text-2xl font-medium tabular-nums">
            {formatRs(product.price)}
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-ink-soft">
            {["COD available", "Fast reply", "Size help"].map((label) => (
              <span
                key={label}
                className="border border-line px-2 py-1.5 text-[10px]"
              >
                {label}
              </span>
            ))}
          </div>

          {soldOut ? (
            <p className="eyebrow mt-6 border border-line px-4 py-4 text-center text-ink-soft">
              This piece is currently unavailable.
            </p>
          ) : (
            <a
              href={whatsappOrderUrl(
                product.name,
                product.price,
                product.category,
                images[0] ?? null,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-solid mt-6 w-full"
            >
              Order this piece on WhatsApp
            </a>
          )}

          <p className="mt-3 text-xs leading-relaxed text-ink-soft">
            Need help with size or availability? Message us before ordering.
          </p>

          {product.description && (
            <div className="mt-6 rounded-none border border-line bg-bone/30 p-4">
              <p className="eyebrow text-ink-soft">Details</p>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}