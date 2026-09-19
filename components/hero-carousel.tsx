"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { formatRs } from "@/lib/format";

type Props = {
  products: Product[];
};

const INTERVAL_MS = 3500;

export default function HeroCarousel({ products }: Props) {
  const slides = products.slice(0, 6);
  const count = slides.length;

  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (index: number) => {
    if (!trackRef.current) return;
    const pos = index * trackRef.current.clientWidth;
    trackRef.current.scrollTo({
      left: pos,
      behavior: reducedMotion ? "instant" : "smooth",
    });
    setActive(index);
  };

  const goNext = () => {
    if (!trackRef.current) return;
    const maxScroll = trackRef.current.scrollWidth - trackRef.current.clientWidth;
    const next = trackRef.current.scrollLeft + trackRef.current.clientWidth;
    if (next >= maxScroll) {
      // Loop back to start instantly (user won't see because it's a clone)
      trackRef.current.scrollTo({ left: 0, behavior: "instant" });
      setActive(0);
    } else {
      goTo(Math.round(trackRef.current.scrollLeft / trackRef.current.clientWidth) + 1);
    }
  };

  const goPrev = () => {
    if (!trackRef.current) return;
    const prev = trackRef.current.scrollLeft - trackRef.current.clientWidth;
    if (prev <= 0) {
      // Jump to last position (clone of last slide)
      const lastPos = (count - 1) * trackRef.current.clientWidth;
      trackRef.current.scrollTo({ left: lastPos, behavior: "instant" });
      setActive(count - 1);
    } else {
      goTo(Math.round(trackRef.current.scrollLeft / trackRef.current.clientWidth) - 1);
    }
  };

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Auto-play
  useEffect(() => {
    if (count < 2 || reducedMotion) return;
    autoPlayRef.current = setInterval(goNext, INTERVAL_MS);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [count, reducedMotion]);

  // Reset timer on interaction
  const resetTimer = () => {
    if (autoPlayRef.current && count >= 2 && !reducedMotion) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(goNext, INTERVAL_MS);
    }
  };

  // Initial position
  useEffect(() => {
    if (trackRef.current && count) {
      trackRef.current.scrollTo({ left: trackRef.current.clientWidth, behavior: "instant" });
      setActive(0);
    }
  }, [count]);

  // Track scroll for dots
  useEffect(() => {
    const track = trackRef.current;
    if (!track || count < 2) return;

    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (!track) return;
        const idx = Math.round(track.scrollLeft / track.clientWidth);
        // Normalize: 0 = first clone, 1..count = real slides, count+1 = last clone
        let normalized = idx;
        if (idx > count) normalized = count - 1;
        else if (idx === 0) normalized = 0;
        else normalized = idx - 1;
        if (normalized >= 0 && normalized < count) {
          setActive(normalized);
        }
      });
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      track.removeEventListener("scroll", handleScroll);
    };
  }, [count]);

  // Touch handling - pause autoplay during swipe, resume after
  const touchStartX = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const duration = Date.now() - (touchStartTime.current ?? 0);
    const distance = Math.abs(e.changedTouches[0].clientX - (touchStartX.current ?? 0));
    touchStartX.current = null;
    touchStartTime.current = null;

    // Tap = navigate to product (Link handles it)
    // Swipe = CSS scroll handles it
    // Just restart autoplay
    resetTimer();
  };

  if (count <= 1) {
    const product = slides[0];
    return (
      <section className="relative left-1/2 w-screen -translate-x-1/2">
        <h1 className="sr-only">New arrivals</h1>
        <Link
          href={product ? `/shop/${product.id}` : "/shop"}
          className="relative block h-[230px] w-full overflow-hidden bg-bone md:h-full"
        >
          {product ? (
            <HeroSlide product={product} index={0} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <p className="font-display text-xl text-ink/30">New arrivals</p>
              <p className="text-[10px] text-ink-soft">The first drop is being photographed.</p>
            </div>
          )}
        </Link>
      </section>
    );
  }

  return (
    <section
      className="relative left-1/2 w-screen -translate-x-1/2"
    >
      <h1 className="sr-only">New arrivals</h1>
      <div
        ref={trackRef}
        className="flex overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Duplicate slides for infinite loop effect */}
        {[...slides, ...slides, ...slides].map((product, index) => (
          <div
            key={`${product.id}-${index}`}
            className="relative flex-shrink-0 w-full"
          >
            <HeroSlide product={product} index={index} />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1 md:bottom-5">
        {slides.map((product, index) => (
          <button
            key={product.id}
            onClick={() => {
              goTo(index + 1);
              resetTimer();
            }}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === active ? "true" : undefined}
            className={`pointer-events-auto h-0.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
              index === active ? "w-3 bg-white" : "w-0.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function HeroSlide({ product }: { product: Product; index?: number }) {
  const soldOut = !product.in_stock;
  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <Link
      href={`/shop/${product.id}`}
      className="block relative h-[230px] w-full overflow-hidden bg-bone md:h-full"
      aria-label={`View ${product.name}`}
    >
      {product.image_url ? (
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          priority={false}
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-display text-4xl text-ink/15">
            {product.name.slice(0, 1).toUpperCase()}
          </span>
        </div>
      )}

      {/* Ink scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 px-2 pb-1 md:px-8 md:pb-6">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate max-w-[85vw] font-display text-[11px] leading-tight text-white md:text-3xl">
              {product.name}
            </h2>
            <p className="mt-0.5 text-[9px] font-semibold tabular-nums text-white md:text-lg">
              {product.sale_price ? (
                <>
                  <span className="text-terracotta">{formatRs(product.sale_price)}</span>{" "}
                  <span className="text-[9px] text-white/60 line-through">{formatRs(product.price)}</span>
                </>
              ) : (
                formatRs(product.price)
              )}
              {discountPercent > 0 && (
                <span className="ml-1 rounded-full bg-terracotta px-1 py-0 text-[7px] font-bold uppercase tracking-[0.1em] text-white align-middle">
                  -{discountPercent}%
                </span>
              )}
            </p>
          </div>

          {soldOut ? (
            <span className="shrink-0 rounded-full border border-white/40 px-1.5 py-0.5 text-[7px] uppercase tracking-[0.2em] text-white/80">
              Sold out
            </span>
          ) : (
            <span className="btn btn-solid shrink-0 border-white/20 bg-white/95 px-1.5 py-0.5 text-[7px] text-ink hover:bg-white">
              Shop
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
