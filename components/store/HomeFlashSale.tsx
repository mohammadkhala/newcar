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
      <div className="store-card overflow-hidden border-primary/25 bg-linear-to-br from-primary/8 to-white">
        <div className="flex flex-col gap-4 border-b border-border-soft px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black text-secondary md:text-2xl">
              {data.flash_sale?.title?.trim() ? data.flash_sale.title : t("title")}
            </h2>
            <p className="mt-1 text-sm text-secondary/80">{t("homeSubtitle")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {showCountdown ? <FlashCountdown endMs={endMs} /> : null}
            <Link
              href="/shop/flash-sale"
              className="store-btn-primary inline-flex items-center justify-center px-5 text-sm"
            >
              {t("viewAll")}
            </Link>
          </div>
        </div>
        {products.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {products.slice(0, 6).map((p) => (
              <li key={p.id}>
                <ProductCard product={p} currencyCode={currencyCode} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 pb-5 text-sm text-secondary/75">{tHome("emptySection")}</p>
        )}
      </div>
    </section>
  );
}
