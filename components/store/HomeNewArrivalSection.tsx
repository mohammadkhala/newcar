"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import type { StoreProductListItem } from "@/lib/types";

type Props = {
  products: StoreProductListItem[];
  currencyCode: string;
  backgroundSrc?: string | null;
};

/** Normalized scroll position (0 = start, max = end) for LTR and RTL tracks. */
function getScrollMetrics(el: HTMLElement) {
  const max = Math.max(0, el.scrollWidth - el.clientWidth);
  if (max <= 0) {
    return { position: 0, max: 0 };
  }

  const dir = getComputedStyle(el).direction;
  if (dir === "rtl") {
    const raw = el.scrollLeft;
    if (raw < 0) {
      return { position: -raw, max };
    }
    return { position: max - raw, max };
  }

  return { position: el.scrollLeft, max };
}

/**
 * Home "New arrivals" strip — hala-car block-bg-01 / product-list-style-25 carousel.
 */
export function HomeNewArrivalSection({
  products,
  currencyCode,
  backgroundSrc,
}: Props) {
  const t = useTranslations("Home.newArrivalSection");
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);

  const updateNav = useCallback(() => {
    const el = trackRef.current;
    if (!el) {
      setCanPrev(false);
      setCanNext(false);
      setNeedsScroll(false);
      return;
    }

    const { position, max } = getScrollMetrics(el);
    const overflow = max > 4;
    setNeedsScroll(overflow);
    setCanPrev(overflow && position > 4);
    setCanNext(overflow && position < max - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) {
      return;
    }

    const runUpdate = () => {
      requestAnimationFrame(updateNav);
    };

    runUpdate();
    el.addEventListener("scroll", updateNav, { passive: true });
    el.addEventListener("scrollend", updateNav, { passive: true });

    const ro = new ResizeObserver(runUpdate);
    ro.observe(el);

    const imgs = el.querySelectorAll("img");
    imgs.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", runUpdate, { once: true });
      }
    });

    return () => {
      el.removeEventListener("scroll", updateNav);
      el.removeEventListener("scrollend", updateNav);
      ro.disconnect();
    };
  }, [products.length, updateNav]);

  function scrollStep(direction: -1 | 1) {
    const el = trackRef.current;
    if (!el) {
      return;
    }
    const slide = el.querySelector<HTMLElement>("[data-carousel-slide]");
    const gap = parseFloat(getComputedStyle(el).gap || "0") || 16;
    const step = slide ? slide.offsetWidth + gap : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
    el.addEventListener("scrollend", updateNav, { once: true });
    window.setTimeout(updateNav, 400);
  }

  if (products.length === 0) {
    return null;
  }

  const bgStyle = backgroundSrc
    ? { backgroundImage: `url("${backgroundSrc}")` }
    : undefined;

  return (
    <section
      className="home-new-arrival block-bg-01 overlay-dark space-lg"
      style={bgStyle}
      aria-label={t("title")}
    >
      <div className="home-new-arrival-inner store-shell">
        <div className="cdz-block-title text-center">
          <h2 className="text-2xl font-black md:text-3xl">{t("title")}</h2>
          <p className="title-desc mx-auto mt-2 max-w-2xl text-sm md:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="home-new-arrival-carousel relative mt-8">
          {needsScroll ? (
            <button
              type="button"
              className="home-new-arrival-nav home-new-arrival-nav-prev"
              onClick={() => scrollStep(-1)}
              disabled={!canPrev}
              aria-label={t("prev")}
            >
              <span aria-hidden>‹</span>
            </button>
          ) : null}

          <div
            ref={trackRef}
            className="home-new-arrival-track mb-stage-padding"
            dir="ltr"
            role="list"
          >
            {products.map((product) => (
              <div
                key={product.id}
                role="listitem"
                data-carousel-slide
                className="home-new-arrival-slide"
              >
                <ProductCard product={product} currencyCode={currencyCode} />
              </div>
            ))}
          </div>

          {needsScroll ? (
            <button
              type="button"
              className="home-new-arrival-nav home-new-arrival-nav-next"
              onClick={() => scrollStep(1)}
              disabled={!canNext}
              aria-label={t("next")}
            >
              <span aria-hidden>›</span>
            </button>
          ) : null}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/shop/search?sort_by=new_arrival&offset=1"
            className="home-new-arrival-view-all"
          >
            {t("viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
