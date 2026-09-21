import type { Product } from "@/lib/products";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  category: string | null;
  imageUrl: string | null;
  sizes: string[];
  colors: string[];
  selectedSize: string | null;
  selectedColor: string | null;
  quantity: number;
};

export const CART_STORAGE_KEY = "nisha-fancy-cart";

/** Fired on window whenever the cart changes, so the badge and page stay in sync. */
export const CART_EVENT = "cart-updated";

/**
 * Shape check for anything coming out of localStorage. Storage is shared with
 * older versions of this app and with whatever else the shopper's browser is
 * running, so a malformed entry must not be trusted enough to crash a render.
 */
function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    typeof item.quantity === "number" &&
    Number.isFinite(item.quantity)
  );
}

/**
 * Read the cart, tolerating absent, corrupt or half-written storage. Every
 * consumer (header badge, cart page, add-to-cart) goes through this instead of
 * calling JSON.parse itself — one bad value used to throw inside a render.
 */
export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem).map((item) => ({
      ...item,
      quantity: Math.max(1, Math.floor(item.quantity)),
    }));
  } catch {
    console.warn("[cart] ignoring unreadable cart storage");
    return [];
  }
}

/** Total units in the cart — what the header badge shows. */
export function countCartItems(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

/** Persist and notify every listener (header badge, other tabs). */
export function writeCart(items: CartItem[]): void {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private mode / storage full — the in-memory state still works for this page.
  }
  window.dispatchEvent(new Event(CART_EVENT));
}

export function cartItemFromProduct(
  product: Product,
  selectedSize: string | null = null,
  selectedColor: string | null = null,
): CartItem {
  return {
    id: product.id,
    name: product.name,
    price: product.sale_price ?? product.price,
    category: product.category,
    imageUrl: product.image_url,
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    selectedSize,
    selectedColor,
    quantity: 1,
  };
}

export function cartMessage(items: CartItem[]): string {
  const lines = items.map(
    (item, index) =>
      `${index + 1}. ${item.name}${
        item.category ? `\n   Category: ${item.category}` : ""
      }\n   Quantity: ${item.quantity}\n   Price: Rs. ${item.price * item.quantity}${
        item.selectedSize ? `\n   Size: ${item.selectedSize}` : ""
      }${item.selectedColor ? `\n   Color: ${item.selectedColor}` : ""}${
        item.imageUrl ? `\n   Photo: ${item.imageUrl}` : ""
      }`,
  );
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return `Hi, I'd like to order:\n\n${lines.join("\n\n")}\n\nTotal: Rs. ${total}\n\nPlease confirm availability and delivery details.`;
}