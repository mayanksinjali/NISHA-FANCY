"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { formatRs } from "@/lib/format";

type Props = {
  products: Product[];
};

const INTERVAL_MS = 4000;

export default function HeroCarousel({ products }: Props) {
  const slides = products.slice(0, 8);
  const count = slides.length;

  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);

  const syncActive = (index: number) => {
    activeRef.current = index;
    setActive(index);
  };

  const goToSlide = (index: number) => {
    const normalized = ((index % count) + count) % count;
    if (trackRef.current) {
      trackRef.current.scrollTo({
        left: (normalized + 1) * trackRef.current.clientWidth,
        behavior: reducedMotion ? "instant" : "smooth",
      });
    }
    syncActive(normalized);
  };

  const goNext = () => goToSlide(activeRef.current + 1);
  const goPrev = () => goToSlide(activeRef.current - 1);

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

    autoPlayRef.current = setInterval(() => {
      goNext();
    }, INTERVAL_MS);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [count, reducedMotion]);

  // Reset auto-play timer on interaction
  const resetAutoPlay = () => {
    if (autoPlayRef.current && count >= 2 && !reducedMotion) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        goNext();
      }, INTERVAL_MS);
    }
  };

  // Initial position
  useEffect(() => {
    if (trackRef.current && count) {
      trackRef.current.scrollTo({
        left: trackRef.current.clientWidth,
        behavior: "instant",
      });
      syncActive(0);
    }
  }, [count]);

  // Track scroll position for dots
  useEffect(() => {
    const track = trackRef.current;
    if (!track || count < 2) return;

    const handleScroll = () => {
      if (!track) return;
      const slot = Math.round(track.scrollLeft / (track.clientWidth || 1));
      
      // Handle wrap-around (clones)
      if (slot === 0) {
        syncActive(count - 1);
      } else if (slot === count + 1) {
        syncActive(0);
      } else {
        syncActive(slot - 1);
      }
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => track.removeEventListener("scroll", handleScroll);
  }, [count]);

  // Detect tap vs swipe on touch devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchDuration = Date.now() - (touchStartTime.current ?? 0);
    const touchDistance = Math.abs(e.changedTouches[0].clientX - touchStartX.current);
    
    touchStartX.current = null;
    touchStartTime.current = null;

    // If it was a quick tap (not a swipe), the Link will handle navigation
    // If it was a swipe, CSS scroll-snap handles it naturally
    // Just reset auto-play timer on any touch interaction
    resetAutoPlay();
  };

  if (count <= 1) {
    const product = slides[0];
    return (
      <section className="relative left-1/2 w-screen -translate-x-1/2">
        <h1 className="sr-only">New arrivals</h1>
        <Link
          href={product ? `/shop/${product.id}` : "/shop"}
          className="relative block aspect-[1/2] w-full overflow-hidden bg-bone md:aspect-[16/8.5] md:h-full"
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
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Clone of last slide */}
        <div className="relative min-w-full snap-center" aria-hidden>
          <HeroSlide product={slides[count - 1]} index={count - 1} />
        </div>
        {slides.map((product, index) => (
          <div
            key={product.id}
            className="relative min-w-full snap-center"
          >
            <HeroSlide product={product} index={index} />
          </div>
        ))}
        {/* Clone of first slide */}
        <div className="relative min-w-full snap-center" aria-hidden>
          <HeroSlide product={slides[0]} index={0} />
        </div>
      </div>

      {/* Dots */}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1 md:bottom-5">
        {slides.map((product, index) => (
          <button
            key={product.id}
            onClick={() => {
              goToSlide(index);
              resetAutoPlay();
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

function HeroSlide({ product, index }: { product: Product; index?: number }) {
  const soldOut = !product.in_stock;
  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <Link
      href={`/shop/${product.id}`}
      className="block relative aspect-[1/2] w-full overflow-hidden bg-bone md:aspect-[16/8.5]"
      aria-label={`View ${product.name}`}
    >
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
          <span className="font-display text-4xl text-ink/15">
            {product.name.slice(0, 1).toUpperCase()}
          </span>
        </div>
      )}

      {/* Ink scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 px-3 pb-1.5 md:px-8 md:pb-6">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="eyebrow text-white/60 mb-0.5">New</p>
            <h2 className="truncate max-w-[80vw] font-display text-sm leading-tight text-white md:text-3xl">
              {product.name}
            </h2>
            <p className="mt-0.5 text-[10px] font-semibold tabular-nums text-white md:text-lg">
              {product.sale_price ? (
                <>
                  <span className="text-terracotta">{formatRs(product.sale_price)}</span>{" "}
                  <span className="text-[10px] text-white/60 line-through">{formatRs(product.price)}</span>
                </>
              ) : (
                formatRs(product.price)
              )}
              {discountPercent > 0 && (
                <span className="ml-1 rounded-full bg-terracotta px-1 py-0.5 text-[7px] font-bold uppercase tracking-[0.1em] text-white align-middle">
                  {discountPercent}% off
                </span>
              )}
            </p>
          </div>

          {soldOut ? (
            <span className="shrink-0 rounded-full border border-white/40 px-2 py-1 text-[8px] uppercase tracking-[0.2em] text-white/80">
              Sold out
            </span>
          ) : (
            <span className="btn btn-solid shrink-0 border-white/20 bg-white/95 px-2 py-1 text-[8px] text-ink hover:bg-white">
              Shop now
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
