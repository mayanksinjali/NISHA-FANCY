import Image from "next/image";
import type { Product } from "@/lib/products";
import { formatRs, indexLabel } from "@/lib/format";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import Link from "next/link";

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
    <article className="group flex flex-col">
      <Link
        href={`/shop/${product.id}`}
        aria-label={`View ${product.name}`}
        className="relative block aspect-[3/4] overflow-hidden bg-[#e5decf]"
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
          <span className="eyebrow absolute top-3 right-3 bg-ink px-2.5 py-1.5 text-paper">
            Sold out
          </span>
        )}
      </Link>

      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-3">
        <h3 className="font-display text-[17px] leading-snug md:text-lg">
          <Link href={`/shop/${product.id}`} className="hover:text-terracotta">
            {product.name}
          </Link>
        </h3>
        <p className="shrink-0 text-sm tabular-nums">{formatRs(product.price)}</p>
      </div>

      {product.category && (
        <p className="eyebrow mt-1.5 text-ink-soft">{product.category}</p>
      )}

      {product.description && (
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">
          {product.description}
        </p>
      )}

      {soldOut ? (
        <p className="eyebrow mt-4 border border-line px-4 py-3.5 text-center text-ink-soft">
          Currently unavailable
        </p>
      ) : (
        <a
          href={whatsappOrderUrl(
            product.name,
            product.price,
            product.category,
            product.image_url,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline mt-4 w-full"
        >
          Order on WhatsApp
        </a>
      )}
    </article>
  );
}
