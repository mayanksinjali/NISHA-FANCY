"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { formatRs } from "@/lib/format";

type Props = {
  /** Resolved product list (newest first). The page awaits this — no Promise. */
  products: Product[];
};

/**
 * Auto-sliding "New arrivals" hero. CSS scroll-snap gives the swipe feel, a
 * tiny interval does the auto-advance, and cloned edge slides make the loop
 * seamless — no carousel library.
 *
 *   [clone of LAST][ S1 ][ S2 ]...[ SN ][ clone of FIRST]
 *    position 0      1    2   ...  N     position N+1
 *
 * The track keeps CSS `scroll-behavior: smooth` for everything the user sees.
 * Silent correction jumps (clone → real slide, and the initial offset) pass
 * behavior: "instant" so the seam is never visible. Advancing from the last
 * slide animates onto the "clone of FIRST" slot, then snaps to the real first
 * slide — one slide-width of motion, no rewind across the track.
 */
const INTERVAL_MS = 3500;

export default function HeroCarousel({ products }: Props) {
  const slides = products.slice(0, 8);
  const count = slides.length;

  /* Index of the real slide the dots show (0-based). */
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  /* Honored only once the OS-level media query has been read on the client. */
  const [reducedMotion, setReducedMotion] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const activeRef = useRef(0);
  /* A programmatic scroll is in flight towards this slot (including clones). */
  const targetSlot = useRef<number | null>(null);

  /* Current slot (0..count+1) derived from scrollLeft. */
  const currentSlot = () => {
    const track = trackRef.current;
    if (!track) return null;
    const step = track.clientWidth || 1;
    return Math.round(track.scrollLeft / step);
  };

  const syncActive = (index: number) => {
    activeRef.current = index;
    setActive(index);
  };

  /* Move to a slot. Animated for real moves, instant for silent corrections. */
  const scrollToSlot = (slot: number, smooth: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    targetSlot.current = slot;
    track.scrollTo({
      left: slot * track.clientWidth,
      behavior: smooth ? "smooth" : "instant",
    });
  };

  /* Animated move to a real slide; callers may pass -1 or count to wrap. */
  const scrollToIndex = (index: number) => {
    scrollToSlot(index + 1, true);
  };

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /* -------- Auto-advance (skipped for reduced-motion users) -------- */
  useEffect(() => {
    if (paused || reducedMotion || count < 2) return;
    const timer = window.setInterval(() => {
      const next = (activeRef.current + 1) % count;
      // Unclamped target: from the last slide this lands on the clone of the
      // first (one slide of motion), and the scroll handler snaps it back.
      scrollToIndex(next);
      syncActive(next);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, count]);

  /* -------- Scroll handling: dots + seamless wrap corrections -------- */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || count < 2) return;

    const onScroll = () => {
      const slot = currentSlot();
      if (slot === null) return;

      /* Programmatic scroll in flight: wait for it to land. */
      if (targetSlot.current !== null) {
        if (slot !== targetSlot.current) return;
        targetSlot.current = null;
        /* It landed on a clone — silently jump to the equivalent real slide. */
        if (slot === count + 1) {
          syncActive(0);
          scrollToSlot(1, false);
          return;
        }
        if (slot === 0) {
          syncActive(count - 1);
          scrollToSlot(count, false);
          return;
        }
        return;
      }

      /* User-driven scroll (touch swipe / momentum snap). */
      if (slot === count + 1) {
        syncActive(0);
        scrollToSlot(1, false);
      } else if (slot === 0) {
        syncActive(count - 1);
        scrollToSlot(count, false);
      } else {
        syncActive(Math.min(count - 1, Math.max(0, slot - 1)));
      }
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [count]);

  /* Initial offset on mount (and when the product list changes): sit on slot 1. */
  useEffect(() => {
    const track = trackRef.current;
    if (track && count) {
      activeRef.current = 0;
      track.scrollTo({ left: track.clientWidth, behavior: "instant" });
    }
  }, [count]);

  /* -------- Manual swipe on touch screens -------- */
  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    setPaused(true);
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const startX = touchStartX.current;
    touchStartX.current = null;
    setPaused(false);
    if (startX === null) return;
    const endX = event.changedTouches[0]?.clientX;
    if (endX === undefined) return;
    if (Math.abs(endX - startX) < 40) return; // a tap, not a swipe
    // Target from the logical index, not scrollLeft — the momentum snap may
    // still be in flight when touchend fires.
    scrollToIndex(activeRef.current + (endX < startX ? 1 : -1));
  }

  /* Single product: no sliding machinery, just a hero card. */
  if (count <= 1) {
    const product = slides[0];
    return (
      <section className="relative left-1/2 w-screen -translate-x-1/2">
        <h1 className="sr-only">New arrivals</h1>
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-bone md:aspect-[16/8.5]">
          {product ? (
            <HeroSlide product={product} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <p className="font-display text-3xl text-ink/30">New arrivals</p>
              <p className="text-sm text-ink-soft">The first drop is being photographed.</p>
              <Link href="/shop" className="btn btn-solid">Shop all</Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative left-1/2 w-screen -translate-x-1/2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="New arrivals"
    >
      <h1 className="sr-only">New arrivals</h1>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Clone of the last slide, so swiping backwards from #1 wraps */}
        <div className="relative min-w-full snap-center" aria-hidden>
          <HeroSlide product={slides[count - 1]} />
        </div>
        {slides.map((product, index) => (
          <div key={product.id} className="relative min-w-full snap-center">
            <HeroSlide product={product} index={index} />
          </div>
        ))}
        {/* Clone of the first slide, so swiping forwards from #last wraps */}
        <div className="relative min-w-full snap-center" aria-hidden>
          <HeroSlide product={slides[0]} />
        </div>
      </div>

      {/* Dots */}
      <div className="pointer-events-none absolute inset-x-0 bottom-14 z-10 flex justify-center gap-1.5 md:bottom-5">
        {slides.map((product, index) => (
          <span
            key={product.id}
            aria-hidden
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === active ? "w-5 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function HeroSlide({ product, index }: { product: Product; index?: number }) {
  const soldOut = !product.in_stock;
  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-bone md:aspect-[16/8.5]">
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          priority={index === 0}
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-display text-8xl text-ink/15">
            {product.name.slice(0, 1).toUpperCase()}
          </span>
        </div>
      )}

      {/* Ink scrim, heavier on mobile where the type sits over the photo centre */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 px-4 pb-4 md:px-8 md:pb-6">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow text-white/70">New arrival</p>
            <h2 className="mt-1 truncate max-w-[70vw] font-display text-xl leading-tight text-white md:text-3xl">
              {product.name}
            </h2>
            <p className="mt-1 text-base font-semibold tabular-nums text-white md:text-lg">
              {product.sale_price ? (
                <>
                  <span className="text-terracotta">{formatRs(product.sale_price)}</span>{" "}
                  <span className="text-sm text-white/60 line-through">{formatRs(product.price)}</span>
                </>
              ) : (
                formatRs(product.price)
              )}
              {discountPercent > 0 && (
                <span className="ml-2 rounded-full bg-terracotta px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-white align-middle">
                  {discountPercent}% off
                </span>
              )}
            </p>
          </div>

          {soldOut ? (
            <span className="shrink-0 rounded-full border border-white/40 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/80">
              Sold out
            </span>
          ) : (
            <Link
              href={`/shop/${product.id}`}
              className="btn btn-solid shrink-0 border-white/20 bg-white/95 px-4 py-2.5 text-[10px] text-ink hover:bg-white"
            >
              Shop now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
