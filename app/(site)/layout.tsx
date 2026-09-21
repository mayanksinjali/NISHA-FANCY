import type { Metadata } from "next";
import PageFade from "@/components/page-fade";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import InstallToast from "@/components/install-toast";
import { STORE } from "@/lib/config";

/**
 * Storefront PWA metadata. Declared here rather than in the root layout so the
 * owner app can declare its own manifest: installing from /owner must yield
 * the owner app, never the customer store.
 */
export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: STORE.name,
    statusBarStyle: "black-translucent",
  },
};

/**
 * Storefront chrome. Lives in a route group so /admin can have a completely
 * different, phone-first layout with none of this.
 *
 * PageFade wraps only the routed content (not the header/footer), giving a
 * subtle 200ms cross-fade when moving between the shop and a product page
 * (Task 4). Skipped under prefers-reduced-motion.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main>
        <PageFade>{children}</PageFade>
      </main>
      <SiteFooter />
      <InstallToast />
    </>
  );
}
