import type { Product } from "@/lib/products";
import ProductCard from "./product-card";

type Props = {
  products: Product[];
  /**
   * "lookbook" staggers every third tile downwards for an asymmetric,
   * magazine-spread rhythm. "grid" is the flat 2/3/4-column shop layout.
   */
  variant?: "lookbook" | "grid";
  emptyMessage?: string;
};

export default function ProductGrid({
  products,
  variant = "grid",
  emptyMessage = "No pieces here yet — check back shortly.",
}: Props) {
  if (products.length === 0) {
    return (
      <div className="border-t border-line py-20 text-center">
        <p className="font-display text-2xl text-ink-soft italic">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const columns =
    variant === "lookbook"
      ? "grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-8 md:gap-y-16"
      : "grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 md:gap-y-14 xl:grid-cols-4";

  return (
    <div className={columns}>
      {products.map((product, i) => (
        <div
          key={product.id}
          className={
            variant === "lookbook" && i % 3 === 1 ? "md:mt-16" : undefined
          }
        >
          <ProductCard product={product} priority={i < 2} />
        </div>
      ))}
    </div>
  );
}
