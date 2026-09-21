import type { Metadata, Viewport } from "next";
import { STORE } from "@/lib/config";

/**
 * Owner-only PWA metadata, scoped to /owner. This overrides the customer
 * manifest for the owner area only: installing from any /owner page yields an
 * "Owner" app with its own name, start URL and scope. The customer storefront
 * keeps the site-wide manifest from the root layout.
 *
 * The cookie-gate (middleware + per-action requireAdmin()) still applies —
 * a PWA is just a window onto the same authenticated pages.
 */
export const metadata: Metadata = {
  title: {
    default: `${STORE.name} Owner`,
    template: `%s · ${STORE.name} Owner`,
  },
  robots: { index: false, follow: false },
  manifest: "/owner/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: `${STORE.name} Owner`,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
  // Match the storefront, so the owner panel's bottom padding clears the home
  // indicator on notched iPhones too.
  viewportFit: "cover",
};

/**
 * Owner shell: light gray canvas with white rounded cards on top.
 * Deliberately separate from the storefront chrome — mobile-first, since the
 * owner manages the store from a phone. A tiny inline script registers the
 * owner-scoped service worker (app/owner/sw.js) so the area installs and runs
 * like a native owner app; it never touches customer routes.
 */
export default function OwnerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const swScript = `
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("/owner/sw.js").catch(function () {});
      });
    }
  `;

  return (
    <div className="min-h-dvh bg-gray-50 text-ink">
      <script dangerouslySetInnerHTML={{ __html: swScript }} />
      {children}
    </div>
  );
}
