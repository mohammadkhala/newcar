"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type { VehicleBrandsResponse } from "@/lib/types";
import { availableFirst, hasProducts } from "@/lib/vehicle-availability";

type Props = {
  brands: VehicleBrandsResponse["brands"];
  activeBrandId?: string;
  /** Current text search, kept when switching brands. */
  searchName?: string;
};

function brandHref(brandId: number | null, searchName?: string): string {
  // Brand-only: clear model/year so the grid shows every product for this brand.
  const q = new URLSearchParams();
  if (searchName) q.set("name", searchName);
  if (brandId !== null) q.set("vehicle_brand_id", String(brandId));
  if (q.size === 0) return `/shop/search`;
  q.set("offset", "1");
  return `/shop/search?${q.toString()}`;
}

export function VehicleBrandSlider({ brands: rawBrands, activeBrandId, searchName }: Props) {
  const t = useTranslations("VehiclePicker");
  const brands = availableFirst(rawBrands);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const autoIndexRef = useRef(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || brands.length === 0) return;

    let paused = false;

    const tick = () => {
      if (paused) return;
      const items = el.querySelectorAll<HTMLElement>(":scope > a");
      if (items.length === 0) return;
      autoIndexRef.current = (autoIndexRef.current + 1) % items.length;
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
          const available = hasProducts(brand);
          const src = resolveMediaUrl(
            brand.image_full_url ?? brand.image ?? null,
            { defaultFolder: "vehicle-brand" },
          );
          const inner = (
            <>
              {src ? (
                <div className="flex h-14 w-[4.5rem] items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={brand.name}
                    width={72}
                    height={56}
                    className="max-h-14 w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/logo.png";
                      e.currentTarget.className = "max-h-10 w-auto object-contain opacity-50";
                    }}
                  />
                </div>
              ) : (
                <div className="flex h-14 w-[4.5rem] items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="" className="max-h-12 w-auto object-contain opacity-50" />
                </div>
              )}
              <span
                className={`max-w-[4.5rem] truncate text-center text-xs font-bold ${
                  active ? "text-primary" : "text-black"
                }`}
              >
                {brand.name}
              </span>
              {!available && (
                <span className="text-[10px] font-semibold text-secondary/60">{t("comingSoon")}</span>
              )}
            </>
          );
          if (!available) {
            return (
              <div
                key={brand.id}
                aria-disabled="true"
                title={t("comingSoon")}
                className="flex shrink-0 cursor-not-allowed snap-start flex-col items-center gap-1.5 rounded-xl border-2 border-border-soft bg-white px-3 py-2 opacity-45 grayscale"
              >
                {inner}
              </div>
            );
          }
          return (
            <Link
              key={brand.id}
              href={brandHref(active ? null : brand.id, searchName)}
              className={`flex shrink-0 snap-start flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-2 transition-all ${
                active
                  ? "border-primary bg-primary/5"
                  : "border-border-soft bg-white hover:border-primary/30 hover:bg-surface-muted"
              }`}
            >
              {inner}
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
