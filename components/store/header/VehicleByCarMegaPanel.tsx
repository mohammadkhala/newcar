"use client";

import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { clientFetchVehicleModels, clientFetchVehicleYears } from "@/lib/client-api";
import type {
  VehicleBrandsResponse,
  VehicleModelRow,
  VehicleYearRow,
} from "@/lib/types";

type Props = {
  brands: VehicleBrandsResponse["brands"];
  apiConfigured: boolean;
  onNavigate: () => void;
};

export function VehicleByCarMegaPanel({ brands, apiConfigured, onNavigate }: Props) {
  const locale = useLocale();
  const [activeBrandId, setActiveBrandId] = useState<number | null>(
    brands[0]?.id ?? null,
  );
  const [activeModelId, setActiveModelId] = useState<number | null>(null);
  const [models, setModels] = useState<VehicleModelRow[]>([]);
  const [years, setYears] = useState<VehicleYearRow[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);

  const activeBrand = brands.find((b) => b.id === activeBrandId) ?? null;
  const activeModel = models.find((m) => m.id === activeModelId) ?? null;

  useEffect(() => {
    if (!brands.length) {
      setActiveBrandId(null);
      return;
    }
    setActiveBrandId((prev) =>
      prev && brands.some((b) => b.id === prev) ? prev : brands[0].id,
    );
  }, [brands]);

  useEffect(() => {
    if (!apiConfigured || !activeBrandId) {
      setModels([]);
      setYears([]);
      setActiveModelId(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoadingModels(true);
      try {
        const list = await clientFetchVehicleModels(activeBrandId, locale);
        if (cancelled) return;
        setModels(list);
        setActiveModelId(list[0]?.id ?? null);
      } finally {
        if (!cancelled) setLoadingModels(false);
      }
    })();

    return () => { cancelled = true; };
  }, [activeBrandId, apiConfigured, locale]);

  useEffect(() => {
    if (!apiConfigured || !activeModelId) {
      setYears([]);
      return;
    }

    let cancelled = false;
    void (async () => {
      setLoadingYears(true);
      try {
        const list = await clientFetchVehicleYears(activeModelId, locale);
        if (cancelled) return;
        setYears(list);
      } finally {
        if (!cancelled) setLoadingYears(false);
      }
    })();

    return () => { cancelled = true; };
  }, [activeModelId, apiConfigured, locale]);

  return (
    <div className="flex w-[min(96vw,58rem)] overflow-hidden shadow-2xl ring-1 ring-black/10">
      {!apiConfigured ? (
        <div className="w-full bg-white p-6 text-sm text-secondary/80">
          Configure API first.
        </div>
      ) : (
        <>
          {/* ── Dark brands column ── */}
          <div className="flex w-52 shrink-0 flex-col bg-[#1c1c1c]">
            <div className="border-b border-white/10 px-4 py-3">
              <Link
                href="/shop/vehicle"
                onClick={onNavigate}
                className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
              >
                حسب سيارتك ›
              </Link>
            </div>
            <ul className="max-h-[22rem] overflow-y-auto [scrollbar-color:#333_transparent] [scrollbar-width:thin]">
              {brands.map((b) => {
                const active = b.id === activeBrandId;
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => setActiveBrandId(b.id)}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? "bg-white/8 text-[#EAB308]"
                          : "text-white/65 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{b.name}</span>
                      <span
                        aria-hidden
                        className={`shrink-0 text-base leading-none ${active ? "text-[#EAB308]" : "text-white/20"}`}
                      >
                        ‹
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── Right white panel ── */}
          <div className="flex min-w-0 flex-1 divide-x divide-border-soft bg-white rtl:divide-x-reverse">

            {/* Models column */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-border-soft px-4 py-3">
                <span className="truncate text-base font-black text-secondary">
                  {activeBrand?.name ?? "—"}
                </span>
                {activeBrand && (
                  <Link
                    href={`/shop/search?vehicle_brand_id=${activeBrand.id}&offset=1`}
                    onClick={onNavigate}
                    className="shrink-0 rounded-md bg-[#EAB308] px-3 py-1.5 text-xs font-bold text-black transition hover:brightness-105"
                  >
                    تسوق الكل
                  </Link>
                )}
              </div>
              <ul className="max-h-[22rem] overflow-y-auto [scrollbar-color:var(--color-border-soft)_transparent] [scrollbar-width:thin]">
                {loadingModels ? (
                  <li className="px-4 py-3 text-sm text-secondary/50">جاري التحميل…</li>
                ) : models.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-secondary/50">لا توجد موديلات</li>
                ) : (
                  models.map((m) => {
                    const active = m.id === activeModelId;
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => setActiveModelId(m.id)}
                          className={`flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${
                            active
                              ? "bg-amber-50 text-[#EAB308]"
                              : "text-secondary/65 hover:bg-surface-muted hover:text-secondary"
                          }`}
                        >
                          <span className="truncate">{m.name}</span>
                          <span
                            aria-hidden
                            className={`shrink-0 text-base leading-none ${active ? "text-[#EAB308]" : "text-secondary/25"}`}
                          >
                            ‹
                          </span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>

            {/* Years column */}
            <div className="flex w-36 shrink-0 flex-col">
              <div className="flex min-h-[3.1rem] items-center border-b border-border-soft px-4 py-3">
                {activeModel ? (
                  <Link
                    href={`/shop/search?vehicle_brand_id=${activeBrandId ?? ""}&vehicle_model_id=${activeModel.id}&offset=1`}
                    onClick={onNavigate}
                    className="truncate text-base font-black text-secondary hover:text-primary transition-colors"
                  >
                    {activeModel.name}
                  </Link>
                ) : (
                  <span className="text-base font-black text-secondary/25">—</span>
                )}
              </div>
              <ul className="max-h-[22rem] overflow-y-auto [scrollbar-color:var(--color-border-soft)_transparent] [scrollbar-width:thin]">
                {loadingYears ? (
                  <li className="px-4 py-3 text-sm text-secondary/50">جاري التحميل…</li>
                ) : years.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-secondary/50">—</li>
                ) : (
                  years.map((y) => (
                    <li key={y.id}>
                      <Link
                        href={`/shop/search?vehicle_brand_id=${activeBrandId ?? ""}&vehicle_model_id=${activeModelId ?? ""}&vehicle_year_id=${y.id}&offset=1`}
                        onClick={onNavigate}
                        className="flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-secondary/65 transition-colors hover:bg-surface-muted hover:text-secondary"
                      >
                        <span>{y.year}</span>
                        <span aria-hidden className="shrink-0 text-base leading-none text-secondary/25">‹</span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
