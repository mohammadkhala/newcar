"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type { VehicleBrandsResponse } from "@/lib/types";

type Props = {
  brands: VehicleBrandsResponse["brands"];
  activeBrandId?: string;
};

function brandHref(brandId: number | null): string {
  if (brandId === null) return `/shop/search`;
  return `/shop/search?vehicle_brand_id=${brandId}&offset=1`;
}

export function VehicleBrandSlider({ brands, activeBrandId }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const autoIndexRef = useRef(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || brands.length === 0) return;

    let paused = false;

    const tick = () => {
      if (paused) return;
      autoIndexRef.current = (autoIndexRef.current + 1) % brands.length;
      const items = el.querySelectorAll<HTMLElement>(":scope > a");
      const item = items[autoIndexRef.current];
      if (item) {
        el.scrollTo({
          left: item.offsetLeft - (el.clientWidth - item.clientWidth) / 2,
          behavior: "smooth",
        });
      }
    };

    const id = setInterval(tick, 2500);
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };

    el.addEventListener("mouseenter", pause);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchend", resume, { passive: true });

    return () => {
      clearInterval(id);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchend", resume);
    };
  }, [brands.length]);

  if (brands.length === 0) return null;

  function scrollBy(delta: number) {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <div className="store-card relative overflow-hidden px-8 py-3 md:py-4">
      <button
        type="button"
        onClick={() => scrollBy(-280)}
        aria-hidden
        tabIndex={-1}
        suppressHydrationWarning
        className="absolute start-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-white text-secondary shadow-sm hover:bg-surface-muted"
      >
        ‹
      </button>

      <div
        ref={scrollerRef}
        className="flex snap-x gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {brands.map((brand) => {
          const active = activeBrandId === String(brand.id);
          const src = resolveMediaUrl(
            brand.image_full_url ?? brand.image ?? null,
            { defaultFolder: "vehicle-brand" },
          );
          return (
            <Link
              key={brand.id}
              href={brandHref(active ? null : brand.id)}
              className={`flex shrink-0 snap-start flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-2 transition-all ${
                active
                  ? "border-primary bg-primary/5"
                  : "border-border-soft bg-white hover:border-primary/30 hover:bg-surface-muted"
              }`}
            >
              {src ? (
                <div className="flex h-14 w-[4.5rem] items-center justify-center">
                  <Image
                    src={src}
                    alt={brand.name}
                    width={72}
                    height={56}
                    unoptimized
                    className="max-h-14 w-full object-contain"
                  />
                </div>
              ) : (
                <span
                  className={`inline-flex h-14 w-[4.5rem] items-center justify-center rounded-lg text-lg font-bold ${
                    active ? "text-primary" : "text-secondary/50"
                  }`}
                >
                  {[...brand.name].find((c) => /\S/u.test(c)) ?? "?"}
                </span>
              )}
              <span
                className={`max-w-[4.5rem] truncate text-center text-xs font-semibold ${
                  active ? "text-primary" : "text-secondary"
                }`}
              >
                {brand.name}
              </span>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(280)}
        aria-hidden
        tabIndex={-1}
        suppressHydrationWarning
        className="absolute end-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border-soft bg-white text-secondary shadow-sm hover:bg-surface-muted"
      >
        ›
      </button>
    </div>
  );
}
