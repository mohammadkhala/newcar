"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import Image from "next/image";
import { useCallback, useRef } from "react";
import { MultiSelectPills } from "./MultiSelectPills";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type { CategoryRow, ProductBrandListResponse, TagRow, AttributeRow } from "@/lib/types";

type ProductBrandRow = ProductBrandListResponse["brands"][number];

type Props = {
  initialQuery: Record<string, string | undefined>;
  rootCategories: CategoryRow[];
  productBrands: ProductBrandRow[];
  tags: TagRow[];
  attributes: AttributeRow[];
  sortKeys: readonly string[];
  activeFilterCount: number;
};

export function SearchSidebar({
  initialQuery,
  rootCategories,
  productBrands,
  tags,
  attributes,
  sortKeys,
  activeFilterCount,
}: Props) {
  const t = useTranslations("Search");
  const tNav = useTranslations("Nav");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const applyFilters = useCallback(() => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    const q = new URLSearchParams(searchParams.toString());
    
    // Reset to page 1 on filter changes
    q.set("offset", "1");

    // Gather all form fields
    for (const [key, value] of fd.entries()) {
      const strVal = String(value).trim();
      if (strVal) {
        q.set(key, strVal);
      } else {
        q.delete(key);
      }
    }
    
    router.push(`${pathname}?${q.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Debounce helper for text/number inputs
  const debounceRef = useRef<NodeJS.Timeout>(undefined);
  const handleInputDebounced = () => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters();
    }, 500);
  };

  const handleDirectChange = () => {
    applyFilters();
  };

  return (
    <aside className="store-card h-fit p-4 lg:sticky lg:top-24">
      <div className="mb-4 flex items-center justify-between gap-2 border-b border-border-soft pb-3">
        <h2 className="text-base font-black text-secondary">{t("filters")}</h2>
        {activeFilterCount > 0 ? (
          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
            {activeFilterCount}
          </span>
        ) : null}
      </div>

      <form ref={formRef} onSubmit={(e) => { e.preventDefault(); applyFilters(); }} className="space-y-4">
        {/* Hidden preservation inputs for vehicle fitments if present */}
        {initialQuery.vehicle_brand_id && (
          <input type="hidden" name="vehicle_brand_id" value={initialQuery.vehicle_brand_id} />
        )}
        {initialQuery.vehicle_model_id && (
          <input type="hidden" name="vehicle_model_id" value={initialQuery.vehicle_model_id} />
        )}
        {initialQuery.vehicle_year_id && (
          <input type="hidden" name="vehicle_year_id" value={initialQuery.vehicle_year_id} />
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-secondary">
          {t("nameLabel")}
          <input
            type="search"
            name="name"
            defaultValue={initialQuery.name ?? ""}
            placeholder={t("namePlaceholder")}
            className="store-input"
            onChange={handleInputDebounced}
          />
        </label>

        <div className="space-y-2 border-t border-border-soft pt-4">
          <p className="text-sm font-bold text-secondary">{tNav("categories")}</p>
          <label className="flex items-center gap-2 text-sm text-secondary/85">
            <input type="radio" name="category_ids" value="" defaultChecked={!initialQuery.category_ids} onChange={handleDirectChange} />
            {t("clearFilters")}
          </label>
          <div className="max-h-44 space-y-1 overflow-y-auto pe-1">
            {rootCategories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm text-secondary/85">
                <input
                  type="radio"
                  name="category_ids"
                  value={String(category.id)}
                  defaultChecked={String(initialQuery.category_ids ?? "") === String(category.id)}
                  onChange={handleDirectChange}
                />
                <span className="truncate">{category.name ?? `#${category.id}`}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t border-border-soft pt-4">
          <p className="text-sm font-bold text-secondary">{tNav("brands")}</p>
          <label className="flex items-center gap-2 text-sm text-secondary/85">
            <input type="radio" name="product_brand_id" value="" defaultChecked={!initialQuery.product_brand_id} onChange={handleDirectChange} />
            {t("clearFilters")}
          </label>
          <div className="grid max-h-60 grid-cols-3 gap-2 overflow-y-auto pe-1">
            {productBrands.map((brand) => {
              const brandLogo = resolveMediaUrl(brand.image_full_url ?? brand.image ?? null, {
                defaultFolder: "product-brand",
              });

              return (
                <label key={brand.id} className="cursor-pointer">
                  <input
                    type="radio"
                    name="product_brand_id"
                    value={String(brand.id)}
                    defaultChecked={String(initialQuery.product_brand_id ?? "") === String(brand.id)}
                    className="peer sr-only"
                    onChange={handleDirectChange}
                  />
                  <span className="block rounded-xl border border-border-soft bg-white p-2 transition hover:border-primary/40 peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-primary/20">
                    {brandLogo ? (
                      <Image
                        src={brandLogo}
                        alt={brand.name}
                        width={72}
                        height={72}
                        unoptimized
                        className="mx-auto h-12 w-full object-contain"
                      />
                    ) : (
                      <span className="mx-auto flex h-12 w-full items-center justify-center rounded bg-surface-muted text-[11px] font-bold text-secondary/70">
                        #
                      </span>
                    )}
                    <span className="sr-only">{brand.name}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border-soft pt-4">
          <label className="flex flex-col gap-1 text-xs font-medium text-secondary">
            {t("priceMin")}
            <input type="number" name="price_low" defaultValue={initialQuery.price_low ?? ""} className="store-input min-h-10" onChange={handleInputDebounced} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-secondary">
            {t("priceMax")}
            <input type="number" name="price_high" defaultValue={initialQuery.price_high ?? ""} className="store-input min-h-10" onChange={handleInputDebounced} />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-secondary">
          <input type="checkbox" name="in_stock_only" value="1" defaultChecked={initialQuery.in_stock_only === "1"} onChange={handleDirectChange} />
          {t("inStock")}
        </label>

        <details className="border-t border-border-soft pt-4">
          <summary className="cursor-pointer text-sm font-bold text-secondary">
            {t("filters")}
          </summary>
          <div className="mt-3 space-y-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-secondary">
              {t("ratingMin")}
              <input type="number" step="0.1" name="rating" defaultValue={initialQuery.rating ?? ""} className="store-input min-h-10" onChange={handleInputDebounced} />
            </label>
            <div className="flex flex-col gap-1 text-xs font-medium text-secondary" onChange={handleDirectChange}>
              {t("tags")}
              <MultiSelectPills
                name="tag_ids"
                defaultValue={initialQuery.tag_ids ? initialQuery.tag_ids.split(",").filter(Boolean) : []}
                options={tags.map((t) => ({ id: String(t.id), label: String(t.name ?? t.slug ?? t.id) }))}
              />
            </div>
            <div className="flex flex-col gap-1 text-xs font-medium text-secondary" onChange={handleDirectChange}>
              {t("attributes")}
              <MultiSelectPills
                name="attribute_ids"
                defaultValue={initialQuery.attribute_ids ? initialQuery.attribute_ids.split(",").filter(Boolean) : []}
                options={attributes.map((a) => ({ id: String(a.id), label: String(a.name ?? a.id) }))}
              />
            </div>
          </div>
        </details>

        <label className="flex flex-col gap-1 text-sm font-medium text-secondary border-t border-border-soft pt-4">
          {t("sortLabel")}
          <select
            name="sort_by"
            defaultValue={initialQuery.sort_by ?? "new_arrival"}
            className="store-input"
            onChange={handleDirectChange}
          >
            {sortKeys.map((k) => (
              <option key={k} value={k}>
                {t(`sort.${k}` as "sort.new_arrival")}
              </option>
            ))}
          </select>
        </label>
      </form>
    </aside>
  );
}
