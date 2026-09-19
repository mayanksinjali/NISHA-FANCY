"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import ProductGrid from "./product-grid";
import { SHOP_RESULTS_EVENT, type ShopResultsDetail } from "./shop-search";

type Props = {
  initialProducts: Product[];
  category: string | null;
  search: string | null;
  hasMore: boolean;
};

/**
 * Product grid + "Load more" button. Also listens for debounced-search
 * results (ShopSearch) and swaps the grid live without a page reload.
 */
export default function LoadMoreProducts({
  initialProducts,
  category,
  search,
  hasMore: initialHasMore,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialRef = useRef({ category, search });

  // Debounced search results arrive via this event (see ShopSearch).
  useEffect(() => {
    function handleResults(event: Event) {
      const detail = (event as CustomEvent<ShopResultsDetail>).detail;
      setProducts(detail.products);
      setHasMore(detail.hasMore);
      setError(null);
    }
    window.addEventListener(SHOP_RESULTS_EVENT, handleResults);
    return () => window.removeEventListener(SHOP_RESULTS_EVENT, handleResults);
  }, []);

  async function loadMore() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        offset: String(products.length),
        limit: "6",
      });
      if (initialRef.current.category) params.set("category", initialRef.current.category);
      if (initialRef.current.search) params.set("q", initialRef.current.search);
      const response = await fetch(`/api/products?${params}`, { cache: "no-store" });
      const result = (await response.json()) as {
        products?: Product[];
        hasMore?: boolean;
        error?: string;
      };
      if (!response.ok || !result.products) {
        throw new Error(result.error ?? "Could not load more products.");
      }
      setProducts((current) => [...current, ...result.products!]);
      setHasMore(Boolean(result.hasMore));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load more products.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ProductGrid products={products} emptyMessage="No pieces match your search yet." />
      {error && <p className="mt-6 text-center text-sm text-terracotta">{error}</p>}
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button type="button" onClick={loadMore} disabled={loading} className="btn btn-outline min-w-40">
            {loading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
