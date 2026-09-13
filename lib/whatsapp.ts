import { STORE } from "./config";

/**
 * Builds the WhatsApp "click to chat" link for a single product.
 *
 * Produces exactly:
 * https://wa.me/977XXXXXXXXX?text=Hi%2C%20I%27d%20like%20to%20order%3A%20NAME%20-%20Rs.%20PRICE
 *
 * The number comes from NEXT_PUBLIC_WHATSAPP_NUMBER (digits only, no "+").
 */
export function whatsappOrderUrl(
  productName: string,
  price: number,
  category?: string | null,
  imageUrl?: string | null,
): string {
  const details = [
    `Product: ${productName}`,
    `Price: Rs. ${price}`,
    category ? `Category: ${category}` : null,
    imageUrl ? `Photo: ${imageUrl}` : null,
  ].filter(Boolean);
  const message = `Hi, I'd like to order:\n${details.join("\n")}\nPlease confirm availability and delivery details.`;

  // encodeURIComponent leaves ' ! ( ) * alone; WhatsApp is happier with them
  // percent-encoded, and it matches the target URL format exactly.
  const encoded = encodeURIComponent(message).replace(
    /['!()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
  );

  const number = STORE.whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encoded}`;
}

/** Generic "chat to us" link used in the header, footer and contact page. */
export function whatsappGeneralUrl(
  message = "Hi! I have a question about your store.",
): string {
  const encoded = encodeURIComponent(message).replace(
    /['!()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
  );
  return `https://wa.me/${STORE.whatsappNumber.replace(/\D/g, "")}?text=${encoded}`;
}
