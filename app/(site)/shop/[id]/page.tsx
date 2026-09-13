import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatRs } from "@/lib/format";
import { getProduct } from "@/lib/products";
import { whatsappOrderUrl } from "@/lib/whatsapp";

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
  ].filter((url, index, all) => all.indexOf(url) === index);
  const soldOut = !product.in_stock;

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-10 md:py-14">
      <Link href="/shop" className="eyebrow link-rule text-ink-soft">
        ← Back to shop
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-14">
        <div className="md:col-span-7">
          <div className="grid gap-3 sm:grid-cols-2">
            {images.length ? (
              images.map((image, index) => (
                <div
                  key={image}
                  className={`relative aspect-[3/4] overflow-hidden bg-bone ${
                    index === 0 && images.length > 1 ? "sm:col-span-2" : ""
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 768px) 58vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center bg-bone sm:col-span-2">
                <span className="font-display text-7xl text-ink/15">
                  {product.name.slice(0, 1).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-5 md:pt-5">
          <p className="eyebrow text-terracotta">
            {product.category ?? "Nisha Ghumti Fancy"}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9]">
            {product.name}
          </h1>
          <p className="mt-5 text-lg tabular-nums">{formatRs(product.price)}</p>

          <div className="mt-7 border-y border-line py-6">
            <p className={`eyebrow ${soldOut ? "text-terracotta" : "text-ink-soft"}`}>
              {soldOut ? "Currently unavailable" : "In stock"}
            </p>
            {product.description && (
              <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
                {product.description}
              </p>
            )}
          </div>

          {soldOut ? (
            <p className="eyebrow mt-7 border border-line px-4 py-4 text-center text-ink-soft">
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
              className="btn btn-solid mt-7 w-full"
            >
              Order this piece on WhatsApp
            </a>
          )}

          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            Cash on delivery in the Butwal Metropolitan Area. We will confirm
            size, availability, and delivery details in WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}