"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  clientFetchVehicleModels,
  clientFetchVehicleYears,
} from "@/lib/client-api";
import type {
  CategoryRow,
  VehicleBrandsResponse,
  VehicleModelRow,
  VehicleYearRow,
} from "@/lib/types";

type Props = {
  brands: VehicleBrandsResponse["brands"];
  categories: CategoryRow[];
  apiConfigured: boolean;
};

/**
 * Home "Find Exact Model" bar (reference: hala-car avsb-style-01).
 */
export function HomeExactModelSection({
  brands,
  categories,
  apiConfigured,
}: Props) {
  const t = useTranslations("Home.exactModel");
  const locale = useLocale();
  const router = useRouter();

  const [brandId, setBrandId] = useState<number | "">("");
  const [modelId, setModelId] = useState<number | "">("");
  const [yearId, setYearId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [models, setModels] = useState<VehicleModelRow[]>([]);
  const [years, setYears] = useState<VehicleYearRow[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);

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
        if (!cancelled) {
          setLoadingYears(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiConfigured, modelId, locale]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const q = new URLSearchParams();
    q.set("offset", "1");
    if (brandId !== "") {
      q.set("vehicle_brand_id", String(brandId));
    }
    if (modelId !== "") {
      q.set("vehicle_model_id", String(modelId));
    }
    if (yearId !== "") {
      q.set("vehicle_year_id", String(yearId));
    }
    if (categoryId !== "") {
      q.set("category_ids", String(categoryId));
    }
    router.push(`/shop/search?${q.toString()}`);
  }

  if (!apiConfigured || brands.length === 0) {
    return null;
  }

  return (
    <section className="home-exact-model avsb-style-01" aria-label={t("title")}>
      <div className="cdz-avsb-title">
        <span className="cdz-avsb-title-icon">{t("title")}</span>
      </div>
      <div className="cdz-avsb-wrap">
        <form className="cdz-avsb-form" onSubmit={handleSubmit}>
          <fieldset className="fieldset border-0 p-0 m-0">
            <div className="field-wrap grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FieldSelect
                id="exact-model-brand"
                label={t("brandLabel")}
                value={brandId}
                onChange={(v) => setBrandId(v === "" ? "" : Number(v))}
              >
                <option value="">{t("allOption")}</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </FieldSelect>

              <FieldSelect
                id="exact-model-model"
                label={t("modelLabel")}
                value={modelId}
                disabled={brandId === "" || loadingModels}
                onChange={(v) => setModelId(v === "" ? "" : Number(v))}
              >
                <option value="">
                  {loadingModels ? t("loading") : t("allOption")}
                </option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </FieldSelect>

              <FieldSelect
                id="exact-model-year"
                label={t("yearLabel")}
                value={yearId}
                disabled={modelId === "" || loadingYears}
                onChange={(v) => setYearId(v === "" ? "" : Number(v))}
              >
                <option value="">
                  {loadingYears ? t("loading") : t("allOption")}
                </option>
                {years.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.year}
                  </option>
                ))}
              </FieldSelect>

              <FieldSelect
                id="exact-model-part"
                label={t("partLabel")}
                value={categoryId}
                onChange={(v) => setCategoryId(v === "" ? "" : Number(v))}
              >
                <option value="">{t("allOption")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name ?? `#${c.id}`}
                  </option>
                ))}
              </FieldSelect>
            </div>
          </fieldset>

          <div className="actions-toolbar mt-5 flex flex-wrap items-center gap-3">
            <button type="submit" className="action search primary">
              <span>{t("submit")}</span>
            </button>
            <Link href="/shop/search" className="more-link">
              <span>{t("moreOptions")}</span>
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

function FieldSelect({
  id,
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  id: string;
  label: string;
  value: number | "";
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="field attr-item" role="group">
      <div className="attr-item-inner">
        <label className="label item-label" htmlFor={id}>
          <span>{label}</span>
        </label>
        <div className="control">
          <select
            id={id}
            className="js-cdz-select avsb-select"
            title={label}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
          >
            {children}
          </select>
        </div>
      </div>
    </div>
  );
}
