"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { formatRs } from "@/lib/format";

type Props = {
  products: Product[];
};

const INTERVAL_MS = 3500;
const SLIDE_MS = 600;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function HeroCarousel({ products }: Props) {
  const slides = products.slice(0, 6);
  const count = slides.length;

  /*
    Track layout (count > 1): [clone of last, ...slides, clone of first].
    `pos` is the index within that extended list, so 1..count are the real
    slides. Sliding past either end lands on a clone, which is swapped for the
    real slide with the transition disabled — that's what makes the loop
    seamless in both directions.
  */
  const [pos, setPos] = useState(1);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [noTransition, setNoTransition] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(1);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);
  const dxRef = useRef(0);
  const movedRef = useRef(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const extended = count > 1 ? [slides[count - 1], ...slides, slides[0]] : slides;

  const moveTo = useCallback((target: number) => {
    posRef.current = target;
    setPos(target);
  }, []);

  /** Teleport without animating — used to swap a clone for its real slide. */
  const jumpTo = useCallback(
    (target: number) => {
      setNoTransition(true);
      moveTo(target);
      requestAnimationFrame(() => requestAnimationFrame(() => setNoTransition(false)));
    },
    [moveTo],
  );

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    if (count < 2 || reducedMotion) return;
    autoplayRef.current = setInterval(() => {
      if (pointerIdRef.current !== null) return; // finger down — wait for it
      const at = posRef.current;
      if (at >= count + 1) jumpTo(1); // safety: stuck on a clone
      else moveTo(at + 1);
    }, INTERVAL_MS);
  }, [count, reducedMotion, jumpTo, moveTo, stopAutoplay]);

  // Respect prefers-reduced-motion.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  // Autoplay lifecycle — paused while the tab is hidden or hovered.
  useEffect(() => {
    startAutoplay();
    const onVisibility = () => (document.hidden ? stopAutoplay() : startAutoplay());
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopAutoplay();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [startAutoplay, stopAutoplay]);

  /** Swap a clone for its real slide once the slide animation finishes. */
  const handleTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== trackRef.current || e.propertyName !== "transform") return;
    if (posRef.current <= 0) jumpTo(count);
    else if (posRef.current >= count + 1) jumpTo(1);
  };

  // ---- Drag / swipe -------------------------------------------------------

  const onPointerDown = (e: React.PointerEvent) => {
    if (count < 2 || pointerIdRef.current !== null) return;
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    startTimeRef.current = Date.now();
    dxRef.current = 0;
    movedRef.current = false;
    setDragging(true);
    stopAutoplay();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer already released — nothing to capture.
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointerIdRef.current !== e.pointerId) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 6) movedRef.current = true;
    dxRef.current = dx;
    setDragX(dx); // 1:1 finger follow
  };

  const endDrag = () => {
    if (pointerIdRef.current === null) return;
    pointerIdRef.current = null;

    const track = trackRef.current;
    const width = track?.clientWidth ?? 1;
    const dx = dxRef.current;
    const dt = Math.max(1, Date.now() - startTimeRef.current);
    const flick = Math.abs(dx) / dt > 0.55; // quick swipe, px per ms

    setDragging(false);
    setDragX(0);

    let target = posRef.current;
    if (Math.abs(dx) > Math.max(40, width * 0.15) || flick) {
      target += dx < 0 ? 1 : -1;
    }
    target = Math.min(count + 1, Math.max(0, target));
    moveTo(target); // animates from wherever the finger left it
    startAutoplay();
  };

  /** Swallow the link click that follows a swipe. */
  const onClickCapture = (e: React.MouseEvent) => {
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      movedRef.current = false;
    }
  };

  if (count <= 1) {
    const product = slides[0];
    return (
      <section className="relative left-1/2 w-screen -translate-x-1/2">
        <h1 className="sr-only">New arrivals</h1>
        {product ? (
          <HeroSlide product={product} priority />
        ) : (
          <div className="flex h-[230px] w-full flex-col items-center justify-center gap-2 bg-bone text-center">
            <p className="font-display text-xl text-ink/30">New arrivals</p>
            <p className="text-[10px] text-ink-soft">The first drop is being photographed.</p>
          </div>
        )}
      </section>
    );
  }

  const active = (((pos - 1) % count) + count) % count;

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2">
      <h1 className="sr-only">New arrivals</h1>
      <div
        className="relative h-[230px] w-full touch-pan-y select-none overflow-hidden bg-bone"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onMouseEnter={stopAutoplay}
        onMouseLeave={startAutoplay}
      >
        <div
          ref={trackRef}
          onTransitionEnd={handleTransitionEnd}
          className="flex h-full will-change-transform"
          style={{
            transform: `translate3d(calc(${-pos * 100}% + ${dragX}px), 0, 0)`,
            transition:
              dragging || noTransition || reducedMotion
                ? "none"
                : `transform ${SLIDE_MS}ms ${EASING}`,
          }}
        >
          {extended.map((product, index) => (
            <HeroSlide key={`${product.id}-${index}`} product={product} priority={index === 1} />
          ))}
        </div>

        {/* Dots */}
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex justify-center gap-1 md:bottom-5">
          {slides.map((product, index) => (
            <button
              key={product.id}
              onClick={() => moveTo(index + 1)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              className={`pointer-events-auto h-0.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                index === active ? "w-3 bg-white" : "w-0.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function HeroSlide({ product, priority = false }: { product: Product; priority?: boolean }) {
  const soldOut = !product.in_stock;
  const discountPercent = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  return (
    <Link
      href={`/shop/${product.id}`}
      aria-label={`View ${product.name}`}
      draggable={false}
      className="relative block h-[230px] w-full shrink-0 overflow-hidden bg-bone"
    >
      {product.image_url ? (
        <>
          {/* Soft blurred copy fills the side gaps so nothing looks cut off. */}
          <Image
            src={product.image_url}
            alt=""
            aria-hidden
            fill
            sizes="100vw"
            loading={priority ? "eager" : "lazy"}
            draggable={false}
            className="scale-110 object-cover opacity-60 blur-2xl"
          />
          {/* The photo in full — contained, never cropped. */}
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="100vw"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            draggable={false}
            className="object-contain"
          />
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-display text-4xl text-ink/15">
            {product.name.slice(0, 1).toUpperCase()}
          </span>
        </div>
      )}

      {/* Dark scrim only at bottom for text */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 px-2 pb-1">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate max-w-[85vw] font-display text-[11px] leading-tight text-white">
              {product.name}
            </h2>
            <p className="mt-0.5 text-[9px] font-semibold tabular-nums text-white">
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
