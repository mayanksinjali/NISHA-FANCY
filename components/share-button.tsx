"use client";

import { useRef, useState } from "react";

type Props = {
  /** Product name — used as the share title and in the button's label. */
  name: string;
  className?: string;
};

/**
 * Share affordance for a product page: the native share sheet where the
 * platform has one (every phone), a clipboard copy + "Link copied" toast
 * everywhere else. Kept dependency-free and hidden from crawlers.
 */
export default function ShareButton({ name, className = "" }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, text: name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // The share sheet was dismissed, or the clipboard was blocked. Neither
      // is an error the shopper needs to see.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={share}
        aria-label={`Share ${name}`}
        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink ${className}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
          <path d="M12 15V3m0 0L8 7m4-4 4 4" />
          <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
        </svg>
      </button>
      {copied && (
        <span role="status" aria-live="polite" className="text-[11px] font-medium text-ink-soft">
          Link copied
        </span>
      )}
    </>
  );
}
