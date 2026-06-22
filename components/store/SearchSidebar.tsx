"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useCallback, useRef } from "react";
import { MultiSelectPills } from "./MultiSelectPills";
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

/** Chevron that flips when the parent <details> is open. */
function GroupChevron() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className="h-4 w-4 shrink-0 text-secondary/60 transition-transform group-open:rotate-180"
      fill="currentColor"
    >
      <path d="M5.5 7.5 10 12l4.5-4.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Collapsible filter section styled like a square-checkbox facet list, with a count badge per row. */
function FilterGroup({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      className="group border-b border-border-soft py-3 first:pt-0 last:border-b-0"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-bold text-secondary">
        {title}
        <GroupChevron />
      </summary>
      <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pe-1">{children}</div>
    </details>
  );
}

/** Square checkbox-styled radio row with an optional trailing count, e.g. "CLA (81)". */
function FacetOption({
  name,
  value,
  label,
  count,
  checked,
  onChange,
  onDeselect,
}: {
  name: string;
  value: string;
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
  onDeselect?: () => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-center justify-between gap-2 rounded-md px-1 py-1 text-sm text-secondary/85 hover:bg-surface-muted"
      onClick={(e) => {
        if (checked && onDeselect) {
          e.preventDefault();
          onDeselect();
        }
      }}
    >
      <span className="flex min-w-0 items-center gap-2">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors ${
            checked ? "border-primary bg-primary" : "border-border-soft bg-white"
          }`}
        >
          {checked ? (
            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="none">
              <path d="M2 6.2 4.5 8.5 10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : null}
        </span>
        <span className="truncate">{label}</span>
      </span>
      {count !== undefined ? (
        <span className="shrink-0 text-xs font-semibold text-secondary/50">{count}</span>
      ) : null}
    </label>
  );
}

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

  const clearField = useCallback((fieldName: string) => {
    const q = new URLSearchParams(searchParams.toString());
    q.set("offset", "1");
    q.delete(fieldName);
    router.push(`${pathname}?${q.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <aside className="store-card h-fit overflow-hidden p-0 lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3">
        <h2 className="text-sm font-black text-white">{t("browseBy")}</h2>
        {activeFilterCount > 0 ? (
          <span className="rounded-full bg-white/20 px-2 py-1 text-xs font-bold text-white">
            {activeFilterCount}
          </span>
        ) : null}
      </div>

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters();
        }}
        className="px-4 py-3"
      >
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

        <div className="pb-3">
          <input
            type="search"
            name="name"
            defaultValue={initialQuery.name ?? ""}
            placeholder={t("namePlaceholder")}
            className="store-input"
            autoComplete="off"
            onChange={handleInputDebounced}
          />
        </div>

        <FilterGroup title={tNav("categories")}>
          {rootCategories.map((category) => (
            <FacetOption
              key={category.id}
              name="category_ids"
              value={String(category.id)}
              label={category.name ?? `#${category.id}`}
              count={category.products_count}
              checked={String(initialQuery.category_ids ?? "") === String(category.id)}
              onChange={handleDirectChange}
              onDeselect={() => clearField("category_ids")}
            />
          ))}
        </FilterGroup>

        {productBrands.length > 0 && (
          <details
            className="group border-b border-border-soft py-3 first:pt-0 last:border-b-0"
            open
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-bold text-secondary">
              {tNav("brands")}
              <GroupChevron />
            </summary>
            <div className="mt-3 grid grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pe-1">
              {productBrands.map((brand) => {
                const imgSrc = brand.image_full_url ?? brand.image ?? null;
                const active = String(initialQuery.product_brand_id ?? "") === String(brand.id);
                return (
                  <button
                    key={brand.id}
                    type="button"
                    title={brand.name}
                    suppressHydrationWarning
                    onClick={() => {
                      if (active) {
                        clearField("product_brand_id");
                      } else {
                        const q = new URLSearchParams(searchParams.toString());
                        q.set("offset", "1");
                        q.set("product_brand_id", String(brand.id));
                        router.push(`${pathname}?${q.toString()}`, { scroll: false });
                      }
                    }}
                    className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 p-1.5 transition-all ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border-soft bg-white hover:border-primary/30"
                    }`}
                  >
                    {imgSrc ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imgSrc}
                        alt={brand.name}
                        className="h-8 w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.style.display = "block";
                        }}
                      />
                    ) : null}
                    <span
                      className={`text-center text-[10px] font-bold leading-tight truncate w-full ${active ? "text-primary" : "text-secondary"}`}
                      style={imgSrc ? { display: "none" } : {}}
                    >
                      {brand.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </details>
        )}

        <FilterGroup title={t("priceMin") + " / " + t("priceMax")} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2 px-1">
            <label className="flex flex-col gap-1 text-xs font-medium text-secondary">
              {t("priceMin")}
              <input
                type="number"
                name="price_low"
                defaultValue={initialQuery.price_low ?? ""}
                className="store-input min-h-9"
                autoComplete="off"
                onChange={handleInputDebounced}
                suppressHydrationWarning
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-secondary">
              {t("priceMax")}
              <input
                type="number"
                name="price_high"
                defaultValue={initialQuery.price_high ?? ""}
                className="store-input min-h-9"
                autoComplete="off"
                onChange={handleInputDebounced}
                suppressHydrationWarning
              />
            </label>
          </div>
        </FilterGroup>

        <FilterGroup title={t("filters")} defaultOpen={false}>
          <div className="space-y-3 px-1">
            <label className="flex flex-col gap-1 text-xs font-medium text-secondary">
              {t("ratingMin")}
              <input
                type="number"
                step="0.1"
                name="rating"
                defaultValue={initialQuery.rating ?? ""}
                className="store-input min-h-9"
                autoComplete="off"
                onChange={handleInputDebounced}
                suppressHydrationWarning
              />
            </label>
            <div className="flex flex-col gap-1 text-xs font-medium text-secondary" onChange={handleDirectChange}>
              {t("tags")}
              <MultiSelectPills
                name="tag_ids"
                defaultValue={initialQuery.tag_ids ? initialQuery.tag_ids.split(",").filter(Boolean) : []}
                options={tags.map((tag) => ({ id: String(tag.id), label: String(tag.name ?? tag.slug ?? tag.id) }))}
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
        </FilterGroup>

        <label className="flex flex-col gap-1 pt-3 text-sm font-medium text-secondary">
          {t("sortLabel")}
          <select
            name="sort_by"
            defaultValue={initialQuery.sort_by ?? "new_arrival"}
            className="store-input"
            onChange={handleDirectChange}
            suppressHydrationWarning
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
