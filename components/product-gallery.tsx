"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  productName: string;
  images: string[];
};

export default function ProductGallery({ productName, images }: Props) {
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);
  /* Indices of photos that failed to load — they render as placeholders. */
  const [failed, setFailed] = useState<Set<number>>(new Set());

  const markFailed = (index: number) =>
    setFailed((current) => {
      if (current.has(index)) return current;
      const next = new Set(current);
      next.add(index);
      return next;
    });

  const go = useCallback(
    (step: number) => {
      setDisplayedIndex(
        (current) => (current + step + images.length) % images.length,
      );
    },
    [images.length],
  );

  /* Escape closes fullscreen; arrows navigate while it's open. */
  useEffect(() => {
    if (!fullscreenOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreenOpen(false);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fullscreenOpen, go]);

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center bg-bone">
        <span className="font-display text-7xl text-ink/15">
          {productName.slice(0, 1).toUpperCase()}
        </span>
      </div>
    );
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    didSwipe.current = false;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (startX === null || endX === undefined || Math.abs(endX - startX) < 40) return;
    didSwipe.current = true;
    go(endX < startX ? 1 : -1);
  }

  const multiple = images.length > 1;

  return (
    <>
      <div className="w-full max-w-[560px]">
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!didSwipe.current) setFullscreenOpen(true);
            didSwipe.current = false;
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setFullscreenOpen(true);
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label={`View ${productName} photos`}
          className="relative block w-full cursor-zoom-in overflow-hidden rounded-3xl bg-bone text-left"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[4/5]">
            <div
              className="flex h-full transition-transform duration-500 ease-out will-change-transform"
              style={{ transform: `translate3d(-${displayedIndex * 100}%, 0, 0)` }}
            >
              {images.map((image, index) => (
                <div key={image} className="relative h-full min-w-full shrink-0">
                  {failed.has(index) ? (
                    <div className="flex h-full w-full items-center justify-center bg-bone">
                      <span className="font-display text-7xl text-ink/15">
                        {productName.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    // Hidden slides stay lazy; the active photo renders eager.
                    <Image
                      src={image}
                      alt={`${productName} ${index + 1}`}
                      fill
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                      sizes="(min-width: 768px) 46vw, 100vw"
                      onError={() => markFailed(index)}
                      className="object-contain"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Counter */}
          {multiple && (
            <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-paper">
              {displayedIndex + 1}/{images.length}
            </div>
          )}

          {/* Prev / next arrows — usable on desktop, hidden while swiping on touch via CSS hover only */}
          {multiple && (
            <>
              <span
                role="button"
                tabIndex={-1}
                aria-label="Previous photo"
                onClick={(event) => {
                  event.stopPropagation();
                  didSwipe.current = true; // a tap on the arrow must not open fullscreen
                  go(-1);
                }}
                className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-ink shadow-md transition-colors hover:bg-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </span>
              <span
                role="button"
                tabIndex={-1}
                aria-label="Next photo"
                onClick={(event) => {
                  event.stopPropagation();
                  didSwipe.current = true;
                  go(1);
                }}
                className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-ink shadow-md transition-colors hover:bg-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </span>
            </>
          )}
        </div>
      </div>

      {/* ---------- Fullscreen viewer ---------- */}
      {fullscreenOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-wine-deep/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} enlarged photo`}
          onClick={() => setFullscreenOpen(false)}
        >
          <button
            type="button"
            onClick={() => setFullscreenOpen(false)}
            aria-label="Close enlarged photo"
            className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-md border border-paper/40 text-2xl text-paper"
          >
            ×
          </button>

          <div
            className="relative h-[min(82svh,720px)] w-[min(92vw,720px)]"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {failed.has(displayedIndex) ? (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-7xl text-paper/30">
                  {productName.slice(0, 1).toUpperCase()}
                </span>
              </div>
            ) : (
              <Image
                src={images[displayedIndex]}
                alt={`${productName} ${displayedIndex + 1}`}
                fill
                sizes="92vw"
                onError={() => markFailed(displayedIndex)}
                className="object-contain"
              />
            )}
          </div>

          {multiple && (
            <>
              <span
                role="button"
                tabIndex={-1}
                aria-label="Previous photo"
                onClick={(event) => {
                  event.stopPropagation();
                  go(-1);
                }}
                className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-ink shadow-md transition-colors hover:bg-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </span>
              <span
                role="button"
                tabIndex={-1}
                aria-label="Next photo"
                onClick={(event) => {
                  event.stopPropagation();
                  go(1);
                }}
                className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/85 text-ink shadow-md transition-colors hover:bg-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </span>

              {/* Dot indicators */}
              <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {images.map((image, index) => (
                  <span
                    key={image}
                    role="button"
                    tabIndex={-1}
                    aria-label={`Go to photo ${index + 1}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setDisplayedIndex(index);
                    }}
                    className={`h-2 w-2 cursor-pointer rounded-full transition-colors ${
                      index === displayedIndex ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
