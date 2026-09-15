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
          className={`relative z-50 border-b border-line bg-bone/92 backdrop-blur-sm transition-[opacity,transform] duration-300 md:sticky md:top-0 ${
            scrollingDown ? "-translate-y-3 opacity-0 md:translate-y-0 md:opacity-100" : ""
          }`}
        >
      <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-4 md:h-20 md:px-10">
        {/* Wordmark */}
        <Link
          href="/"
          aria-label={STORE.name}
          className="flex items-center gap-3"
        >
          <Image
            src="/logo.jpeg"
            alt="Nisha Ghumti Fancy logo"
            width={48}
            height={48}
            priority
            className="h-9 w-9 rounded-full object-cover md:h-12 md:w-12"
          />
          <span className="font-display text-sm leading-none tracking-[0.12em] uppercase md:text-xl">
            {STORE.name}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
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
                className="eyebrow link-rule text-ink-soft transition-colors hover:text-ink data-[active=true]:text-ink"
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href={whatsappGeneralUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow text-terracotta link-rule"
          >
            WhatsApp
          </a>
        </nav>

      </div>
        </header>
      )}

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-paper/15 bg-wine-deep pb-[env(safe-area-inset-bottom)] text-paper shadow-[0_-8px_24px_rgba(0,0,0,0.28)] md:hidden"
      >
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                data-active={active}
                className="flex h-14 flex-col items-center justify-center gap-1 border-r border-paper/10 text-[9px] font-medium uppercase tracking-[0.16em] text-paper/60 transition-colors last:border-r-0 data-[active=true]:text-terracotta"
              >
                <span aria-hidden className="flex h-5 w-5 items-center justify-center">
                  {link.href === "/" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path d="m3 10 9-7 9 7" />
                      <path d="M5 9v11h14V9M9 20v-6h6v6" />
                    </svg>
                  ) : link.href === "/shop" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                      <path d="M4 9h16l-1 11H5L4 9Z" />
                      <path d="M8 9a4 4 0 0 1 8 0" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
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
            className="relative flex h-14 flex-col items-center justify-center gap-1 text-[9px] font-medium uppercase tracking-[0.16em] text-paper/60 transition-colors data-[active=true]:text-terracotta"
          >
            <span aria-hidden className="flex h-5 w-5 items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path d="M4 5h2l1.5 10h10L20 8H7" />
                <circle cx="10" cy="19" r="1" />
                <circle cx="17" cy="19" r="1" />
              </svg>
            </span>
            Cart
            {cartCount > 0 && (
              <span className="absolute top-1 right-[calc(50%-18px)] flex h-4 min-w-4 items-center justify-center rounded-full bg-terracotta px-1 text-[9px] font-bold text-wine-deep">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
      </nav>
    </>
  );
}
