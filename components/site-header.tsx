"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CART_STORAGE_KEY, type CartItem } from "@/lib/cart";
import { NAV_LINKS, STORE } from "@/lib/config";
import { whatsappGeneralUrl } from "@/lib/whatsapp";

/**
 * Sticky editorial masthead: wordmark left, rules top and bottom, nav in small
 * caps. On mobile the nav collapses into a full-height panel (no hamburger
 * dropdown card, no shadows).
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const [scrollingDown, setScrollingDown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const isProductDetail = pathname.startsWith("/shop/") && pathname !== "/shop";

  // Keep the compact mobile masthead out of the way while reading the page.
  useEffect(() => {
    let previousY = window.scrollY;
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrollingDown(currentY > previousY && currentY > 48);
      previousY = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const items = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as CartItem[];
      setCartCount(items.reduce((total, item) => total + item.quantity, 0));
    };
    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  useEffect(() => {
    document.body.classList.add("has-mobile-nav");
    return () => document.body.classList.remove("has-mobile-nav");
  }, []);

  return (
    <>
      {!isProductDetail && (
        <header
          className={`relative z-50 border-b border-line bg-paper transition-[opacity,transform] duration-300 md:sticky md:top-0 ${
            scrollingDown ? "-translate-y-3 opacity-0 md:translate-y-0 md:opacity-100" : ""
          }`}
        >
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 md:h-16 md:px-8">
        {/* Wordmark */}
        <Link
          href="/"
          aria-label={STORE.name}
          className="flex items-center gap-1.5"
        >
          <Image
            src="/logo.jpeg"
            alt="Nisha Ghumti Fancy logo"
            width={28}
            height={28}
            priority
            className="h-9 w-9 rounded-full object-cover ring-1 ring-line md:h-10 md:w-10"
          />
          <span className="font-sans text-[11px] font-bold leading-none tracking-[-0.02em] md:text-xs">
            {STORE.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                data-active={active}
                className="text-xs font-medium text-ink-soft transition-colors hover:text-ink data-[active=true]:text-ink"
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href={whatsappGeneralUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-solid px-4 py-2 text-xs"
          >
            WhatsApp
          </a>
        </nav>

      </div>
        </header>
      )}

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] text-ink shadow-[0_-6px_18px_rgba(23,23,23,0.06)] md:hidden"
      >
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                data-active={active}
                className="flex h-10 flex-col items-center justify-center gap-0 border-r border-line text-[7px] font-medium uppercase tracking-[0.1em] text-ink-soft transition-colors last:border-r-0 data-[active=true]:text-ink data-[active=true]:[&>span]:[&>svg]:stroke-2"
              >
                <span aria-hidden className="flex h-3.5 w-3.5 items-center justify-center">
                  {link.href === "/" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5">
                      <path d="m3 10 9-7 9 7" />
                      <path d="M5 9v11h14V9M9 20v-6h6v6" />
                    </svg>
                  ) : link.href === "/shop" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5">
                      <path d="M4 9h16l-1 11H5L4 9Z" />
                      <path d="M8 9a4 4 0 0 1 8 0" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  )}
                </span>
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/cart"
            data-active={pathname.startsWith("/cart")}
            className="relative flex h-10 flex-col items-center justify-center gap-0 text-[7px] font-medium uppercase tracking-[0.1em] text-ink-soft transition-colors data-[active=true]:text-ink data-[active=true]:[&>span>svg]:stroke-2"
          >
            <span aria-hidden className="flex h-3.5 w-3.5 items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5">
                <path d="M4 5h2l1.5 10h10L20 8H7" />
                <circle cx="10" cy="19" r="1" />
                <circle cx="17" cy="19" r="1" />
              </svg>
            </span>
            Cart
            {cartCount > 0 && (
              <span className="absolute top-0 right-[calc(50%-14px)] flex h-3 min-w-3 items-center justify-center rounded-full bg-terracotta px-0.5 text-[6px] font-bold text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
      </nav>
    </>
  );
}
