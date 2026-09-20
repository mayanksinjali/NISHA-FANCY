import type { Metadata } from "next";
import CategoryFilter from "@/components/category-filter";
import LoadMoreProducts from "@/components/load-more-products";
import ShopSearch from "@/components/shop-search";
import Breadcrumbs from "@/components/breadcrumbs";
import ShopSort from "@/components/shop-sort";
import { countProducts, getCategories, getProducts, type Product } from "@/lib/products";
import { ProductCatalogError } from "@/lib/products";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * ISR: listing pages refresh from Supabase every 5 minutes. Admin edits show
 * up right away anyway — every product mutation calls revalidateStorefront()
 * (see app/admin/actions.ts), which purges this cache on demand.
 */
export const revalidate = 300;

type Props = {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
};

/** Whitelist the sort query param; anything else falls back to newest. */
function normalizeSort(value: string | undefined): "newest" | "price-asc" | "price-desc" {
  return value === "price-asc" || value === "price-desc" ? value : "newest";
}

const CATEGORY_BLURBS: Record<string, string> = {
  Men: "Men's clothing in stock right now — browse the latest pieces, check the price, and order on WhatsApp.",
  Women: "Women's clothing in stock right now — browse the latest pieces, check the price, and order on WhatsApp.",
  Children: "Children's clothing in stock right now — browse the latest pieces, check the price, and order on WhatsApp.",
  Both: "Unisex pieces that work for anyone — see what's in stock and order on WhatsApp.",
};

/** Distinct title + description per category (and for a search) — no generic sitewide copy. */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category, q } = await searchParams;
  const active = category?.trim() || null;
  const search = q?.trim().slice(0, 80) || null;

  if (search) {
    return {
      title: `“${search}” — search results`,
      description: `Products matching “${search}” at Nisha Ghumti Fancy. Cash on delivery, order on WhatsApp.`,
    };
  }

  if (active) {
    return {
      title: `${active}'s collection`,
      description:
        CATEGORY_BLURBS[active] ??
        `Browse ${active} clothing at Nisha Ghumti Fancy. Cash on delivery, order on WhatsApp.`,
    };
  }

  return {
    title: "Shop",
    description:
      "Browse the full Nisha Ghumti Fancy collection — men's, women's, children's and unisex pieces. Order on WhatsApp, cash on delivery.",
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const { category, q, sort: sortParam } = await searchParams;
  const active = category?.trim() || null;
  const search = q?.trim().slice(0, 80) || null;
  const sort = normalizeSort(sortParam);

  // One round trip each; they don't depend on one another.
  let products: Product[] = [];
  let categories: string[] = [];
  let totalCount = 0;
  let catalogError = false;
  try {
    [products, categories, totalCount] = await Promise.all([
      getProducts({ category: active, search, sort, limit: 7 }),
      getCategories(),
      countProducts({ category: active, search }),
    ]);
  } catch (error) {
    if (!(error instanceof ProductCatalogError)) throw error;
    catalogError = true;
    products = [];
    totalCount = 0;
  }
  const initialProducts = products.slice(0, 6);
  const hasMore = products.length > initialProducts.length;

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-4 md:px-8 md:pt-6">
      <h1 className="sr-only">
        {active ? `${active}'s collection` : search ? `Search: ${search}` : "Shop"}
      </h1>
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: "Home", href: "/" },
          { label: active ? active : search ? `Search: ${search}` : "Shop" },
        ]}
      />

      <div>
        {/* Debounced live search (300ms, stale requests aborted) — falls back
            to a plain form submit before JS loads. */}
        <ShopSearch initialSearch={search ?? ""} category={active} sort={sort} />
      </div>

      <div className="mt-3">
        <CategoryFilter categories={categories} active={active} search={search} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow text-ink-soft">
          {catalogError
            ? "Catalog unavailable"
            : totalCount === 0
              ? "No pieces found"
              : `${totalCount} ${totalCount === 1 ? "piece" : "pieces"}${hasMore ? " — scroll for more" : ""}`}
        </p>
        <ShopSort value={sort} category={active} search={search} />
      </div>

      {!isSupabaseConfigured() && (
        <p className="mt-8 border border-terracotta/40 bg-terracotta/5 px-4 py-3 text-[13px] leading-relaxed text-terracotta-deep">
          Supabase isn't connected yet. Add{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to
          your environment variables to load real products.
        </p>
      )}

      <div className="mt-5 pb-8 md:mt-8">
        {catalogError ? (
          <div className="border border-terracotta/40 bg-terracotta/5 px-5 py-12 text-center">
            <p className="font-display text-2xl text-terracotta-deep">The catalog is temporarily unavailable.</p>
            <p className="mt-3 text-sm text-ink-soft">Please try again in a moment.</p>
          </div>
        ) : (
          <LoadMoreProducts
            key={sort}
            initialProducts={initialProducts}
            category={active}
            search={search}
            hasMore={hasMore}
            sort={sort}
          />
        )}
      </div>
    </div>
  );
}
