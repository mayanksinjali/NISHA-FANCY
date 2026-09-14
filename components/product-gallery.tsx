"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Props = {
  productName: string;
  images: string[];
};

export default function ProductGallery({ productName, images }: Props) {
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);
  const didSwipe = useRef(false);

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center bg-bone">
        <span className="font-display text-7xl text-ink/15">
          {productName.slice(0, 1).toUpperCase()}
        </span>
      </div>
    );
  }

  const displayedImage = images[displayedIndex];

  function handleTouchStart(event: React.TouchEvent<HTMLButtonElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    didSwipe.current = false;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLButtonElement>) {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (startX === null || endX === undefined || Math.abs(endX - startX) < 40) return;
    didSwipe.current = true;
    setDisplayedIndex((current) =>
      endX < startX
        ? (current + 1) % images.length
        : (current - 1 + images.length) % images.length,
    );
  }

  return (
    <>
      <div className="w-full max-w-[560px]">
        <button
          type="button"
          onClick={() => {
            if (!didSwipe.current) setSelectedImage(displayedImage);
            didSwipe.current = false;
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label={`View ${productName} photo enlarged`}
          className="relative block w-full cursor-zoom-in overflow-hidden rounded-md bg-bone text-left"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[4/5]">
            <div
              className="flex h-full transition-transform duration-500 ease-out will-change-transform"
              style={{ transform: `translate3d(-${displayedIndex * 100}%, 0, 0)` }}
            >
              {images.map((image, index) => (
                <div key={image} className="relative h-full min-w-full shrink-0">
                  <Image
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 768px) 46vw, 100vw"
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-paper">
            {displayedIndex + 1}/{images.length}
          </div>
        </button>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-wine-deep/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} enlarged photo`}
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            aria-label="Close enlarged photo"
            className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-md border border-paper/40 text-2xl text-paper"
          >
            ×
          </button>
          <div
            className="relative h-[min(82svh,720px)] w-[min(92vw,720px)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt={productName}
              fill
              sizes="92vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
