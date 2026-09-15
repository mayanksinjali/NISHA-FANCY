"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CART_STORAGE_KEY, type CartItem } from "@/lib/cart";

export default function CartBar() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const items = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as CartItem[];
      setCount(items.reduce((total, item) => total + item.quantity, 0));
    };
    update();
    window.addEventListener("cart-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("cart-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  if (!count) return null;

  return (
    <div className="fixed inset-x-3 bottom-[4.5rem] z-40 md:bottom-5 md:left-auto md:max-w-sm">
      <Link href="/cart" className="flex items-center justify-between gap-4 rounded-md bg-terracotta px-4 py-3 text-sm font-medium text-wine-deep shadow-lg">
        <span>{count} {count === 1 ? "item" : "items"} selected</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em]">View items →</span>
      </Link>
    </div>
  );
}