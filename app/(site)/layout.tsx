import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

/**
 * Storefront chrome. Lives in a route group so /admin can have a completely
 * different, phone-first layout with none of this.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
