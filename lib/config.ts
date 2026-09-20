/**
 * Storefront configuration.
 *
 * Everything here is driven by NEXT_PUBLIC_* env vars with sensible placeholder
 * fallbacks, so you can swap the store name / WhatsApp number / socials without
 * touching component code.
 */

export const STORE = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || "STORE_NAME",
  tagline:
    process.env.NEXT_PUBLIC_STORE_TAGLINE ||
    "Everyday clothing, made to be lived in.",
  /** Digits only, international format. e.g. 9779812345678 */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "977XXXXXXXXX",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || "hello@example.com",
  address:
    process.env.NEXT_PUBLIC_STORE_ADDRESS || "Your street, Your city, Nepal",
  hours: "Every day, 9:00 – 21:00",
  social: [
    {
      label: "Instagram",
      href:
        process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
        "https://www.instagram.com/akhtarshah7788660?stkn=a2k4NnJsc3k4OTY2",
    },
    {
      label: "Facebook",
      href:
        process.env.NEXT_PUBLIC_FACEBOOK_URL ||
        "https://www.facebook.com/profile.php?id=61591790385915",
    },
    {
      label: "TikTok",
      href:
        process.env.NEXT_PUBLIC_TIKTOK_URL ||
        "https://www.tiktok.com/@nisha.fancy8?_r=1&_t=ZS-99jAkM0M4Wq",
    },
  ].filter((social) => Boolean(social.href)),
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Favorites", href: "/favorites" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * Editorial photography used for the hero and the lookbook blocks.
 * These are free Unsplash images — replace the URLs with your own campaign
 * shots (drop files in /public and use e.g. "/hero.jpg") when you have them.
 */
export const EDITORIAL_IMAGES = {
  hero: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80",
  storyPortrait:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  storyDetail:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=80",
  contact:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80",
} as const;

/**
 * Category tiles on the home page. `slug` is matched against products.category,
 * so keep these in sync with the categories you type in the admin panel.
 */
export const FEATURED_CATEGORIES = [
  {
    slug: "Women",
    label: "Women",
    alt: "Woman wearing a printed kurta set, photographed for the Women's collection",
    image:
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "Men",
    label: "Men",
    alt: "Man in a casual button-up shirt, photographed for the Men's collection",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "Both",
    label: "Both",
    alt: "Unisex outfit styled for anyone, photographed for the unisex collection",
    image:
      "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "Children",
    label: "Children",
    alt: "Child in comfortable everyday clothing, photographed for the Children's collection",
    image:
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80",
  },
] as const;
