import type { Metadata } from "next";
import CategoryFilter from "@/components/category-filter";
import ProductGrid from "@/components/product-grid";
import { getCategories, getProducts } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the full collection.",
};

/** Always fresh — admin edits appear on the next page load. */
export const revalidate = 0;

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ShopPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const active = category?.trim() || null;

  // One round trip each; they don't depend on one another.
  const [products, categories] = await Promise.all([
    getProducts({ category: active }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-[1500px] px-5 pt-12 md:px-10 md:pt-20">
      {/* Page head */}
      <header className="border-b border-ink pb-8">
        <p className="eyebrow text-terracotta">The collection</p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h1 className="font-display text-[clamp(2.5rem,9vw,6.5rem)] leading-[0.88] uppercase">
            {active ?? "Shop all"}
          </h1>
          <p className="eyebrow text-ink-soft md:pb-3">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
          </p>
        </div>
      </header>

      <div className="mt-8">
        <CategoryFilter categories={categories} active={active} />
      </div>

      {!isSupabaseConfigured() && (
        <p className="mt-8 border border-terracotta/40 bg-terracotta/5 px-4 py-3 text-[13px] leading-relaxed text-terracotta-deep">
          Supabase isn't connected yet. Add{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
          your environment variables to load real products.
        </p>
      )}

      <div className="mt-12 pb-8 md:mt-16">
        <ProductGrid
          products={products}
          emptyMessage={
            active
              ? `Nothing in ${active} right now.`
              : "No pieces on the rail yet."
          }
        />
      </div>
    </div>
  );
}
