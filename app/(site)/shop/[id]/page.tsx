import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatRs } from "@/lib/format";
import { getProduct } from "@/lib/products";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import ProductGallery from "@/components/product-gallery";
import AddToCartButton from "@/components/add-to-cart-button";
import ProductCard from "@/components/product-card";
import { getProducts } from "@/lib/products";
import { productDescription, SITE_URL } from "@/lib/seo";
import { STORE } from "@/lib/config";

export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product" };

  const effectivePrice = product.sale_price ?? product.price;
  const description = productDescription(
    product.description,
    product.name,
    product.category,
    effectivePrice,
  );
  return {
    // Title template in the root layout appends " · Store name".
    title: product.name,
    description,
    alternates: {
      canonical: `/shop/${product.id}`,
    },
    openGraph: {
      title: `${product.name} · ${STORE.name}`,
      description,
      type: "website",
      url: `/shop/${product.id}`,
      images: product.image_url ? [{ url: product.image_url, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} · ${STORE.name}`,
      description,
      images: product.image_url ? [product.image_url] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  // Other pieces from the same category, shown below the buy box.
  const related = product.category
    ? (await getProducts({ category: product.category, limit: 5 }))
        .filter((entry) => entry.id !== product.id)
        .slice(0, 4)
    : [];

  const images = [
    ...(product.image_url ? [product.image_url] : []),
    ...(product.image_urls ?? []),
  ].filter((url, index, all) => all.indexOf(url) === index).slice(0, 4);
  const soldOut = !product.in_stock;
  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;
  const effectivePrice = product.sale_price ?? product.price;
  const metaDescription = productDescription(
    product.description,
    product.name,
    product.category,
    effectivePrice,
  );
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: metaDescription,
    image: images,
    sku: product.id,
    category: product.category ?? undefined,
    brand: { "@type": "Brand", name: STORE.name },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/shop/${product.id}`,
      priceCurrency: "NPR",
      price: effectivePrice.toFixed(2),
      itemCondition: "https://schema.org/NewCondition",
      availability: soldOut
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-5 md:px-8 md:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Link href="/shop" className="btn btn-outline inline-flex px-4 py-2.5 text-[10px]">
        ← Back to shop
      </Link>

      <div className="mt-5 grid gap-8 md:mt-8 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <div className="relative">
            <span
              className={`absolute top-3 right-3 z-10 rounded-full px-2 py-1 text-[9px] font-medium uppercase tracking-[0.14em] ${
                soldOut ? "bg-terracotta text-paper" : "bg-black/60 text-paper"
              }`}
            >
              {soldOut ? "Sold out" : "In stock"}
            </span>
            {product.sale_price && !soldOut && (
              <span className="absolute top-3 left-3 z-10 rounded-full bg-terracotta px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-white shadow-md">
                Sale · {discountPercent}% off
              </span>
            )}
            <ProductGallery productName={product.name} images={images} />
          </div>
        </div>

        <div className="rounded-3xl bg-bone p-5 md:col-span-5 md:p-8">
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

          <p className="mt-3 text-2xl font-semibold tabular-nums">
            {product.sale_price ? (
              <><span className="text-terracotta">{formatRs(product.sale_price)}</span> <span className="text-base text-ink-soft line-through">{formatRs(product.price)}</span></>
            ) : formatRs(product.price)}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {["COD available", "Fast reply", "Size help"].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[11px] font-medium text-green-700"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3" aria-hidden>
                  <path d="m5 13 4 4L19 7" />
                </svg>
                {label}
              </span>
            ))}
          </div>

          {soldOut ? (
            <p className="eyebrow mt-6 border border-line px-4 py-4 text-center text-ink-soft">
              This piece is currently unavailable.
            </p>
          ) : (
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <AddToCartButton product={product} inline />
              <a
                href={whatsappOrderUrl(product.name, product.sale_price ?? product.price, product.category, images[0] ?? null)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-solid w-full self-start"
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

      {related.length > 0 && (
        <section className="mt-12 border-t border-line pt-8 md:mt-16">
          <h2 className="font-display text-2xl tracking-[-0.02em] md:text-3xl">You may also like</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {related.map((entry) => (
              <ProductCard key={entry.id} product={entry} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}