"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_STORAGE_KEY, cartMessage, type CartItem } from "@/lib/cart";
import { STORE } from "@/lib/config";
import { formatRs } from "@/lib/format";

function whatsappCartUrl(items: CartItem[]): string {
  return `https://wa.me/${STORE.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(cartMessage(items))}`;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  /* Cart lines whose photo failed to load — they show a letter tile instead. */
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]"));
  }, []);

  function save(next: CartItem[]) {
    setItems(next);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("cart-updated"));
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  /** Same product + same chosen variant = same cart line. */
  function sameLine(a: CartItem, b: CartItem): boolean {
    return a.id === b.id && a.selectedSize === b.selectedSize && a.selectedColor === b.selectedColor;
  }

  function changeQuantity(target: CartItem, delta: number) {
    save(
      items
        .map((entry) =>
          sameLine(entry, target)
            ? { ...entry, quantity: Math.max(0, entry.quantity + delta) }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-7 md:px-8 md:py-12">
      <Link href="/shop" className="btn btn-outline px-4 py-2.5 text-[11px]">← Add more items</Link>
      <h1 className="mt-7 font-display text-4xl tracking-[-0.03em] md:text-5xl">Your items</h1>
      {!items.length ? (
        <div className="border-t border-line py-14 text-center">
          <p className="text-ink-soft">No items selected yet.</p>
          <Link href="/shop" className="btn btn-outline mt-6">See products</Link>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {items.map((item) => (
              <div key={`${item.id}-${item.selectedSize ?? ""}-${item.selectedColor ?? ""}`} className="overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
                <Link href={`/shop/${item.id}`} aria-label={`View ${item.name}`} className="block">
                  <div className="relative aspect-[4/3] bg-bone">
                    {item.imageUrl && !failedImages.has(item.id) ? (
                      // Cart items render below the fold — lazy load them.
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(min-width: 768px) 260px, 45vw"
                        loading="lazy"
                        onError={() => setFailedImages((current) => new Set(current).add(item.id))}
                        className="object-contain"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center font-display text-4xl text-ink/20">{item.name.slice(0, 1)}</span>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="mt-1 text-xs text-ink-soft">{formatRs(item.price)}{item.quantity > 1 ? ` × ${item.quantity}` : ""}</p>
                  {(item.selectedSize || item.selectedColor) && (
                    <p className="mt-1 truncate text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                      {[item.selectedSize && `Size: ${item.selectedSize}`, item.selectedColor && `Color: ${item.selectedColor}`].filter(Boolean).join(" · ")}
                    </p>
                  )}

                  {/* Quantity stepper + remove — compact so both fit on a narrow card */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex shrink-0 items-center rounded-lg border border-line">
                      <button
                        type="button"
                        aria-label={`Remove one ${item.name}`}
                        onClick={() => changeQuantity(item, -1)}
                        className="flex h-7 w-7 items-center justify-center text-sm font-semibold text-ink transition-colors hover:bg-bone"
                      >
                        −
                      </button>
                      <span className="min-w-4 px-0.5 text-center text-xs font-medium tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Add one more ${item.name}`}
                        onClick={() => changeQuantity(item, 1)}
                        className="flex h-7 w-7 items-center justify-center text-sm font-semibold text-ink transition-colors hover:bg-bone"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove ${item.name} from cart`}
                      onClick={() => changeQuantity(item, -item.quantity)}
                      className="shrink-0 whitespace-nowrap rounded bg-red-600 px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between text-lg font-medium">
            <span>Total</span><span>{formatRs(total)}</span>
          </div>
          <a href={whatsappCartUrl(items)} target="_blank" rel="noopener noreferrer" className="btn btn-solid mt-6 w-full">Send order on WhatsApp</a>
        </>
      )}
    </div>
  );
}
