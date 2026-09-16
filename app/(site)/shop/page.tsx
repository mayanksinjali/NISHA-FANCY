import type { Metadata } from "next";
import CategoryFilter from "@/components/category-filter";
import LoadMoreProducts from "@/components/load-more-products";
import { getCategories, getProducts, type Product } from "@/lib/products";
import { ProductCatalogError } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the full collection.",
};

/** Always fresh — admin edits appear on the next page load. */
export const revalidate = 0;

type Props = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export default async function ShopPage({ searchParams }: Props) {
  const { category, q } = await searchParams;
  const active = category?.trim() || null;
  const search = q?.trim().slice(0, 80) || null;

  // One round trip each; they don't depend on one another.
  let products: Product[] = [];
  let categories: string[] = [];
  let catalogError = false;
  try {
    [products, categories] = await Promise.all([
      getProducts({ category: active, search, limit: 7 }),
      getCategories(),
    ]);
  } catch (error) {
    if (!(error instanceof ProductCatalogError)) throw error;
    catalogError = true;
    products = [];
  }
  const initialProducts = products.slice(0, 6);
  const hasMore = products.length > initialProducts.length;

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-6 md:px-8 md:pt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-terracotta">Nisha Fancy</p>
          <h1 className="mt-2 font-display text-4xl tracking-[-0.04em] md:text-6xl">Shop</h1>
        </div>
        <p className="hidden text-sm text-ink-soft sm:block">Browse the full collection</p>
      </div>
      <div className="mt-6">
        <form
          action="/shop"
          method="get"
          className="flex w-full max-w-2xl items-center rounded-full border border-line bg-bone p-1.5 focus-within:border-ink focus-within:outline-none"
        >
          {active && <input type="hidden" name="category" value={active} />}
          <label htmlFor="shop-search" className="sr-only">Search products</label>
          <input
            id="shop-search"
            name="q"
            type="search"
            defaultValue={search ?? ""}
            placeholder="Search products..."
            className="shop-search-input min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-ink outline-none ring-0 placeholder:text-ink-soft focus:outline-none focus:ring-0 focus-visible:outline-none"
          />
          <button
            type="submit"
            aria-label="Search products"
            title="Search products"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-terracotta"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 5 5" />
            </svg>
          </button>
        </form>
      </div>

      <div className="mt-5">
        <CategoryFilter categories={categories} active={active} search={search} />
      </div>

      <p className="mt-5 eyebrow text-ink-soft">
        {catalogError ? "Catalog unavailable" : `${initialProducts.length}${hasMore ? "+" : ""} pieces`}
      </p>

      {!isSupabaseConfigured() && (
        <p className="mt-8 border border-terracotta/40 bg-terracotta/5 px-4 py-3 text-[13px] leading-relaxed text-terracotta-deep">
          Supabase isn't connected yet. Add{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
          your environment variables to load real products.
        </p>
      )}

      <div className="mt-8 pb-8 md:mt-12">
        {catalogError ? (
          <div className="border border-terracotta/40 bg-terracotta/5 px-5 py-12 text-center">
            <p className="font-display text-2xl text-terracotta">The catalog is temporarily unavailable.</p>
            <p className="mt-3 text-sm text-ink-soft">Please try again in a moment.</p>
          </div>
        ) : (
          <LoadMoreProducts
            key={`${active ?? "all"}:${search ?? ""}`}
            initialProducts={initialProducts}
            category={active}
            search={search}
            hasMore={hasMore}
          />
        )}
      </div>
    </div>
  );
}
