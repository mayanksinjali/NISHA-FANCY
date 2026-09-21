import type { Metadata, Viewport } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
import { STORE } from "@/lib/config";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

/* Display: high-contrast Didone serif — the fashion-magazine voice. */
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-bodoni",
});

/* Body: grotesque sans with a bit more character than the usual default. */
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: {
    default: `${STORE.name} — ${STORE.tagline}`,
    template: `%s · ${STORE.name}`,
  },
  description: STORE.tagline,
  metadataBase: new URL(SITE_URL),
  // No canonical here on purpose: this layout also wraps /owner, and a
  // sitewide "canonical: /" would point the owner panel at the homepage.
  // Each storefront page declares its own instead.
  openGraph: {
    title: STORE.name,
    description: STORE.tagline,
    type: "website",
    // Share images come from app/(site)/opengraph-image.tsx (branded fallback)
    // and app/(site)/shop/[id]/opengraph-image.tsx (per-product card).
  },
  twitter: {
    card: "summary_large_image",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: STORE.name,
    statusBarStyle: "black-translucent",
  },
  icons: { icon: "/logo.jpeg", apple: "/logo.jpeg" },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
  width: "device-width",
  initialScale: 1,
  // Without `cover`, iOS reports every env(safe-area-inset-*) as 0 — which is
  // why the mobile nav, the sticky add-to-cart bar and the install toast all
  // sat underneath the home indicator on notched iPhones.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${bodoni.variable} ${archivo.variable}`}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
