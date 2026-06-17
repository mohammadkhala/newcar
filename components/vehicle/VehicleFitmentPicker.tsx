"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import {
  clientFetchVehicleModels,
  clientFetchVehicleYears,
} from "@/lib/client-api";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type {
  VehicleBrandsResponse,
  VehicleModelRow,
  VehicleYearRow,
} from "@/lib/types";

type Props = {
  brands: VehicleBrandsResponse["brands"];
  apiConfigured: boolean;
  onSearch?: () => void;
};

export function VehicleFitmentPicker({ brands, apiConfigured, onSearch }: Props) {
  const t = useTranslations("VehiclePicker");
  const locale = useLocale();
  const router = useRouter();

  const [brandId, setBrandId] = useState<number | "">("");
  const [modelId, setModelId] = useState<number | "">("");
  const [yearId, setYearId] = useState<number | "">("");
  const [models, setModels] = useState<VehicleModelRow[]>([]);
  const [years, setYears] = useState<VehicleYearRow[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);

  const activeBrand = brands.find((b) => b.id === brandId) ?? null;
  const activeModel = models.find((m) => m.id === modelId) ?? null;

  useEffect(() => {
    if (!apiConfigured || brandId === "") {
      setModels([]);
      setModelId("");
      setYearId("");
      setYears([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoadingModels(true);
      try {
        const list = await clientFetchVehicleModels(Number(brandId), locale);
        if (!cancelled) {
          setModels(list);
          setModelId("");
          setYearId("");
          setYears([]);
        }
      } finally {
        if (!cancelled) setLoadingModels(false);
      }
    })();
    return () => { cancelled = true; };
  }, [apiConfigured, brandId, locale]);

  useEffect(() => {
    if (!apiConfigured || modelId === "") {
      setYears([]);
      setYearId("");
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoadingYears(true);
      try {
        const list = await clientFetchVehicleYears(Number(modelId), locale);
        if (!cancelled) {
          setYears(list);
          setYearId("");
        }
      } finally {
        if (!cancelled) setLoadingYears(false);
      }
    })();
    return () => { cancelled = true; };
  }, [apiConfigured, modelId, locale]);

  function goSearch() {
    const q = new URLSearchParams();
    if (brandId !== "") q.set("vehicle_brand_id", String(brandId));
    if (modelId !== "") q.set("vehicle_model_id", String(modelId));
    if (yearId !== "") q.set("vehicle_year_id", String(yearId));
    onSearch?.();
    router.push(`/shop/search?${q.toString()}`);
  }

  if (!apiConfigured) {
    return <p className="text-sm text-secondary/90">{t("env")}</p>;
  }

  return (
    <div className="space-y-5">

      {/* ── Brand logos grid ── */}
      <div className="store-card p-4 md:p-6">
        <h2 className="mb-4 text-base font-bold text-secondary">{t("makeLabel")}</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {brands.map((brand) => {
            const src = resolveMediaUrl(
              brand.image_full_url ?? brand.image ?? null,
              { defaultFolder: "vehicle-brand" },
            );
            const active = brand.id === brandId;
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => setBrandId((prev) => (prev === brand.id ? "" : brand.id))}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition-all ${
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border-soft bg-white hover:border-primary/40 hover:bg-surface-muted"
                }`}
              >
                {src ? (
                  <div className="relative h-20 w-full">
                    <Image
                      src={src}
                      alt={brand.name}
                      fill
                      unoptimized
                      sizes="120px"
                      className="object-contain p-2"
                    />
                  </div>
                ) : (
                  <span
                    className={`inline-flex h-20 w-full items-center justify-center rounded-lg text-xl font-bold ${
                      active
                        ? "bg-primary/15 text-primary"
                        : "bg-surface-muted text-secondary/50"
                    }`}
                  >
                    {[...brand.name].find((c) => /\S/u.test(c)) ?? "?"}
                  </span>
                )}
                <span
                  className={`line-clamp-2 text-xs font-semibold leading-tight ${
                    active ? "text-primary" : "text-secondary/75"
                  }`}
                >
                  {brand.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick search — brand only, no model needed */}
        {brandId !== "" && modelId === "" && (
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-border-soft pt-4">
            <Link
              href={`/shop/search?vehicle_brand_id=${brandId}`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              تسوق كل منتجات {activeBrand?.name} ←
            </Link>
            <button
              type="button"
              onClick={goSearch}
              className="store-btn-primary px-6 text-sm"
            >
              {t("submit")}
            </button>
          </div>
        )}
      </div>

      {/* ── Models grid ── */}
      {brandId !== "" && (
        <div className="store-card p-4 md:p-6">
          {/* Header with breadcrumb */}
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-border-soft pb-3">
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => { setBrandId(""); setModelId(""); setYearId(""); }}
                className="font-medium text-secondary/55 transition-colors hover:text-primary"
              >
                {t("makeLabel")}
              </button>
              <span className="text-secondary/35" aria-hidden>›</span>
              <span className="font-bold text-secondary">{activeBrand?.name}</span>
            </div>
            <Link
              href={`/shop/search?vehicle_brand_id=${brandId}`}
              className="shrink-0 rounded-lg bg-[#EAB308] px-3 py-1.5 text-xs font-bold text-black transition hover:brightness-105"
            >
              تسوق الكل
            </Link>
          </div>

          <p className="mb-3 text-base font-bold text-secondary">{t("modelLabel")}</p>

          {loadingModels ? (
            <div className="py-8 text-center text-sm text-secondary/50">
              {t("loading")}
            </div>
          ) : models.length === 0 ? (
            <p className="py-4 text-sm text-secondary/50">لا توجد موديلات</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {models.map((model) => {
                const active = model.id === modelId;
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() =>
                      setModelId((prev) => (prev === model.id ? "" : model.id))
                    }
                    className={`rounded-xl border-2 px-3 py-3 text-center text-sm font-semibold transition-all ${
                      active
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border-soft bg-white text-secondary/70 hover:border-primary/40 hover:bg-surface-muted hover:text-secondary"
                    }`}
                  >
                    {model.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Year chips + search ── */}
      {modelId !== "" && (
        <div className="store-card p-4 md:p-6">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 border-b border-border-soft pb-3 text-sm">
            <button
              type="button"
              onClick={() => { setBrandId(""); setModelId(""); setYearId(""); }}
              className="font-medium text-secondary/55 transition-colors hover:text-primary"
            >
              {t("makeLabel")}
            </button>
            <span className="text-secondary/35" aria-hidden>›</span>
            <button
              type="button"
              onClick={() => { setModelId(""); setYearId(""); }}
              className="font-medium text-secondary/55 transition-colors hover:text-primary"
            >
              {activeBrand?.name}
            </button>
            <span className="text-secondary/35" aria-hidden>›</span>
            <span className="font-bold text-secondary">{activeModel?.name}</span>
          </div>

          <p className="mb-3 text-base font-bold text-secondary">{t("yearLabel")}</p>

          {loadingYears ? (
            <div className="py-4 text-center text-sm text-secondary/50">{t("loading")}</div>
          ) : years.length > 0 ? (
            <div className="mb-5 flex flex-wrap gap-2">
              {years.map((y) => {
                const active = y.id === yearId;
                return (
                  <button
                    key={y.id}
                    type="button"
                    onClick={() =>
                      setYearId((prev) => (prev === y.id ? "" : y.id))
                    }
                    className={`rounded-xl border-2 px-5 py-2 text-sm font-bold transition-all ${
                      active
                        ? "border-primary bg-primary text-white shadow-sm"
                        : "border-border-soft bg-white text-secondary/70 hover:border-primary/40 hover:text-secondary"
                    }`}
                  >
                    {y.year}
                  </button>
                );
              })}
            </div>
          ) : null}

          <button
            type="button"
            onClick={goSearch}
            className="store-btn-primary w-full text-base md:w-auto md:px-12"
          >
            {t("submit")}
          </button>
        </div>
      )}
    </div>
  );
}
