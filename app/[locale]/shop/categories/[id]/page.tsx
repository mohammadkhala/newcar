import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import {
  fetchAttributes,
  fetchCategoryChildren,
  fetchCategoryContext,
  fetchConfig,
  fetchProductBrands,
  fetchProductSearch,
  fetchTags,
  getApiBaseUrl,
} from "@/lib/api";
import type { SearchQuery } from "@/lib/api-queries";
import { categoryDisplayImageSrc } from "@/lib/category-image";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

type Props = {
  params: Promise<{ locale: string; id: string }>;
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

const SORT_KEYS = [
  "new_arrival",
  "price_low_to_high",
  "price_high_to_low",
  "a_to_z",
  "z_to_a",
  "top_rated",
  "best_selling",
  "offer_product",
] as const;

export default async function CategoryDetailPage({
  params,
  searchParams,
}: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("Categories");
  const tSearch = await getTranslations("Search");
  const tNav = await getTranslations("Nav");
  const catId = Number(id);
  const offset = firstString(sp.offset) ?? "1";
  const query: SearchQuery = {
    category_ids: catId > 0 ? String(catId) : undefined,
    name: firstString(sp.name),
    vehicle_brand_id: firstString(sp.vehicle_brand_id),
    vehicle_model_id: firstString(sp.vehicle_model_id),
    vehicle_year_id: firstString(sp.vehicle_year_id),
    product_brand_id: firstString(sp.product_brand_id),
    tag_ids: joinMulti(sp.tag_ids),
    attribute_ids: joinMulti(sp.attribute_ids),
    price_low: firstString(sp.price_low),
    price_high: firstString(sp.price_high),
    rating: firstString(sp.rating),
    sort_by: firstString(sp.sort_by) ?? "new_arrival",
    limit: firstString(sp.limit) ?? "12",
    offset,
    in_stock_only: firstString(sp.in_stock_only),
  };

  const apiBase = getApiBaseUrl();

  const [
    children,
    data,
    config,
    tags,
    attributes,
    brandList,
    categoryContext,
  ] = await Promise.all([
    apiBase && catId > 0 ? fetchCategoryChildren(catId) : Promise.resolve([]),
    apiBase && catId > 0 ? fetchProductSearch(query) : Promise.resolve(null),
    fetchConfig(),
    apiBase ? fetchTags() : Promise.resolve([]),
    apiBase ? fetchAttributes() : Promise.resolve([]),
    apiBase
      ? fetchProductBrands("80", "1")
      : Promise.resolve(null),
    apiBase && catId > 0 ? fetchCategoryContext(catId) : Promise.resolve(null),
  ]);

  const breadcrumb = categoryContext?.breadcrumb ?? [];
  const currentCategoryTitle =
    breadcrumb.length > 0
      ? (breadcrumb[breadcrumb.length - 1]?.name ?? t("productsIn"))
      : t("productsIn");

  const currencyCode =
    (config?.currency_code as string | undefined) || "ILS";

  const products = data?.products ?? [];
  const total = data?.total_size ?? 0;
  const limitNum = Number(query.limit ?? "12") || 12;
  const offsetNum = Number(offset) || 1;
  const shownSoFar = (offsetNum - 1) * limitNum + products.length;
  const hasPrev = offsetNum > 1;
  const hasNext = shownSoFar < total;
  const productBrands = brandList?.brands ?? [];

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
  ].filter(Boolean).length;

  function hrefWithOffset(nextOffset: number): string {
    const q = new URLSearchParams();
    const entries: [keyof SearchQuery, string | undefined][] = [
      ["name", query.name],
      ["vehicle_brand_id", query.vehicle_brand_id],
      ["vehicle_model_id", query.vehicle_model_id],
      ["vehicle_year_id", query.vehicle_year_id],
      ["product_brand_id", query.product_brand_id],
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
    return `/shop/categories/${id}?${q.toString()}`;
  }

  return (
    <div className="store-shell py-6 md:py-8">
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-8">
        <aside className="store-card h-fit p-4 lg:sticky lg:top-24">
          {categoryContext ? (
            <div className="mb-4 space-y-3 border-b border-border-soft pb-4">
              <p className="text-xs font-bold uppercase tracking-wide text-secondary/70">
                {t("hierarchyTitle")}
              </p>
              {categoryContext.parent ? (
                <Link
                  href={`/shop/categories/${categoryContext.parent.id}`}
                  className="block text-sm font-semibold text-primary hover:underline"
                >
                  {t("upToParent")}: {categoryContext.parent.name}
                </Link>
              ) : null}
              {categoryContext.siblings.length > 1 ? (
                <>
                  <p className="text-xs font-medium text-secondary/80">
                    {t("siblingsTitle")}
                  </p>
                  <ul className="max-h-52 space-y-1 overflow-y-auto text-sm pe-1">
                    {categoryContext.siblings.map((s) => {
                      const isHere = s.id === categoryContext.current_id;
                      return (
                        <li key={s.id}>
                          <Link
                            href={`/shop/categories/${s.id}`}
                            className={
                              isHere
                                ? "font-bold text-primary"
                                : "text-secondary/90 hover:text-primary"
                            }
                            {...(isHere ? { "aria-current": "page" as const } : {})}
                          >
                            {s.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : null}
            </div>
          ) : null}

          <div className="mb-4 flex items-center justify-between gap-2 border-b border-border-soft pb-3">
            <h2 className="text-base font-black text-secondary">
              {t("filtersTitle")}
            </h2>
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                {activeFilterCount}
              </span>
            ) : null}
          </div>
          <form
            method="get"
            action={`/${locale}/shop/categories/${id}`}
            className="space-y-4"
          >
            <input type="hidden" name="offset" value="1" />

            <p className="rounded-lg bg-primary/5 px-3 py-2 text-xs font-medium text-secondary">
              {t("filterScopeHint")}
            </p>

            <label className="flex flex-col gap-1 text-sm font-medium text-secondary">
              {tSearch("nameLabel")}
              <input
                type="search"
                name="name"
                defaultValue={query.name ?? ""}
                placeholder={tSearch("namePlaceholder")}
                className="store-input"
                autoComplete="off"
              />
            </label>

            <div className="space-y-2 border-t border-border-soft pt-4">
              <p className="text-sm font-bold text-secondary">{tNav("brands")}</p>
              <label className="flex items-center gap-2 text-sm text-secondary/85">
                <input
                  type="radio"
                  name="product_brand_id"
                  value=""
                  defaultChecked={!query.product_brand_id}
                />
                {tSearch("clearFilters")}
              </label>
              <div className="grid max-h-60 grid-cols-3 gap-2 overflow-y-auto pe-1">
                {productBrands.map((brand) => {
                  const brandLogo = resolveMediaUrl(
                    brand.image_full_url ?? brand.image ?? null,
                    { defaultFolder: "product-brand" },
                  );

                  return (
                    <label key={brand.id} className="cursor-pointer">
                      <input
                        type="radio"
                        name="product_brand_id"
                        value={String(brand.id)}
                        defaultChecked={
                          String(query.product_brand_id ?? "") ===
                          String(brand.id)
                        }
                        className="peer sr-only"
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
                {tSearch("priceMin")}
                <input
                  type="number"
                  name="price_low"
                  defaultValue={query.price_low ?? ""}
                  className="store-input min-h-10"
                  autoComplete="off"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-secondary">
                {tSearch("priceMax")}
                <input
                  type="number"
                  name="price_high"
                  defaultValue={query.price_high ?? ""}
                  className="store-input min-h-10"
                  autoComplete="off"
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-secondary">
              <input
                type="checkbox"
                name="in_stock_only"
                value="1"
                defaultChecked={query.in_stock_only === "1"}
              />
              {tSearch("inStock")}
            </label>

            <details className="border-t border-border-soft pt-4">
              <summary className="cursor-pointer text-sm font-bold text-secondary">
                {tSearch("filters")}
              </summary>
              <div className="mt-3 space-y-3">
                <label className="flex flex-col gap-1 text-xs font-medium text-secondary">
                  {tSearch("ratingMin")}
                  <input
                    type="number"
                    step="0.1"
                    name="rating"
                    defaultValue={query.rating ?? ""}
                    className="store-input min-h-10"
                    autoComplete="off"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-secondary">
                  {tSearch("tags")}
                  <select
                    name="tag_ids"
                    multiple
                    defaultValue={
                      query.tag_ids
                        ? query.tag_ids.split(",").filter(Boolean)
                        : []
                    }
                    className="store-input min-h-20 py-2"
                    size={3}
                  >
                    {tags.map((tag) => (
                      <option key={tag.id} value={String(tag.id)}>
                        {tag.name ?? tag.slug ?? tag.id}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-secondary">
                  {tSearch("attributes")}
                  <select
                    name="attribute_ids"
                    multiple
                    defaultValue={
                      query.attribute_ids
                        ? query.attribute_ids.split(",").filter(Boolean)
                        : []
                    }
                    className="store-input min-h-20 py-2"
                    size={3}
                  >
                    {attributes.map((attribute) => (
                      <option key={attribute.id} value={String(attribute.id)}>
                        {attribute.name ?? attribute.id}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </details>

            <label className="flex flex-col gap-1 text-sm font-medium text-secondary">
              {tSearch("sortLabel")}
              <select
                name="sort_by"
                defaultValue={query.sort_by ?? "new_arrival"}
                className="store-input"
              >
                {SORT_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {tSearch(`sort.${k}` as "sort.new_arrival")}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="store-btn-primary w-full text-sm">
              {tSearch("submit")}
            </button>
          </form>

          <div className="mt-4 border-t border-border-soft pt-4">
            <Link
              href={`/shop/categories/${id}`}
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t("resetFilters")}
            </Link>
          </div>
        </aside>

        <div className="min-w-0 space-y-6 md:space-y-8">
          <header className="space-y-2 md:space-y-3">
            <nav
              aria-label={t("breadcrumbLabel")}
              className="overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]"
            >
              <ol className="flex min-w-0 flex-nowrap items-center gap-x-1.5 text-sm leading-relaxed text-secondary/80">
                <li className="shrink-0">
                  <Link href="/" className="hover:text-primary">
                    {t("breadcrumbHome")}
                  </Link>
                </li>
                <li className="shrink-0 text-secondary/45" aria-hidden>
                  ·
                </li>
                <li className="shrink-0">
                  <Link href="/shop/categories" className="hover:text-primary">
                    {t("title")}
                  </Link>
                </li>
                {breadcrumb.map((item, idx) => {
                  const isLast = idx === breadcrumb.length - 1;
                  return (
                    <li
                      key={item.id}
                      className="flex min-w-0 max-w-full items-center gap-1.5"
                    >
                      <span className="shrink-0 text-secondary/45" aria-hidden>
                        ·
                      </span>
                      {isLast ? (
                        <span
                          className="truncate font-semibold text-secondary"
                          aria-current="page"
                        >
                          {item.name}
                        </span>
                      ) : (
                        <Link
                          href={`/shop/categories/${item.id}`}
                          className="truncate hover:text-primary"
                        >
                          {item.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-secondary md:text-3xl">
              {currentCategoryTitle}
            </h1>
          </header>

          {children.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-secondary">
                {t("subcategories")}
              </h2>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {children.map((c) => {
                  const img = categoryDisplayImageSrc(c);
                  const label = (c.name ?? `#${c.id}`).trim() || `#${c.id}`;
                  const initial =
                    [...label].find((ch) => /\S/u.test(ch)) ?? "?";

                  return (
                    <li key={c.id}>
                      <Link
                        href={`/shop/categories/${c.id}`}
                        className="store-panel flex h-full flex-col overflow-hidden text-center transition-colors hover:border-primary/35"
                      >
                        <div className="relative aspect-square w-full bg-surface-muted/70">
                          {img ? (
                            <Image
                              src={img}
                              alt={label}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-2xl font-black text-primary/35 md:text-3xl">
                              {initial}
                            </div>
                          )}
                        </div>
                        <span className="line-clamp-2 px-2 py-3 text-xs font-semibold leading-snug text-secondary md:text-sm">
                          {label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {!apiBase && (
            <p className="text-sm text-red-600">Configure NEXT_PUBLIC_API_BASE_URL</p>
          )}

          {!data && apiBase && catId > 0 && (
            <p className="text-sm text-red-600">{tSearch("loadError")}</p>
          )}

          {products.length === 0 && apiBase && data != null && (
            <p className="text-sm text-secondary/80">{t("emptyProducts")}</p>
          )}

          {products.length > 0 && (
            <>
              <p className="text-sm text-secondary/90">
                {tSearch("results")}:{" "}
                <strong className="text-primary">{total}</strong>{" "}
                {tSearch("products")}
              </p>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <li key={p.id}>
                    <ProductCard product={p} currencyCode={currencyCode} />
                  </li>
                ))}
              </ul>
              <nav className="flex flex-wrap justify-center gap-3">
                {hasPrev && (
                  <Link
                    href={hrefWithOffset(offsetNum - 1)}
                    className="store-btn-soft inline-flex items-center px-4 text-sm"
                  >
                    {tSearch("prev")}
                  </Link>
                )}
                <span className="rounded-lg border border-border-soft bg-white px-4 py-2 text-sm font-semibold text-secondary/80">
                  {tSearch("page")} {offsetNum}
                </span>
                {hasNext && (
                  <Link
                    href={hrefWithOffset(offsetNum + 1)}
                    className="store-btn-soft inline-flex items-center px-4 text-sm"
                  >
                    {tSearch("next")}
                  </Link>
                )}
              </nav>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
