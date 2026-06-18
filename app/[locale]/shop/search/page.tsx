import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductCard } from "@/components/store/ProductCard";
import {
  fetchAttributes,
  fetchConfig,
  fetchProductBrands,
  fetchProductSearch,
  fetchRootCategories,
  fetchTags,
  fetchVehicleBrands,
  fetchVehicleModels,
  getApiBaseUrl,
} from "@/lib/api";
import type { SearchQuery } from "@/lib/api-queries";
import { Link } from "@/i18n/navigation";
import { SearchSidebar } from "@/components/store/SearchSidebar";
import { VehicleModelSlider } from "@/components/store/VehicleModelSlider";
import { VehicleBrandSlider } from "@/components/store/VehicleBrandSlider";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstString(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function joinMulti(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(",");
  }
  return value;
}

export default async function ShopSearchPage({ searchParams, params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("Search");
  const apiBase = getApiBaseUrl();

  const query: SearchQuery = {
    name: firstString(sp.name),
    vehicle_brand_id: firstString(sp.vehicle_brand_id),
    vehicle_model_id: firstString(sp.vehicle_model_id),
    vehicle_year_id: firstString(sp.vehicle_year_id),
    product_brand_id: firstString(sp.product_brand_id),
    category_ids: firstString(sp.category_ids),
    tag_ids: joinMulti(sp.tag_ids),
    attribute_ids: joinMulti(sp.attribute_ids),
    price_low: firstString(sp.price_low),
    price_high: firstString(sp.price_high),
    rating: firstString(sp.rating),
    sort_by: firstString(sp.sort_by) ?? "new_arrival",
    limit: firstString(sp.limit) ?? "12",
    offset: firstString(sp.offset) ?? "1",
    in_stock_only: firstString(sp.in_stock_only),
  };

  const vehicleBrandIdNum = Number(query.vehicle_brand_id ?? "");

  const [data, tags, attributes, config, rootCategories, brandList, vehicleModels, vehicleBrandList] =
    await Promise.all([
      apiBase ? fetchProductSearch(query) : Promise.resolve(null),
      apiBase ? fetchTags() : Promise.resolve([]),
      apiBase ? fetchAttributes() : Promise.resolve([]),
      fetchConfig(),
      apiBase ? fetchRootCategories() : Promise.resolve([]),
      apiBase ? fetchProductBrands("80", "1") : Promise.resolve(null),
      apiBase && vehicleBrandIdNum > 0
        ? fetchVehicleModels(vehicleBrandIdNum)
        : Promise.resolve([]),
      apiBase ? fetchVehicleBrands().catch(() => ({ brands: [] })) : Promise.resolve({ brands: [] }),
    ]);

  const currencyCode =
    (config?.currency_code as string | undefined) || "ILS";

  const products = data?.products ?? [];
  const productBrands = brandList?.brands ?? [];
  const vehicleBrands = vehicleBrandList?.brands ?? [];
  const offsetNum = Number(query.offset ?? "1") || 1;
  const limitNum = Number(query.limit ?? "12") || 12;
  const total = data?.total_size ?? 0;
  const shownSoFar = (offsetNum - 1) * limitNum + products.length;
  const hasPrev = offsetNum > 1;
  const hasNext = shownSoFar < total;
  const activeFilterCount = [
    query.name,
    query.price_low,
    query.price_high,
    query.rating,
    query.tag_ids,
    query.attribute_ids,
    query.in_stock_only,
    query.vehicle_brand_id,
    query.vehicle_model_id,
    query.vehicle_year_id,
    query.product_brand_id,
    query.category_ids,
  ].filter(Boolean).length;

  function hrefWithOffset(nextOffset: number): string {
    const q = new URLSearchParams();
    const entries: [keyof SearchQuery, string | undefined][] = [
      ["name", query.name],
      ["vehicle_brand_id", query.vehicle_brand_id],
      ["vehicle_model_id", query.vehicle_model_id],
      ["vehicle_year_id", query.vehicle_year_id],
      ["product_brand_id", query.product_brand_id],
      ["category_ids", query.category_ids],
      ["tag_ids", query.tag_ids],
      ["attribute_ids", query.attribute_ids],
      ["price_low", query.price_low],
      ["price_high", query.price_high],
      ["rating", query.rating],
      ["sort_by", query.sort_by],
      ["limit", query.limit],
      ["in_stock_only", query.in_stock_only],
    ];
    for (const [k, v] of entries) {
      if (v) {
        q.set(k, v);
      }
    }
    q.set("offset", String(nextOffset));
    return `/shop/search?${q.toString()}`;
  }

  const sortKeys = [
    "new_arrival",
    "price_low_to_high",
    "price_high_to_low",
    "a_to_z",
    "z_to_a",
    "top_rated",
    "best_selling",
    "offer_product",
  ] as const;

  return (
    <div className="store-shell space-y-6 py-8">
      {vehicleBrands.length > 0 && (
        <VehicleBrandSlider
          brands={vehicleBrands}
          activeBrandId={query.vehicle_brand_id}
        />
      )}
      {vehicleModels.length > 0 && (
        <VehicleModelSlider
          models={vehicleModels}
          activeModelId={query.vehicle_model_id}
          baseQuery={query as Record<string, string | undefined>}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <SearchSidebar
          initialQuery={query as Record<string, string | undefined>}
          rootCategories={rootCategories}
          productBrands={productBrands}
          tags={tags}
          attributes={attributes}
          sortKeys={sortKeys}
          activeFilterCount={activeFilterCount}
        />

        <section className="space-y-6">
          <div className="store-card p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-secondary">{t("title")}</h1>
                <p className="mt-2 text-sm text-secondary/90">
                  {total > 0 ? (
                    <>
                      {t("results")}: <strong className="text-primary">{total}</strong>{" "}
                      {t("products")}
                    </>
                  ) : (
                    t("noResults")
                  )}
                </p>
              </div>
              <Link
                href="/shop/search"
                className="store-btn-soft inline-flex h-10 w-10 items-center justify-center rounded-xl p-0"
                title={t("clearFilters")}
                aria-label={t("clearFilters")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17l4 4m0-4l-4 4" />
                </svg>
              </Link>
            </div>
            {!apiBase && (
              <p className="mt-3 text-sm text-red-600">{t("envMissing")}</p>
            )}
          </div>

          {!data && apiBase && (
            <p className="text-sm text-red-600">{t("loadError")}</p>
          )}

          {data && products.length === 0 && (
            <div className="store-card p-8 text-center">
              <p className="text-sm text-secondary/80">{t("noResults")}</p>
            </div>
          )}

          {products.length > 0 && (
            <>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} currencyCode={currencyCode} />
                  </li>
                ))}
              </ul>
              <nav className="flex flex-wrap items-center justify-center gap-3 pt-4">
                {hasPrev && (
                  <Link
                    href={hrefWithOffset(offsetNum - 1)}
                    className="store-btn-soft inline-flex items-center px-4 text-sm"
                  >
                    {t("prev")}
                  </Link>
                )}
                <span className="rounded-lg border border-border-soft bg-white px-4 py-2 text-sm font-semibold text-secondary/80">
                  {t("page")} {offsetNum}
                </span>
                {hasNext && (
                  <Link
                    href={hrefWithOffset(offsetNum + 1)}
                    className="store-btn-soft inline-flex items-center px-4 text-sm"
                  >
                    {t("next")}
                  </Link>
                )}
              </nav>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
