"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import AddToCartButton from "./add-to-cart-button";
import type { Product } from "@/lib/products";
import { formatRs } from "@/lib/format";

type Props = {
  product: Product;
  /** Prebuilt WhatsApp order link, so the bar's "Buy now" matches the page CTA. */
  whatsappUrl: string;
  /** id of the in-page CTA block to observe. */
  targetId: string;
};

/**
 * Mobile-only sticky purchase bar (Task 1). It watches the main Add to Cart /
 * Buy Now block and slides up from the bottom (sitting just above the mobile
 * nav) once that block leaves the viewport, then slides away when it returns.
 */
export default function StickyAddToCart({
  product,
  whatsappUrl,
  targetId,
}: Props) {
  const [visible, setVisible] = useState(false);
  const soldOut = !product.in_stock;

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-120px 0px 0px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  if (soldOut) return null;

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-[calc(3.5rem_+_env(safe-area-inset-bottom))] z-40 border-t border-line bg-paper/95 px-3 py-2.5 shadow-[0_-6px_18px_rgba(23,23,23,0.08)] backdrop-blur transition-transform duration-300 ease-out motion-reduce:transition-none md:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-[150%]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-bone">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="48px"
              loading="lazy"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center font-display text-lg text-ink/20">
              {product.name.slice(0, 1)}
            </span>
          )}
        </div>

        <p className="min-w-0 flex-1 truncate text-[13px] font-medium leading-tight">
          {product.name}
          <span className="mt-0.5 block text-[13px] font-semibold tabular-nums text-ink">
            {formatRs(product.sale_price ?? product.price)}
          </span>
        </p>

        <AddToCartButton product={product} className="w-auto shrink-0" />
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-solid shrink-0 px-4 py-2.5 text-[11px]"
        >
          Buy now
        </a>
      </div>
    </div>
  );
}
