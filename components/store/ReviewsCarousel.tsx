"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Review = {
  id?: number;
  rating?: number;
  comment?: string;
  customer?: { f_name?: string; l_name?: string };
};

type Props = {
  reviews: Review[];
  anonymousReviewer: string;
  outOf5: string;
};

const STAR = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";
const INTERVAL = 4000;

export function ReviewsCarousel({ reviews, anonymousReviewer, outOf5 }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeRef = useRef(0);
  const listRef = useRef<HTMLUListElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollTo = useCallback((idx: number) => {
    const el = listRef.current;
    if (!el) return;
    const card = el.children[idx] as HTMLElement | undefined;
    if (!card) return;
    el.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    activeRef.current = idx;
    setActiveIdx(idx);
  }, []);

  const goNext = useCallback(() => {
    scrollTo(activeRef.current >= reviews.length - 1 ? 0 : activeRef.current + 1);
  }, [reviews.length, scrollTo]);

  const goPrev = useCallback(() => {
    scrollTo(activeRef.current <= 0 ? reviews.length - 1 : activeRef.current - 1);
  }, [reviews.length, scrollTo]);

  // Auto-play
  useEffect(() => {
    if (paused || reviews.length <= 1) return;
    timerRef.current = setInterval(goNext, INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, reviews.length, goNext]);

  if (reviews.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Prev arrow */}
      {reviews.length > 1 && (
        <button
          type="button"
          onClick={goPrev}
          aria-label="السابق"
          className="absolute -start-3 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-surface shadow-md border border-border-soft text-secondary/70 transition hover:text-primary hover:border-primary"
        >
          <svg className="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Cards strip — dir=ltr so scrollLeft is consistent regardless of page direction */}
      <ul
        ref={listRef}
        dir="ltr"
        className="flex gap-4 overflow-x-auto scroll-smooth px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((row, i) => (
          <li
            key={row.id ?? i}
            dir="rtl"
            className={`store-panel w-60 shrink-0 space-y-3 p-4 transition-all duration-300 ${
              i === activeIdx ? "ring-2 ring-primary/30 shadow-md" : "opacity-80"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/review-icon.svg" alt="" width={40} height={40} className="h-10 w-10 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-secondary">
                  {[row.customer?.f_name, row.customer?.l_name].filter(Boolean).join(" ") || anonymousReviewer}
                </p>
                {row.rating != null && (
                  <div className="mt-0.5 flex gap-0.5" aria-label={`${row.rating} ${outOf5}`}>
                    {Array.from({ length: 5 }, (_, si) => (
                      <svg key={si} className={`h-3.5 w-3.5 ${si < row.rating! ? "text-amber-400" : "text-border-soft"}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d={STAR} />
                      </svg>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {row.comment && (
              <p className="line-clamp-4 text-sm leading-relaxed text-secondary/75">{row.comment}</p>
            )}
          </li>
        ))}
      </ul>

      {/* Next arrow */}
      {reviews.length > 1 && (
        <button
          type="button"
          onClick={goNext}
          aria-label="التالي"
          className="absolute -end-3 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-surface shadow-md border border-border-soft text-secondary/70 transition hover:text-primary hover:border-primary"
        >
          <svg className="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Dots */}
      {reviews.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {reviews.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`تقييم ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === activeIdx ? "w-5 bg-primary" : "w-1.5 bg-border-soft hover:bg-primary/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
