"use client";

import { useState } from "react";

type Props = {
  images: string[];
  alt: string;
  noImageLabel: string;
};

export function ProductImageGallery({ images, alt, noImageLabel }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (images.length === 0) {
    return (
      <div className="store-card flex aspect-square items-center justify-center bg-surface-muted text-sm text-secondary/50">
        {noImageLabel}
      </div>
    );
  }

  const active = images[activeIdx];

  return (
    <div className="store-card overflow-hidden p-0">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden bg-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={active}
          src={active}
          alt={alt}
          className="h-full w-full object-cover transition-opacity duration-300 animate-in fade-in"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === activeIdx
                  ? "border-primary shadow-md"
                  : "border-border-soft opacity-70 hover:border-primary/50 hover:opacity-100"
              }`}
              aria-label={`${alt} ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
