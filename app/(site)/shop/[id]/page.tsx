import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatRs } from "@/lib/format";
import { ProductCatalogError, getProduct, getProducts } from "@/lib/products";
import { productImages } from "@/lib/product-rules";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import ProductGallery from "@/components/product-gallery";
import AddToCartButton from "@/components/add-to-cart-button";
import FavoriteButton from "@/components/favorite-button";
import ShareButton from "@/components/share-button";
import Breadcrumbs from "@/components/breadcrumbs";
import StickyAddToCart from "@/components/sticky-add-to-cart";
import ProductCard from "@/components/product-card";
import { productDescription, SITE_URL } from "@/lib/seo";
import { STORE } from "@/lib/config";

/**
 * ISR: product pages refresh from Supabase every 5 minutes. Admin edits show
 * up immediately regardless — revalidateStorefront() (app/owner/actions.ts)
 * purges this cache on every product mutation.
 */
export const revalidate = 300;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  let product = null;
  try {
    product = await getProduct(id);
  } catch (error) {
    // A database blip must not turn metadata generation into a 500. The page
    // itself re-reads and surfaces the failure properly.
    if (!(error instanceof ProductCatalogError)) throw error;
  }
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
      // og:image comes from opengraph-image.tsx (a branded share card).
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} · ${STORE.name}`,
      description,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  // getProduct throws ProductCatalogError when Supabase is unreachable, which
  // lands on app/(site)/error.tsx as a retryable error instead of a 404. Only
  // a genuinely absent row reaches notFound().
  const product = await getProduct(id);
  if (!product) notFound();

  // Other pieces from the same category, shown below the buy box. A failure
  // here is cosmetic, so it never takes the product page down with it.
  let related: Awaited<ReturnType<typeof getProducts>> = [];
  if (product.category) {
    try {
      related = (await getProducts({ category: product.category, limit: 5 }))
        .filter((entry) => entry.id !== product.id)
        .slice(0, 4);
    } catch (error) {
      if (!(error instanceof ProductCatalogError)) throw error;
    }
  }

  const images = productImages(product);
  const soldOut = !product.in_stock;
  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;
  const effectivePrice = product.sale_price ?? product.price;
  const orderUrl = whatsappOrderUrl(
    product.name,
    effectivePrice,
    product.category,
    images[0] ?? null,
  );
  const crumbs = [
    { label: "Home", href: "/" },
    ...(product.category
      ? [{ label: product.category, href: `/shop?category=${encodeURIComponent(product.category)}` }]
      : []),
    { label: product.name },
  ];
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
      // Mirrors the "COD available" promise shown on the page — Google needs
      // it here to mark the offer up as a real, buyable listing.
      seller: { "@type": "Organization", name: STORE.name },
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
      <Breadcrumbs items={crumbs} />
      <Link href="/shop" className="btn btn-outline mt-4 inline-flex px-4 py-2.5 text-[11px]">
        ← Back to shop
      </Link>

      <div className="mt-5 grid gap-8 md:mt-8 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-7">
          <div className="relative">
            <span
              className={`absolute top-3 right-3 z-10 rounded-full px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] ${
                soldOut ? "bg-terracotta text-paper" : "bg-black/60 text-paper"
              }`}
            >
              {soldOut ? "Sold out" : "In stock"}
            </span>
            {Boolean(product.sale_price) && !soldOut && (
              <span className="absolute top-3 left-3 z-10 rounded-full bg-terracotta px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white shadow-md">
                Sale · {discountPercent}% off
              </span>
            )}
            <ProductGallery productName={product.name} images={images} />
          </div>
        </div>

        <div className="rounded-3xl bg-bone p-5 md:col-span-5 md:p-8">
          {product.category && (
            <p className="eyebrow text-terracotta-deep">{product.category}</p>
          )}

          <h1 className="mt-2 max-w-lg font-sans text-lg font-semibold leading-tight tracking-normal md:text-xl [text-wrap:balance]">
            {product.name}
            {/* Explicit > 0 checks: `a?.length || b?.length` evaluates to the
                number 0 when both lists are empty, and React renders that 0
                as literal text right after the title ("Plaid0"). */}
            {((product.sizes?.length ?? 0) > 0 || (product.colors?.length ?? 0) > 0) && (
              <span className="ml-2 align-middle text-[11px] font-normal uppercase tracking-[0.08em] text-ink-soft">
                {product.sizes?.length ? `Size: ${product.sizes.join("/")}` : ""}
                {product.sizes?.length && product.colors?.length ? " · " : ""}
                {product.colors?.length ? `Color: ${product.colors.join("/")}` : ""}
              </span>
            )}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <p className="text-2xl font-semibold tabular-nums">
              {product.sale_price ? (
                <><span className="text-terracotta-deep">{formatRs(product.sale_price)}</span> <span className="text-base text-ink-soft line-through">{formatRs(product.price)}</span></>
              ) : formatRs(product.price)}
            </p>
            <FavoriteButton productId={product.id} productName={product.name} size="lg" />
            <ShareButton name={product.name} />
          </div>

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
            <div id="product-primary-cta" className="mt-5 grid gap-2 sm:grid-cols-2">
              <AddToCartButton product={product} inline />
              <a
                href={orderUrl}
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

      <StickyAddToCart
        product={product}
        whatsappUrl={orderUrl}
        targetId="product-primary-cta"
      />
    </div>
  );
}
