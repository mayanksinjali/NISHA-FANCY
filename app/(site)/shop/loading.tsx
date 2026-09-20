import ProductCardSkeleton from "@/components/product-card-skeleton";

/**
 * Shop / category listing skeleton. Mirrors the real page's search bar, filter
 * chips, count line and 2/3/4-column grid so nothing jumps when products land.
 */
export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-4 md:px-8 md:pt-6" aria-busy="true">
      <span className="sr-only">Loading products…</span>

      {/* Search bar */}
      <div className="h-14 w-full max-w-2xl animate-pulse rounded-full bg-bone" />

      {/* Category chips */}
      <div className="mt-3 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-bone" />
        ))}
      </div>

      {/* Count line */}
      <div className="mt-4 h-3 w-40 animate-pulse rounded bg-bone" />

      {/* Grid */}
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-12 pb-8 md:mt-8 md:grid-cols-3 md:gap-x-6 md:gap-y-14 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
