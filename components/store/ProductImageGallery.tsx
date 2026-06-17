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

  function goPrev() {
    setActiveIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function goNext() {
    setActiveIdx((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="store-card overflow-hidden p-0">
      {/* Slider — always LTR so translateX works consistently in RTL pages */}
      <div className="relative aspect-square overflow-hidden bg-surface-muted" dir="ltr">
        {/* Film strip */}
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{
            width: `${images.length * 100}%`,
            transform: `translateX(-${activeIdx * (100 / images.length)}%)`,
          }}
        >
          {images.map((src, i) => (
            <div
              key={src}
              className="relative h-full shrink-0"
              style={{ width: `${100 / images.length}%` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={i === activeIdx ? alt : ""}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="السابق"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="التالي"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                aria-label={`صورة ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === activeIdx ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                i === activeIdx
                  ? "scale-105 border-primary shadow-md"
                  : "border-border-soft opacity-60 hover:border-primary/50 hover:opacity-100"
              }`}
              aria-label={`${alt} ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
