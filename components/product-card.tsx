import Image from "next/image";
import type { Product } from "@/lib/products";
import { formatRs, indexLabel } from "@/lib/format";
import Link from "next/link";
import AddToCartButton from "./add-to-cart-button";

type Props = {
  product: Product;
  /** Position in the grid — printed as a lookbook index (01, 02, …). */
  index?: number;
  /** First couple of cards on a page get priority loading. */
  priority?: boolean;
  sizes?: string;
};

/**
 * Lookbook tile: tall photograph, hairline rule, name + price on one baseline,
 * then the WhatsApp order button. No card border, no shadow, no rounding.
 */
export default function ProductCard({
  product,
  index = 0,
  priority = false,
  sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw",
}: Props) {
  const soldOut = !product.in_stock;

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/shop/${product.id}`}
        aria-label={`View ${product.name}`}
        className="relative block aspect-[3/4] overflow-hidden bg-surface"
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes={sizes}
            priority={priority}
            className={`object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.045] ${
              soldOut ? "opacity-70 saturate-[0.4]" : ""
            }`}
          />
        ) : (
          // Graceful placeholder for rows added without a photo yet.
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-5xl text-ink/15">
              {product.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
        )}

        <span className="eyebrow absolute top-3 left-3 text-paper mix-blend-difference">
          {indexLabel(index)}
        </span>

        {soldOut && (
          <span className="eyebrow absolute top-3 right-3 bg-wine-deep px-2.5 py-1.5 text-paper">
            Sold out
          </span>
        )}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3 border-t border-line pt-3">
        <h3 className="min-w-0 flex-1 pr-2">
          <Link
            href={`/shop/${product.id}`}
            className="block overflow-hidden text-[12px] leading-[1.15] tracking-[-0.02em] text-ink md:text-[13px] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] hover:text-terracotta"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {product.name}
          </Link>
        </h3>
        <p className="shrink-0 text-[12px] tabular-nums md:text-sm">
          {formatRs(product.price)}
        </p>
      </div>

      <p className="eyebrow mt-1.5 min-h-3 text-ink-soft">
        {product.category || "\u00a0"}
      </p>

      {product.description && (
        <p className="mt-2 line-clamp-1 text-[13px] leading-relaxed text-ink-soft md:line-clamp-2">
          {product.description}
        </p>
      )}

      {soldOut ? (
        <p className="eyebrow mt-auto border border-line px-4 py-3.5 pt-7 text-center text-ink-soft">
          Currently unavailable
        </p>
      ) : (
        <AddToCartButton product={product} className="mt-auto px-2 py-2.5 text-[9px] md:px-4 md:py-3 md:text-[10px]" />
      )}
    </article>
  );
}
