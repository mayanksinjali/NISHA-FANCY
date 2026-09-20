"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductGrid from "./product-grid";
import type { Product } from "@/lib/products";
import { FAVORITES_EVENT, readFavoriteIds } from "@/lib/favorites";

/**
 * Favorites listing (Task 2). Reads the stored IDs, fetches just those products
 * from /api/products, and renders them with the existing ProductGrid/ProductCard
 * so the look is identical to the shop.
 */
export default function FavoritesView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "empty">("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const ids = readFavoriteIds();
      if (!ids.length) {
        if (!cancelled) {
          setProducts([]);
          setStatus("empty");
        }
        return;
      }
      try {
        const response = await fetch(`/api/products?ids=${ids.join(",")}`, {
          cache: "no-store",
        });
        const result = (await response.json()) as { products?: Product[] };
        if (cancelled) return;
        const list = result.products ?? [];
        setProducts(list);
        setStatus(list.length ? "ready" : "empty");
      } catch {
        if (!cancelled) setStatus("empty");
      }
    }

    load();
    const sync = () => load();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      cancelled = true;
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col">
            <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-bone" />
            <div className="mt-3 h-3.5 w-3/4 animate-pulse rounded bg-bone" />
          </div>
        ))}
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="border-t border-line py-16 text-center">
        <p className="font-display text-2xl italic text-ink-soft">
          No favorites yet.
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          Tap the heart on any piece to save it here.
        </p>
        <Link href="/shop" className="btn btn-outline mt-6">
          Browse the shop
        </Link>
      </div>
    );
  }

  return <ProductGrid products={products} />;
}
