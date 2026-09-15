"use client";

import type { Product } from "@/lib/products";
import { cartItemFromProduct, CART_STORAGE_KEY, type CartItem } from "@/lib/cart";
import { useState } from "react";

type Props = { product: Product; className?: string };

export default function AddToCartButton({ product, className = "" }: Props) {
  const [added, setAdded] = useState(false);

  function addToCart() {
    const current = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as CartItem[];
    const existing = current.find((item) => item.id === product.id);
    const next = existing
      ? current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      : [...current, cartItemFromProduct(product)];
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("cart-updated"));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <>
      <button type="button" onClick={addToCart} className={`btn btn-outline w-full ${className}`}>
        Add to cart
      </button>
      {added && (
        <div className="fixed inset-x-4 bottom-20 z-[70] text-center md:bottom-6">
          <span className="inline-block rounded-full bg-wine-deep px-4 py-2 text-xs font-medium text-paper shadow-lg">
            Added to cart
          </span>
        </div>
      )}
    </>
  );
}