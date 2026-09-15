import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import CartBar from "@/components/cart-bar";

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
      <CartBar />
      <SiteFooter />
    </>
  );
}
