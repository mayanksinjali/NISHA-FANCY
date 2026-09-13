"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS, STORE } from "@/lib/config";
import { whatsappGeneralUrl } from "@/lib/whatsapp";
import ThemeToggle from "@/components/theme-toggle";

/**
 * Sticky editorial masthead: wordmark left, rules top and bottom, nav in small
 * caps. On mobile the nav collapses into a full-height panel (no hamburger
 * dropdown card, no shadows).
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the panel whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile panel is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bone/92 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5 md:h-20 md:px-10">
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
            className="h-10 w-10 rounded-full object-cover md:h-12 md:w-12"
          />
          <span className="font-display text-base leading-none tracking-[0.14em] uppercase md:text-xl">
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
          <ThemeToggle />
        </nav>

        {/* Mobile toggle — two rules that become an X */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[6px]"
          >
            <span
              className={`block h-px w-6 bg-ink transition-transform duration-300 ${
                open ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-6 bg-ink transition-transform duration-300 ${
                open ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        className={`fixed inset-x-0 top-16 bottom-0 z-40 origin-top border-t border-line bg-bone px-5 transition-[opacity,transform] duration-300 md:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <nav className="flex flex-col pt-6">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-baseline justify-between border-b border-line py-5 font-display text-4xl"
            >
              {link.label}
              <span className="eyebrow text-ink-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
            </Link>
          ))}
        </nav>
        <a
          href={whatsappGeneralUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-solid mt-8 w-full"
        >
          Order on WhatsApp
        </a>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
          <span className="eyebrow text-ink-soft">Appearance</span>
          <ThemeToggle />
        </div>
        <p className="eyebrow mt-8 text-ink-soft">{STORE.address}</p>
      </div>
    </header>
  );
}
