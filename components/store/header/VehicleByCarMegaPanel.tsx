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
        if (!cancelled) {
          setLoadingModels(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
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
        if (!cancelled) {
          setLoadingYears(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeModelId, apiConfigured, locale]);

  const itemBaseClass =
    "flex min-h-[3.25rem] items-center justify-between gap-2 px-5 py-2 text-[1.06rem] font-semibold tracking-tight transition-colors";

  return (
    <div className="w-[min(96vw,68rem)] overflow-hidden border border-border-soft bg-white shadow-lg">
      {!apiConfigured ? (
        <div className="p-6 text-sm text-secondary/80">Configure API first.</div>
      ) : (
        <div className="grid grid-cols-3 divide-x divide-border-soft rtl:divide-x-reverse">
          <section className="min-w-0">
            <div className="border-b border-border-soft px-5 py-3.5">
              <Link
                href="/shop/vehicle"
                className="inline-flex items-center gap-2 text-[1.25rem] font-black text-secondary hover:text-primary"
                onClick={onNavigate}
              >
                <span aria-hidden className="text-sm">
                  ↖
                </span>
                <span>اذهب إلى حسب سيارتك</span>
              </Link>
            </div>
            <ul className="max-h-[24rem] overflow-y-auto">
              {brands.map((b) => {
                const active = b.id === activeBrandId;
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      className={`${itemBaseClass} ${
                        active
                          ? "text-[#EAB308]"
                          : "text-secondary/45 hover:bg-surface-muted hover:text-secondary/80"
                      }`}
                      onClick={() => setActiveBrandId(b.id)}
                    >
                      <span className="truncate">{b.name}</span>
                      <span
                        aria-hidden
                        className={active ? "text-[#EAB308]" : "text-secondary/40"}
                      >
                        ‹
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="min-w-0">
            <div className="border-b border-border-soft px-5 py-3.5">
              {activeBrand ? (
                <Link
                  href={`/shop/search?vehicle_brand_id=${activeBrand.id}&offset=1`}
                  className="inline-flex items-center gap-2 text-[1.25rem] font-black text-secondary hover:text-primary"
                  onClick={onNavigate}
                >
                  <span aria-hidden className="text-sm">
                    ↖
                  </span>
                  <span>اذهب إلى {activeBrand.name}</span>
                </Link>
              ) : (
                <p className="inline-flex items-center gap-2 text-[1.25rem] font-black text-secondary">
                  <span aria-hidden className="text-sm">
                    ↖
                  </span>
                  <span>اذهب إلى ...</span>
                </p>
              )}
            </div>
            <ul className="max-h-[24rem] overflow-y-auto">
              {loadingModels ? (
                <li className="px-4 py-3 text-sm text-secondary/60">Loading...</li>
              ) : models.length === 0 ? (
                <li className="px-4 py-3 text-sm text-secondary/60">No models</li>
              ) : (
                models.map((m) => {
                  const active = m.id === activeModelId;
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        className={`${itemBaseClass} ${
                          active
                            ? "text-[#EAB308]"
                            : "text-secondary/45 hover:bg-surface-muted hover:text-secondary/80"
                        }`}
                        onClick={() => setActiveModelId(m.id)}
                      >
                        <span className="truncate">{m.name}</span>
                        <span
                          aria-hidden
                          className={active ? "text-[#EAB308]" : "text-secondary/40"}
                        >
                          ‹
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </section>

          <section className="min-w-0">
            <div className="border-b border-border-soft px-5 py-3.5">
              {activeModel ? (
                <Link
                  href={`/shop/search?vehicle_brand_id=${activeBrandId ?? ""}&vehicle_model_id=${activeModel.id}&offset=1`}
                  className="inline-flex items-center gap-2 text-[1.25rem] font-black text-secondary hover:text-primary"
                  onClick={onNavigate}
                >
                  <span aria-hidden className="text-sm">
                    ↖
                  </span>
                  <span>اذهب إلى {activeModel.name}</span>
                </Link>
              ) : (
                <p className="inline-flex items-center gap-2 text-[1.25rem] font-black text-secondary">
                  <span aria-hidden className="text-sm">
                    ↖
                  </span>
                  <span>اذهب إلى ...</span>
                </p>
              )}
            </div>
            <ul className="max-h-[24rem] overflow-y-auto">
              {loadingYears ? (
                <li className="px-4 py-3 text-sm text-secondary/60">Loading...</li>
              ) : years.length === 0 ? (
                <li className="px-4 py-3 text-sm text-secondary/60">No years</li>
              ) : (
                years.map((y) => (
                  <li key={y.id}>
                    <Link
                      href={`/shop/search?vehicle_brand_id=${activeBrandId ?? ""}&vehicle_model_id=${activeModelId ?? ""}&vehicle_year_id=${y.id}&offset=1`}
                      className={`${itemBaseClass} text-secondary/45 hover:bg-surface-muted hover:text-secondary/80`}
                      onClick={onNavigate}
                    >
                      <span className="truncate">{y.year}</span>
                      <span aria-hidden className="text-secondary/40">
                        ‹
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
