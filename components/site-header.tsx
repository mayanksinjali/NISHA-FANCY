"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  const isProductDetail = pathname.startsWith("/shop/") && pathname !== "/shop";

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
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-line bg-bone/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(23,21,15,0.08)] backdrop-blur-md md:hidden"
    >
      {NAV_LINKS.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            data-active={active}
            className="flex min-h-14 flex-col items-center justify-center gap-1 border-r border-line px-1 text-[10px] uppercase tracking-[0.12em] text-ink-soft last:border-r-0 data-[active=true]:text-terracotta"
          >
            <span className="text-base leading-none" aria-hidden>
              {link.href === "/" ? "⌂" : link.href === "/shop" ? "◫" : "✉"}
            </span>
            {link.label}
          </Link>
        );
      })}
      <a
        href={whatsappGeneralUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[10px] uppercase tracking-[0.12em] text-terracotta"
      >
        <span className="text-base leading-none" aria-hidden>
          ◉
        </span>
        WhatsApp
      </a>
      </nav>
    </>
  );
}
