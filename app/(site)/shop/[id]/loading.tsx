/**
 * Product detail skeleton. Mirrors the real layout — gallery column on the
 * left, rounded buy box on the right — so the page keeps its shape while the
 * product loads.
 */
export default function ProductLoading() {
  return (
    <div
      className="mx-auto max-w-[1280px] px-4 py-5 md:px-8 md:py-10"
      aria-busy="true"
    >
      <span className="sr-only">Loading product…</span>

      <div className="h-9 w-32 animate-pulse rounded-full bg-bone" />

      <div className="mt-5 grid gap-8 md:mt-8 md:grid-cols-12 md:gap-12">
        {/* Gallery */}
        <div className="md:col-span-7">
          <div className="aspect-[4/3] w-full animate-pulse rounded-3xl bg-bone md:aspect-[4/5]" />
        </div>

        {/* Buy box */}
        <div className="rounded-3xl bg-bone p-5 md:col-span-5 md:p-8">
          <div className="h-3 w-20 animate-pulse rounded bg-ink/10" />
          <div className="mt-3 h-6 w-3/4 animate-pulse rounded bg-ink/10" />
          <div className="mt-4 h-7 w-28 animate-pulse rounded bg-ink/10" />
          <div className="mt-6 flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-7 w-24 animate-pulse rounded-full bg-ink/10" />
            ))}
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <div className="h-12 animate-pulse rounded-full bg-ink/10" />
            <div className="h-12 animate-pulse rounded-full bg-ink/10" />
          </div>
          <div className="mt-6 h-24 animate-pulse rounded bg-ink/10" />
        </div>
      </div>
    </div>
  );
}
