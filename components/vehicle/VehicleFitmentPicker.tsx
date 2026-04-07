"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import {
  clientFetchVehicleModels,
  clientFetchVehicleYears,
} from "@/lib/client-api";
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

  useEffect(() => {
    if (!apiConfigured || brandId === "") {
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
        if (!cancelled) {
          setLoadingModels(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiConfigured, brandId, locale]);

  useEffect(() => {
    if (!apiConfigured || modelId === "") {
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
        if (!cancelled) {
          setLoadingYears(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiConfigured, modelId, locale]);

  function goSearch() {
    const q = new URLSearchParams();
    if (brandId !== "") {
      q.set("vehicle_brand_id", String(brandId));
    }
    if (modelId !== "") {
      q.set("vehicle_model_id", String(modelId));
    }
    if (yearId !== "") {
      q.set("vehicle_year_id", String(yearId));
    }
    onSearch?.();
    router.push(`/shop/search?${q.toString()}`);
  }

  if (!apiConfigured) {
    return <p className="text-sm text-secondary/90">{t("env")}</p>;
  }

  return (
    <div className="store-card w-full max-w-sm p-4 sm:p-5">
      <h2 className="mb-4 text-center text-lg font-bold text-secondary">
        {t("title")}
      </h2>
      <div className="space-y-4">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-secondary">
          {t("makeLabel")}
          <select
            className="store-input"
            value={brandId}
            onChange={(e) =>
              setBrandId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">{t("makePlaceholder")}</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-secondary">
          {t("modelLabel")}
          <select
            className="store-input disabled:cursor-not-allowed disabled:bg-surface-muted"
            value={modelId}
            onChange={(e) =>
              setModelId(e.target.value ? Number(e.target.value) : "")
            }
            disabled={brandId === "" || loadingModels}
          >
            <option value="">
              {loadingModels ? t("loading") : t("modelPlaceholder")}
            </option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-secondary">
          {t("yearLabel")}
          <select
            className="store-input disabled:cursor-not-allowed disabled:bg-surface-muted"
            value={yearId}
            onChange={(e) =>
              setYearId(e.target.value ? Number(e.target.value) : "")
            }
            disabled={modelId === "" || loadingYears}
          >
            <option value="">
              {loadingYears ? t("loading") : t("yearPlaceholder")}
            </option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.year}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={goSearch}
          disabled={brandId === ""}
          className="store-btn-primary mt-2 w-full text-base disabled:opacity-50"
        >
          {t("submit")}
        </button>
      </div>
    </div>
  );
}
