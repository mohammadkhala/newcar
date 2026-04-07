"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href.trim());
}

function internalPath(href: string): string {
  const t = href.trim();
  return t.startsWith("/") ? t : `/${t}`;
}

export type HomeHeroSlide = {
  key: string;
  src: string;
  alt: string;
  href?: string | null;
};

type Props = {
  slides: HomeHeroSlide[];
};

/**
 * Full-width horizontal snap carousel for home banner images from the API.
 */
export function HomeHeroCarousel({ slides }: Props) {
  const t = useTranslations("Home");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollByDir = useCallback((direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    const w = el.clientWidth;
    const rtl = document.documentElement.getAttribute("dir") === "rtl";
    const delta = rtl ? -direction : direction;
    el.scrollBy({ left: delta * w, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      const el = scrollerRef.current;
      if (!el) {
        return;
      }
      const next = (activeIndex + 1) % slides.length;
      const width = el.clientWidth;
      el.scrollTo({ left: width * next, behavior: "smooth" });
      setActiveIndex(next);
    }, 4500);

    return () => window.clearInterval(timer);
  }, [activeIndex, slides.length]);

  if (slides.length === 0) {
    return null;
  }

  function jumpTo(index: number) {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    el.scrollTo({ left: el.clientWidth * index, behavior: "smooth" });
    setActiveIndex(index);
  }

  return (
    <section className="w-full bg-black" aria-label={t("sections.banners")}>
      <div className="relative w-full">
        <div
          ref={scrollerRef}
          className="flex touch-pan-x snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((s) => {
            const inner = (
              <div className="relative aspect-[2/1] max-h-[min(52vh,560px)] min-h-[200px] w-full bg-surface-muted">
                {/* eslint-disable-next-line @next/next/no-img-element -- remote Laravel URLs */}
                <img
                  src={s.src}
                  alt={s.alt}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/35 via-black/10 to-transparent" />
              </div>
            );
            return (
              <div
                key={s.key}
                className="w-full min-w-full shrink-0 snap-start snap-always"
              >
                {s.href ? (
                  isExternalHref(s.href) ? (
                    <a
                      href={s.href.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link
                      href={internalPath(s.href)}
                      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {inner}
                    </Link>
                  )
                ) : (
                  inner
                )}
              </div>
            );
          })}
        </div>
        {slides.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => scrollByDir(-1)}
              className="absolute start-3 top-1/2 z-10 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-white/90 text-lg text-secondary shadow-sm transition-colors hover:bg-white"
              aria-label={t("heroPrev")}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scrollByDir(1)}
              className="absolute end-3 top-1/2 z-10 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-white/90 text-lg text-secondary shadow-sm transition-colors hover:bg-white"
              aria-label={t("heroNext")}
            >
              ›
            </button>
            <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-1">
              {slides.map((slide, idx) => (
                <button
                  key={slide.key}
                  type="button"
                  onClick={() => jumpTo(idx)}
                  aria-label={`${t("sections.banners")} ${idx + 1}`}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span
                    className={`block h-3 w-3 rounded-full ${
                      activeIndex === idx ? "bg-primary" : "bg-white/80"
                    }`}
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
