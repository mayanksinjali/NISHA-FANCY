import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store admin",
  // Keep the admin panel out of search results.
  robots: { index: false, follow: false },
};

/**
 * Admin shell. Deliberately plain and high-contrast: this is a tool used
 * one-handed on a phone, not a storefront page.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-dvh bg-surface">{children}</div>;
}
