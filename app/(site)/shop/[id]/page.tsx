import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatRs } from "@/lib/format";
import { getProduct } from "@/lib/products";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import ProductGallery from "@/components/product-gallery";
import AddToCartButton from "@/components/add-to-cart-button";

export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product" };

  const description = product.description || `Shop ${product.name} from Nisha Ghumti Fancy.`;
  return {
    title: product.name,
    description,
    alternates: {
      canonical: `/shop/${product.id}`,
    },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: product.image_url ? [{ url: product.image_url, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.image_url ? [product.image_url] : undefined,
    },
  };
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
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: images,
    offers: {
      "@type": "Offer",
      priceCurrency: "NPR",
      price: product.price,
      availability: soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-5 md:px-10 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Link href="/shop" className="eyebrow link-rule text-ink-soft">
        ← Back to shop
      </Link>

      <div className="mt-4 grid gap-5 md:mt-8 md:grid-cols-12 md:gap-10">
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

        <div className="md:col-span-5 md:pt-1">
          {product.category && (
            <p className="eyebrow text-terracotta">{product.category}</p>
          )}

          <h1 className="mt-2 max-w-lg font-sans text-lg font-semibold leading-tight tracking-normal md:text-xl [text-wrap:balance]">
            {product.name}
            {(product.sizes?.length || product.colors?.length) && (
              <span className="ml-2 align-middle text-[10px] font-normal uppercase tracking-[0.08em] text-ink-soft">
                {product.sizes?.length ? `Size: ${product.sizes.join("/")}` : ""}
                {product.sizes?.length && product.colors?.length ? " · " : ""}
                {product.colors?.length ? `Color: ${product.colors.join("/")}` : ""}
              </span>
            )}
          </h1>

          <p className="mt-2 text-xl font-medium tabular-nums">
            {formatRs(product.price)}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.12em] text-ink-soft">
            {["COD available", "Fast reply", "Size help"].map((label) => (
              <span
                key={label}
                className="border border-line px-2 py-1 text-[10px]"
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
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <AddToCartButton product={product} />
              <a
                href={whatsappOrderUrl(product.name, product.price, product.category, images[0] ?? null)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-solid w-full"
              >
                Buy now
              </a>
            </div>
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