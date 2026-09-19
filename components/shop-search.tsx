"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  /** Search term the page was rendered with (server-fetched results below). */
  initialSearch: string;
  category: string | null;
};

export const SHOP_RESULTS_EVENT = "shop-results";

/** Fired after a debounced search resolves. LoadMoreProducts listens for it. */
export type ShopResultsDetail = {
  search: string;
  products: import("@/lib/products").Product[];
  hasMore: boolean;
};

const DEBOUNCE_MS = 300;

/**
 * Debounced shop search: waits 300ms after the last keystroke, then fetches
 * /api/products. Any in-flight request is aborted when a newer one starts, so
 * a slow older response can never overwrite fresher results.
 */
export default function ShopSearch({ initialSearch, category }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialSearch);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const term = event.target.value;
    setValue(term);

    if (timerRef.current) clearTimeout(timerRef.current);
    if (term.trim() === initialSearch.trim()) return; // unchanged — server data already shown

    timerRef.current = setTimeout(async () => {
      // A newer request wins: cancel the previous in-flight one.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const params = new URLSearchParams({ q: term.trim().slice(0, 80), limit: "6" });
      if (category) params.set("category", category);
      try {
        const response = await fetch(`/api/products?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as {
          products?: ShopResultsDetail["products"];
          hasMore?: boolean;
        };
        if (!response.ok || !result.products) return;
        window.dispatchEvent(
          new CustomEvent<ShopResultsDetail>(SHOP_RESULTS_EVENT, {
            detail: { search: term.trim(), products: result.products, hasMore: Boolean(result.hasMore) },
          }),
        );
        // Keep the URL shareable without a full server round trip.
        const url = new URL("/shop", window.location.origin);
        if (term.trim()) url.searchParams.set("q", term.trim());
        if (category) url.searchParams.set("category", category);
        router.replace(url.toString(), { scroll: false });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          // Leave the current results up; the next keystroke retries.
        }
      }
    }, DEBOUNCE_MS);
  }

  return (
    <form
      action="/shop"
      method="get"
      className="flex w-full max-w-2xl items-center rounded-full border border-line bg-bone p-1.5 focus-within:border-ink focus-within:outline-none"
      onSubmit={(event) => {
        // Full submit only makes sense before JS loads; afterwards the
        // debounce already fetched results.
        if (timerRef.current !== null) event.preventDefault();
      }}
    >
      {category && <input type="hidden" name="category" value={category} />}
      <label htmlFor="shop-search" className="sr-only">Search products</label>
      <input
        id="shop-search"
        name="q"
        type="search"
        value={value}
        onChange={handleChange}
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
  );
}
