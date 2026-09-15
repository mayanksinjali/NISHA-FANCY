import type { Product } from "@/lib/products";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  category: string | null;
  imageUrl: string | null;
  sizes: string[];
  colors: string[];
  quantity: number;
};

export const CART_STORAGE_KEY = "nisha-fancy-cart";

export function cartItemFromProduct(product: Product): CartItem {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    imageUrl: product.image_url,
    sizes: product.sizes ?? [],
    colors: product.colors ?? [],
    quantity: 1,
  };
}

export function cartMessage(items: CartItem[]): string {
  const lines = items.map(
    (item, index) =>
      `${index + 1}. ${item.name}\n   Quantity: ${item.quantity}\n   Price: Rs. ${item.price * item.quantity}${
        item.sizes.length ? `\n   Sizes: ${item.sizes.join(", ")}` : ""
      }${item.colors.length ? `\n   Colors: ${item.colors.join(", ")}` : ""}`,
  );
  return `Hi, I'd like to order:\n\n${lines.join("\n\n")}\n\nPlease confirm availability and delivery details.`;
}