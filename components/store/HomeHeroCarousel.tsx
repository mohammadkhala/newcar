"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
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

export function HomeHeroCarousel({ slides }: Props) {
  const t = useTranslations("Home");
  const [activeIndex, setActiveIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(() => {
      if (!pausedRef.current) {
        setActiveIndex((prev) => (prev + 1) % slides.length);
      }
    }, 4500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className="w-full bg-black"
      aria-label={t("sections.banners")}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onTouchStart={() => {
        pausedRef.current = true;
      }}
      onTouchEnd={() => {
        pausedRef.current = false;
      }}
    >
      <div className="relative w-full overflow-hidden" dir="ltr">
        {/* Film strip — always LTR so translateX is consistent */}
        <div
          dir="ltr"
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${activeIndex * (100 / slides.length)}%)`,
          }}
        >
          {slides.map((s, idx) => {
            const nearActive =
              Math.abs(idx - activeIndex) <= 1 ||
              (activeIndex === 0 && idx === slides.length - 1) ||
              (activeIndex === slides.length - 1 && idx === 0);

            const inner = (
              <div className="relative aspect-[2/1] max-h-[min(52vh,560px)] min-h-[200px] w-full bg-surface-muted">
                {nearActive ? (
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    sizes="100vw"
                    priority={idx === 0}
                    fetchPriority={idx === 0 ? "high" : "auto"}
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-surface-muted" aria-hidden />
                )}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-black/35 via-black/10 to-transparent" />
              </div>
            );
            return (
              <div
                key={s.key}
                className="shrink-0"
                style={{ width: `${100 / slides.length}%` }}
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

        {/* Dot indicators */}
        {slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-1">
            {slides.map((slide, idx) => (
              <button
                key={slide.key}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`${t("sections.banners")} ${idx + 1}`}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    activeIndex === idx
                      ? "h-3 w-6 bg-primary"
                      : "h-3 w-3 bg-white/80"
                  }`}
                  aria-hidden
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
