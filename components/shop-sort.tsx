"use client";

import { useRouter } from "next/navigation";
import type { ProductSort } from "@/lib/products";

export const SORT_OPTIONS: { label: string; value: ProductSort }[] = [
  { label: "Newest", value: "newest" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
];

type Props = {
  value: ProductSort;
  category: string | null;
  search: string | null;
};

/**
 * Shop sort control (Task 9). Writes the choice to the `sort` query param (via
 * router.replace, no scroll jump) so a sorted view is shareable/bookmarkable.
 */
export default function ShopSort({ value, category, search }: Props) {
  const router = useRouter();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as ProductSort;
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("q", search);
    if (next !== "newest") params.set("sort", next);
    router.replace(params.toString() ? `/shop?${params.toString()}` : "/shop", {
      scroll: false,
    });
  }

  return (
    <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-ink-soft">
      <span className="whitespace-nowrap">Sort</span>
      <select
        value={value}
        onChange={handleChange}
        aria-label="Sort products"
        className="rounded-full border border-line bg-paper px-3 py-1.5 text-[11px] font-medium normal-case tracking-normal text-ink outline-none focus:border-ink"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
