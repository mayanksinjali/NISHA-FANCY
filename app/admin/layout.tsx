import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Store admin",
  // Keep the admin panel out of search results.
  robots: { index: false, follow: false },
};

/**
 * Admin shell: light gray canvas with white rounded cards on top.
 * Deliberately separate from the storefront chrome.
 */
export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-dvh bg-gray-50 text-ink">{children}</div>;
}
