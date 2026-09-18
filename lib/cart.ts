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