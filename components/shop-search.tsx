"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatRs } from "@/lib/format";
import type { Product, ProductSort } from "@/lib/products";

type Props = {
  /** Search term the page was rendered with (server-fetched results below). */
  initialSearch: string;
  category: string | null;
  /** Active shop sort, preserved across live searches (Task 9). */
  sort?: ProductSort;
};

export const SHOP_RESULTS_EVENT = "shop-results";

/** Fired after a debounced search resolves. LoadMoreProducts listens for it. */
export type ShopResultsDetail = {
  search: string;
  products: import("@/lib/products").Product[];
  hasMore: boolean;
};

const DEBOUNCE_MS = 300;
const MAX_SUGGESTIONS = 5;

/**
 * Debounced shop search: waits 300ms after the last keystroke, then fetches
 * /api/products. Any in-flight request is aborted when a newer one starts, so
 * a slow older response can never overwrite fresher results. The same response
 * also feeds an instant suggestions dropdown (Task 6) — clicking a result
 * navigates straight to that product; the shop grid still updates as before.
 */
export default function ShopSearch({ initialSearch, category, sort = "newest" }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialSearch);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  // Close the dropdown when clicking anywhere outside the search box.
  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const term = event.target.value;
    setValue(term);

    if (!term.trim()) {
      setSuggestions([]);
      setOpen(false);
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    if (term.trim() === initialSearch.trim()) return; // unchanged — server data already shown

    timerRef.current = setTimeout(async () => {
      // A newer request wins: cancel the previous in-flight one.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const params = new URLSearchParams({ q: term.trim().slice(0, 80), limit: "6" });
      if (category) params.set("category", category);
      if (sort !== "newest") params.set("sort", sort);
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
        // Feed the instant dropdown from the same response.
        if (term.trim()) {
          setSuggestions(result.products.slice(0, MAX_SUGGESTIONS));
          setOpen(true);
        }
        // Keep the URL shareable without a full server round trip.
        const url = new URL("/shop", window.location.origin);
        if (term.trim()) url.searchParams.set("q", term.trim());
        if (category) url.searchParams.set("category", category);
        if (sort !== "newest") url.searchParams.set("sort", sort);
        router.replace(url.toString(), { scroll: false });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          // Leave the current results up; the next keystroke retries.
        }
      }
    }, DEBOUNCE_MS);
  }

  function goToProduct(id: string) {
    setOpen(false);
    router.push(`/shop/${id}`);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form
        action="/shop"
        method="get"
        className="flex w-full items-center rounded-full border border-line bg-bone p-1.5 focus-within:border-ink focus-within:outline-none"
        onSubmit={(event) => {
          // Full submit only makes sense before JS loads; afterwards the
          // debounce already fetched results.
          if (timerRef.current !== null) event.preventDefault();
        }}
      >
        {category && <input type="hidden" name="category" value={category} />}
        {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
        <label htmlFor="shop-search" className="sr-only">Search products</label>
        <input
          id="shop-search"
          name="q"
          type="search"
          value={value}
          onChange={handleChange}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          autoComplete="off"
          aria-expanded={open}
          aria-controls="shop-search-suggestions"
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

      {/* Instant suggestions — thumbnail + name + price (Task 6) */}
      {open && suggestions.length > 0 && (
        <ul
          id="shop-search-suggestions"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-paper shadow-xl"
        >
          {suggestions.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => goToProduct(product.id)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-bone"
              >
                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-bone">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center font-display text-lg text-ink/20">
                      {product.name.slice(0, 1)}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-ink">{product.name}</span>
                <span className="shrink-0 text-sm font-medium tabular-nums text-ink-soft">
                  {formatRs(product.sale_price ?? product.price)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
