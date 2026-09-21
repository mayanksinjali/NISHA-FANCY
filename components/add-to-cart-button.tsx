"use client";

import type { Product } from "@/lib/products";
import { cartItemFromProduct, readCart, writeCart } from "@/lib/cart";
import { useEffect, useRef, useState } from "react";

type Props = {
  product: Product;
  className?: string;
  /**
   * Render the variant chooser inline (detail page) instead of as a floating
   * popover (cards).
   */
  inline?: boolean;
};

export default function AddToCartButton({ product, className = "", inline = false }: Props) {
  const [added, setAdded] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const addedTimer = useRef<number | null>(null);

  // Clear the "Added to cart" toast timer if the card unmounts first.
  useEffect(
    () => () => {
      if (addedTimer.current) window.clearTimeout(addedTimer.current);
    },
    [],
  );

  const needsChoice = Boolean(product.sizes?.length || product.colors?.length);

  function addToCart() {
    const missingSize = Boolean(product.sizes?.length) && !selectedSize;
    const missingColor = Boolean(product.colors?.length) && !selectedColor;
    if (needsChoice && (missingSize || missingColor)) {
      setChoosing(true);
      return;
    }
    const current = readCart();
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
    writeCart(next);
    setAdded(true);
    if (addedTimer.current) window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 2000);
    setChoosing(false);
  }

  return (
    <div className={`w-full ${inline ? "" : "relative"} ${className}`}>
      {choosing && (
        <div
          className={`rounded-2xl border border-line bg-paper p-2.5 text-ink ${
            inline
              ? "mb-2"
              : "absolute bottom-full left-0 z-30 mb-2 w-full shadow-xl"
          }`}
        >
          <div className="space-y-2">
            {product.sizes?.length ? (
              <label className="min-w-0 text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                Size
                <select value={selectedSize} onChange={(event) => setSelectedSize(event.target.value)} className="mt-1 h-9 w-full min-w-0 rounded-lg border border-line bg-paper px-2 text-xs normal-case tracking-normal text-ink outline-none">
                  <option value="">Choose</option>
                  {product.sizes.map((size) => <option key={size} value={size}>{size}</option>)}
                </select>
              </label>
            ) : null}
            {product.colors?.length ? (
              <label className="min-w-0 text-[11px] uppercase tracking-[0.08em] text-ink-soft">
                Color
                <select value={selectedColor} onChange={(event) => setSelectedColor(event.target.value)} className="mt-1 h-9 w-full min-w-0 rounded-lg border border-line bg-paper px-2 text-xs normal-case tracking-normal text-ink outline-none">
                  <option value="">Choose</option>
                  {product.colors.map((color) => <option key={color} value={color}>{color}</option>)}
                </select>
              </label>
            ) : null}
          </div>
          <button type="button" onClick={addToCart} className="btn btn-solid mt-2 w-full px-3 py-2 text-[11px]">Add selected item</button>
        </div>
      )}
      <button
        type="button"
        onClick={() => (needsChoice ? setChoosing((open) => !open) : addToCart())}
        className="btn btn-outline w-full px-2 py-2.5 text-[11px] md:px-4 md:py-3"
      >
        Add to cart
      </button>
      {added && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-20 z-[70] text-center md:bottom-6"
        >
          <span className="inline-block rounded-full bg-wine-deep px-4 py-2 text-xs font-medium text-paper shadow-lg">
            Added to cart
          </span>
        </div>
      )}
    </div>
  );
}