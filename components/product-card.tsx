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
  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/shop/${product.id}`}
        aria-label={`View ${product.name}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-bone"
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
          <div className="flex h-full w-full items-center justify-center text-ink-soft">
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
        {product.sale_price && !soldOut && (
          <span className="absolute top-3 right-3 rounded-full bg-terracotta px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-white shadow-md">
            Sale · {discountPercent}% off
          </span>
        )}
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 pr-2">
          <Link
            href={`/shop/${product.id}`}
            className="block overflow-hidden text-[13px] font-medium leading-[1.2] text-ink md:text-sm [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] hover:text-terracotta"
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
        <p className="shrink-0 text-sm font-medium tabular-nums">
          {product.sale_price ? (
            <><span className="text-terracotta">{formatRs(product.sale_price)}</span> <span className="text-xs text-ink-soft line-through">{formatRs(product.price)}</span></>
          ) : formatRs(product.price)}
        </p>
      </div>

      <p className="mt-1.5 flex min-h-5 items-center text-[10px] font-medium uppercase tracking-[0.12em] text-ink-soft">
        {product.category ? (
          <span>{product.category}</span>
        ) : (
          "\u00a0"
        )}
      </p>

      {soldOut ? (
        <p className="mt-auto rounded-full border border-line px-4 py-3 text-center text-xs text-ink-soft">
          Currently unavailable
        </p>
      ) : (
        <AddToCartButton product={product} className="mt-auto" />
      )}
    </article>
  );
}
