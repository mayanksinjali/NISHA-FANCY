"use client";

import Link from "next/link";
import Image from "next/image";
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
          <div className="mt-8 grid grid-cols-2 gap-3">
            {items.map((item) => (
              <div key={item.id} className="overflow-hidden border border-line bg-bone/20">
                <div className="relative aspect-[4/3] bg-bone">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill sizes="(min-width: 768px) 260px, 45vw" className="object-contain" />
                  ) : (
                    <span className="flex h-full items-center justify-center font-display text-4xl text-ink/20">{item.name.slice(0, 1)}</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="mt-1 text-xs text-ink-soft">{formatRs(item.price)} · {item.quantity}x</p>
                  <button type="button" onClick={() => save(items.filter((entry) => entry.id !== item.id))} className="mt-3 text-[10px] font-medium uppercase tracking-[0.12em] text-terracotta underline">Remove</button>
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