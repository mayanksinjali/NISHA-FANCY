"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import ProductGrid from "./product-grid";

type Props = {
  initialProducts: Product[];
  category: string | null;
  hasMore: boolean;
};

export default function LoadMoreProducts({
  initialProducts,
  category,
  hasMore: initialHasMore,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        offset: String(products.length),
        limit: "6",
      });
      if (category) params.set("category", category);
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
      <ProductGrid products={products} emptyMessage="No pieces on the rail yet." />
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