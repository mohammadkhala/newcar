"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import type { FlashSaleResponse } from "@/lib/types";

type Props = {
  data: FlashSaleResponse | null;
  currencyCode: string;
};

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function FlashCountdown({ endMs }: { endMs: number }) {
  const t = useTranslations("Flash");
  /** null until mount — avoids SSR/client mismatch from Date.now() in initial state. */
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (!cancelled) {
        setNow(Date.now());
      }
    };
    const start = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, []);

  const left = useMemo(() => {
    const t0 = now ?? endMs;
    const diff = Math.max(0, endMs - t0);
    const s = Math.floor(diff / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return { h, m, sec };
  }, [endMs, now]);

  const display =
    now === null ? "--:--:--" : `${pad2(left.h)}:${pad2(left.m)}:${pad2(left.sec)}`;

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-md"
      aria-live="polite"
    >
      <span className="text-white/80">{t("endsIn")}</span>
      <span className="tabular-nums tracking-wide">{display}</span>
    </div>
  );
}

/**
 * Home flash-sale strip: countdown when end date exists and a compact product grid with link to the full flash page.
 */
export function HomeFlashSale({ data, currencyCode }: Props) {
  const t = useTranslations("Flash");
  const tHome = useTranslations("Home");

  if (!data) {
    return null;
  }
  const products = data.products ?? [];
  if (products.length === 0 && !data.flash_sale) {
    return null;
  }

  const endRaw = data.flash_sale?.end_date;
  const endMs = endRaw ? Date.parse(endRaw) : NaN;
  const showCountdown = Number.isFinite(endMs);

  return (
    <section className="store-shell py-8">
      <div
        className="relative overflow-hidden rounded-2xl shadow-xl"
        style={{
          background:
            "linear-gradient(160deg, #1a0800 0%, #4a1200 35%, #c0380a 70%, #e35e26 100%)",
        }}
      >
        {/* decorative blurred orbs */}
        <span
          aria-hidden
          className="pointer-events-none absolute -start-16 top-0 h-64 w-64 rounded-full bg-white/5 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -end-10 bottom-0 h-48 w-48 rounded-full bg-orange-300/10 blur-3xl"
        />

        {/* Header */}
        <div className="relative flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden>⚡</span>
            <div>
              <h2 className="text-xl font-black text-white md:text-2xl drop-shadow">
                {data.flash_sale?.title?.trim() ? data.flash_sale.title : t("title")}
              </h2>
              <p className="mt-0.5 text-sm text-orange-200/80">{t("homeSubtitle")}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {showCountdown ? <FlashCountdown endMs={endMs} /> : null}
            <Link
              href="/shop/flash-sale"
              className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-2 text-sm font-bold text-primary shadow transition-opacity hover:opacity-90"
            >
              {t("viewAll")}
            </Link>
          </div>
        </div>

        {/* Products grid — semi-transparent cards on gradient */}
        <div className="relative border-t border-white/10">
          {products.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {products.slice(0, 6).map((p) => (
                <li key={p.id} className="[&>article]:rounded-xl [&>article]:bg-white/95 [&>article]:shadow-md">
                  <ProductCard product={p} currencyCode={currencyCode} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-5 text-sm text-white/70">{tHome("emptySection")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
