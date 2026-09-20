"use client";

import { useEffect, useState } from "react";
import {
  FAVORITES_EVENT,
  readFavoriteIds,
  toggleFavorite,
} from "@/lib/favorites";

type Props = {
  productId: string;
  productName: string;
  /** Extra positioning classes from the parent (cards overlay it on the photo). */
  className?: string;
  /** Larger tap target on the product detail page. */
  size?: "sm" | "lg";
};

/**
 * Heart toggle (Task 2). State is read from localStorage on mount and kept in
 * sync through the FAVORITES_EVENT custom event + cross-tab `storage` event.
 * Gives a small animated "pop" when favorited (Task 7), suppressed for
 * prefers-reduced-motion.
 */
export default function FavoriteButton({
  productId,
  productName,
  className = "",
  size = "sm",
}: Props) {
  const [active, setActive] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    const sync = () => setActive(readFavoriteIds().includes(productId));
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [productId]);

  function handleClick(event: React.MouseEvent) {
    // Cards wrap the photo in a <Link>; stop the navigation when toggling.
    event.preventDefault();
    event.stopPropagation();
    const nowActive = toggleFavorite(productId);
    setActive(nowActive);
    if (nowActive) {
      setPop(true);
      window.setTimeout(() => setPop(false), 350);
    }
  }

  const box = size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const icon = size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${productName} from favorites` : `Add ${productName} to favorites`}
      className={`flex ${box} items-center justify-center rounded-full border border-line/70 bg-paper/90 text-ink shadow-sm backdrop-blur transition-colors hover:bg-paper motion-reduce:transition-none ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={`${icon} motion-reduce:transition-none ${
          active ? "text-terracotta" : "text-ink"
        } ${pop ? "animate-[heart-pop_350ms_ease-out] motion-reduce:animate-none" : ""}`}
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M12 20.5 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z" />
      </svg>
    </button>
  );
}
