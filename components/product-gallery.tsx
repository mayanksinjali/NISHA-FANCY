"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  productName: string;
  images: string[];
};

export default function ProductGallery({ productName, images }: Props) {
  const [activeImage, setActiveImage] = useState<string | null>(images[0] ?? null);

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center bg-bone">
        <span className="font-display text-7xl text-ink/15">
          {productName.slice(0, 1).toUpperCase()}
        </span>
      </div>
    );
  }

  const activeIndex = images.findIndex((image) => image === activeImage);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;

  return (
    <>
      <div className="w-full max-w-[560px]">
        <div className="relative overflow-hidden rounded-md bg-bone">
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            <Image
              src={images[safeIndex]}
              alt={`${productName} ${safeIndex + 1}`}
              fill
              priority={safeIndex === 0}
              sizes="(min-width: 768px) 46vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-paper">
            {safeIndex + 1}/{images.length}
          </div>
        </div>
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-wine-deep/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} enlarged photo`}
          onClick={() => setActiveImage(null)}
        >
          <button
            type="button"
            onClick={() => setActiveImage(null)}
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
              src={activeImage}
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
