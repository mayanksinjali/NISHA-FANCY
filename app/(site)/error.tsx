"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Storefront error boundary. Catches anything a page under (site) throws —
 * most commonly ProductCatalogError when Supabase is briefly unreachable.
 *
 * Unlike an inline "catalog unavailable" panel, an error boundary is never
 * cached by ISR, so a blip can't leave the message on screen for 5 minutes.
 * The header/footer from (site)/layout.tsx stay in place around it.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in Vercel's runtime logs alongside the digest.
    console.error("[storefront] render error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[640px] px-4 py-16 text-center md:px-8 md:py-24">
      <p className="eyebrow text-ink-soft">Something went wrong</p>
      <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] md:text-5xl">
        We couldn&apos;t load this page.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        The catalog is briefly unavailable. Nothing is lost — try again, or head
        back to the shop.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn btn-solid">
          Try again
        </button>
        <Link href="/shop" className="btn btn-outline">
          Back to shop
        </Link>
      </div>
      {error.digest && (
        <p className="mt-8 text-[11px] text-ink-soft">
          Reference: <code className="font-mono">{error.digest}</code>
        </p>
      )}
    </div>
  );
}
