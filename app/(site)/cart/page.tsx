"use client";

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

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]"));
  }, []);

  function save(next: CartItem[]) {
    setItems(next);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("cart-updated"));
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 md:px-10 md:py-14">
      <Link href="/shop" className="eyebrow link-rule text-ink-soft">← Add more items</Link>
      <h1 className="mt-6 font-display text-4xl uppercase">Your items</h1>
      {!items.length ? (
        <div className="border-t border-line py-14 text-center">
          <p className="text-ink-soft">No items selected yet.</p>
          <Link href="/shop" className="btn btn-outline mt-6">See products</Link>
        </div>
      ) : (
        <>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-sm text-ink-soft">{formatRs(item.price)} · {item.quantity} item</p>
                </div>
                <button type="button" onClick={() => save(items.filter((entry) => entry.id !== item.id))} className="text-xs text-terracotta underline">Remove</button>
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