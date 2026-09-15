"use client";

import type { Product } from "@/lib/products";
import { cartItemFromProduct, CART_STORAGE_KEY, type CartItem } from "@/lib/cart";

type Props = { product: Product; className?: string };

export default function AddToCartButton({ product, className = "" }: Props) {
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
  }

  return (
    <button type="button" onClick={addToCart} className={`btn btn-outline w-full ${className}`}>
      Add to cart
    </button>
  );
}