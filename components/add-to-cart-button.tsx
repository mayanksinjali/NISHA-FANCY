"use client";

import type { Product } from "@/lib/products";
import { cartItemFromProduct, CART_STORAGE_KEY, type CartItem } from "@/lib/cart";
import { useState } from "react";

type Props = { product: Product; className?: string; /** Render the variant chooser inline (detail page) instead of as a floating popover (cards). */ inline?: boolean };export default function AddToCartButton({ product, className = "", inline = false }: Props) {
  const [added, setAdded] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const needsChoice = Boolean(product.sizes?.length || product.colors?.length);

  function addToCart() {
    if (needsChoice && (!selectedSize && product.sizes?.length || !selectedColor && product.colors?.length)) {
      setChoosing(true);
      return;
    }
    const current = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as CartItem[];
    const existing = current.find(
      (item) =>
        item.id === product.id &&
        item.selectedSize === (selectedSize || null) &&
        item.selectedColor === (selectedColor || null),
    );
    const next = existing
      ? current.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item,
        )
      : [...current, cartItemFromProduct(product, selectedSize || null, selectedColor || null)];
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("cart-updated"));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
    setChoosing(false);
  }

  return (
    <div className={`w-full ${inline ? "" : "relative"} ${className}`}>
      {choosing && (
        <div
          className={`rounded-2xl border border-line bg-paper p-2.5 text-ink ${
            inline ? "mb-2" : "absolute bottom-full left-0 z-30 mb-2 w-full min-w-[240px] shadow-xl"
          }`}
        >
          <div className="grid grid-cols-2 gap-2">
            {product.sizes?.length ? (
              <label className="min-w-0 text-[10px] uppercase tracking-[0.08em] text-ink-soft">
                Size
                <select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} className="mt-1 h-9 w-full min-w-0 rounded-lg border border-line bg-paper px-2 text-xs normal-case tracking-normal text-ink outline-none">
                  <option value="">Choose</option>
                  {product.sizes.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </label>
            ) : null}
            {product.colors?.length ? (
              <label className="min-w-0 text-[10px] uppercase tracking-[0.08em] text-ink-soft">
                Color
                <select value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)} className="mt-1 h-9 w-full min-w-0 rounded-lg border border-line bg-paper px-2 text-xs normal-case tracking-normal text-ink outline-none">
                  <option value="">Choose</option>
                  {product.colors.map((color) => <option key={color} value={color}>{color}</option>)}
                </select>
              </label>
            ) : null}
          </div>
          <button type="button" onClick={addToCart} className="btn btn-solid mt-2 w-full px-3 py-2 text-[9px]">Add selected item</button>
        </div>
      )}
      <button type="button" onClick={() => (needsChoice ? setChoosing((open) => !open) : addToCart())} className="btn btn-outline w-full px-2 py-2.5 text-[10px] md:px-4 md:py-3">
        Add to cart
      </button>
      {added && (
        <div className="fixed inset-x-4 bottom-20 z-[70] text-center md:bottom-6">
          <span className="inline-block rounded-full bg-wine-deep px-4 py-2 text-xs font-medium text-paper shadow-lg">
            Added to cart
          </span>
        </div>
      )}
    </div>
  );
}