/**
 * Gray placeholder matching ProductCard's real layout, so the shop grid and
 * product rails hold their shape while data loads (no layout shift / blank
 * flash). Purely decorative — hidden from assistive tech.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col" aria-hidden>
      <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-bone" />
      <div className="mt-3 h-3.5 w-4/5 animate-pulse rounded bg-bone" />
      <div className="mt-2 h-3.5 w-1/3 animate-pulse rounded bg-bone" />
      <div className="mt-3 h-9 w-full animate-pulse rounded-full bg-bone" />
    </div>
  );
}
