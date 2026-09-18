"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { formatRs } from "@/lib/format";
import type { Product } from "@/lib/products";
import { deleteProductAction, quickUpdateProductAction, toggleStockAction } from "./actions";

/* Category → solid square color. Unmapped categories pick from the palette by hash. */
const CATEGORY_COLORS: Record<string, string> = {
  Men: "bg-blue-600",
  Women: "bg-pink-500",
  Both: "bg-teal-600",
  Children: "bg-purple-500",
};
const FALLBACK_COLORS = ["bg-rose-500", "bg-sky-600", "bg-amber-500", "bg-indigo-500", "bg-emerald-600", "bg-fuchsia-500"];

function categoryColor(category: string | null): string {
  if (!category) return "bg-gray-300";
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) | 0;
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

function quickId(product: Product, index: number): string {
  return `P${String(index + 1).padStart(3, "0")}`;
}

type Props = {
  products: Product[];
  categories: string[];
};

/**
 * Interactive inventory: search + category chips filter the list, and each row
 * expands into a drawer with quick price editing, visibility toggle and remove.
 */
export default function InventoryList({ products, categories }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      if (category && product.category !== category) return false;
      if (!needle) return true;
      return (
        product.name.toLowerCase().includes(needle) ||
        (product.category ?? "").toLowerCase().includes(needle)
      );
    });
  }, [products, query, category]);

  return (
    <div>
      {/* ---------- Search ---------- */}
      <div className="admin-card flex items-center gap-3 px-4 py-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 text-gray-400" aria-hidden>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
        <label htmlFor="admin-search" className="sr-only">Search products</label>
        <input
          id="admin-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search items by name or category..."
          className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {/* ---------- Quick category chips ---------- */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none]">
        <button type="button" onClick={() => setCategory(null)} className={`admin-chip shrink-0 ${category === null ? "bg-blue-600 text-white" : "text-gray-600"}`}>
          All
        </button>
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setCategory(category === item ? null : item)}
            className={`admin-chip shrink-0 ${category === item ? "bg-blue-600 text-white" : "text-gray-600"}`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* ---------- Inventory list ---------- */}
      <ul className="mt-4 space-y-3 pb-28">
        {visible.map((product, index) => {
          const open = openId === product.id;
          const soldOut = !product.in_stock;
          const onSale = Boolean(product.sale_price);

          return (
            <li key={product.id} className="admin-card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenId(open ? null : product.id)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-3.5 py-3.5 text-left"
              >
                {product.image_url ? (
                  <Image src={product.image_url} alt="" width={44} height={44} sizes="44px" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-semibold text-white ${categoryColor(product.category)}`}>
                    {(product.category ?? product.name).slice(0, 1).toUpperCase()}
                  </span>
                )}

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] tracking-wide text-gray-400">{quickId(product, index)}</span>
                    {product.category && <span className="truncate text-[11px] text-gray-500">{product.category}</span>}
                    {soldOut && (
                      <span className="ml-auto shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-600">
                        Hidden
                      </span>
                    )}
                    {!soldOut && onSale && (
                      <span className="ml-auto shrink-0 rounded-full bg-terracotta/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-terracotta">
                        Sale
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-medium text-ink">{product.name}</span>
                  <span className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium tabular-nums text-ink">{formatRs(product.sale_price ?? product.price)}</span>
                    {onSale && <span className="line-through">{formatRs(product.price)}</span>}
                    <span>· {soldOut ? "Not available" : "Available"}</span>
                  </span>
                </span>

                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {/* ---------- Expanded drawer ---------- */}
              {open && (
                <div className="border-t border-gray-100 px-3.5 pb-4 pt-4">
                  <QuickPrice id={product.id} price={product.sale_price ?? product.price} />

                  {/* Visibility */}
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <span className="text-xs font-medium text-gray-500">Visibility status</span>
                    <VisibilityToggle id={product.id} inStock={product.in_stock} />
                  </div>

                  {/* Meta + actions */}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="flex-1 rounded-xl border border-gray-200 py-2.5 text-center text-xs font-semibold text-ink transition-colors hover:border-ink"
                    >
                      Full edit
                    </Link>
                    <DeleteButton id={product.id} name={product.name} />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {visible.length === 0 && (
        <p className="py-12 text-center text-sm text-gray-400">
          {products.length ? "Nothing matches this filter." : "No products yet. Tap “Add product” to put the first piece on the rail."}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quick price editor                                                  */
/* ------------------------------------------------------------------ */

function QuickPrice({ id, price }: { id: string; price: number }) {
  const [value, setValue] = useState(String(price));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const dirty = Number(value) !== price && value.trim() !== "";

  function save() {
    if (!dirty || pending) return;
    startTransition(async () => {
      await quickUpdateProductAction(id, Number(value));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1500);
    });
  }

  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`price-${id}`} className="text-xs font-medium text-gray-500">
          Price (Rs.)
        </label>
        <div className="flex items-center gap-2">
          {saved && <span className="text-[10px] font-semibold uppercase tracking-wide text-green-600">Saved ✓</span>}
          <input
            id={`price-${id}`}
            type="number"
            inputMode="numeric"
            min="0"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="h-9 w-24 rounded-lg border border-gray-200 bg-white px-2.5 text-right text-sm tabular-nums outline-none focus:border-terracotta"
          />
          <button
            type="button"
            onClick={save}
            disabled={!dirty || pending}
            className="h-9 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
          >
            {pending ? "…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Visibility toggle (Active / Hidden) — one-tap form-post server action */
/* ------------------------------------------------------------------ */

function VisibilityToggle({ id, inStock }: { id: string; inStock: boolean }) {
  const [pending, startTransition] = useTransition();

  function flip() {
    if (pending) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      formData.set("in_stock", String(!inStock));
      await toggleStockAction(formData);
    });
  }

  return (
    <button
      type="button"
      onClick={flip}
      disabled={pending}
      className={`rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
        inStock ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-600 hover:bg-red-200"
      }`}
    >
      {inStock ? "Active status" : "Hidden"}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Remove product                                                      */
/* ------------------------------------------------------------------ */

function DeleteButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  function remove() {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      await deleteProductAction(formData);
    });
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={pending}
      className="flex-1 rounded-xl bg-red-50 py-2.5 text-center text-xs font-semibold text-red-500 transition-colors hover:bg-red-100 disabled:opacity-50"
    >
      {pending ? "Removing…" : "Remove product"}
    </button>
  );
}
