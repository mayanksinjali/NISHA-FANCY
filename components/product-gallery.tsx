"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  productName: string;
  images: string[];
};

export default function ProductGallery({ productName, images }: Props) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center bg-bone">
        <span className="font-display text-7xl text-ink/15">
          {productName.slice(0, 1).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="grid max-w-md grid-cols-4 gap-2 sm:max-w-lg">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveImage(image)}
            aria-label={`View ${productName} photo ${index + 1}`}
            className="group relative aspect-square overflow-hidden rounded-md bg-bone text-left"
          >
            <Image
              src={image}
              alt={`${productName} ${index + 1}`}
              fill
              priority={index === 0}
              sizes="(min-width: 768px) 140px, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </button>
        ))}
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/90 p-4"
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
