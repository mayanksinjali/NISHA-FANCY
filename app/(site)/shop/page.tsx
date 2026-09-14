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
    <div className="mx-auto max-w-[1500px] px-5 pt-7 md:px-10 md:pt-12">
      <div>
        <form action="/shop" method="get" className="flex gap-2">
          {active && <input type="hidden" name="category" value={active} />}
          <label htmlFor="shop-search" className="sr-only">Search products</label>
          <input
            id="shop-search"
            name="q"
            type="search"
            defaultValue={search ?? ""}
            placeholder="Search products"
            className="min-w-0 flex-1 border border-line bg-transparent px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-soft focus:border-terracotta"
          />
          <button type="submit" className="btn btn-solid px-5 py-3">
            Search
          </button>
        </form>
      </div>

      <div className="mt-6">
        <CategoryFilter categories={categories} active={active} />
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

      <div className="mt-12 pb-8 md:mt-16">
        {catalogError ? (
          <div className="border border-terracotta/40 bg-terracotta/5 px-5 py-12 text-center">
            <p className="font-display text-2xl text-terracotta">The catalog is temporarily unavailable.</p>
            <p className="mt-3 text-sm text-ink-soft">Please try again in a moment.</p>
          </div>
        ) : (
          <LoadMoreProducts
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
