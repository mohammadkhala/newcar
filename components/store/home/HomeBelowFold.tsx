import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { CampaignPromoGrid } from "@/components/store/CampaignPromoGrid";
import {
  HomeServicesSection,
  type HomeServiceRow,
} from "@/components/store/HomeServicesSection";
import {
  HomeProductsForYouSection,
  type ProductsForYouTabData,
  type ProductsForYouTabKey,
} from "@/components/store/HomeProductsForYouSection";
import { HomeExactModelSection } from "@/components/store/HomeExactModelSection";
import { HomeNewArrivalSection } from "@/components/store/HomeNewArrivalSection";
import { HomeFlashSale } from "@/components/store/HomeFlashSale";
import {
  fetchFeaturedCategories,
  fetchFlashSale,
  fetchLatestProducts,
  fetchNewArrivalProducts,
  fetchProductBrands,
  fetchProductSearch,
  fetchServices,
  fetchVehicleBrands,
  getApiBaseUrl,
  type FeaturedBlock,
} from "@/lib/api";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type {
  CampaignBannerRow,
  CategoryRow,
  ProductBrandListResponse,
  VehicleBrandsResponse,
} from "@/lib/types";

type VehicleBrandRow = VehicleBrandsResponse["brands"][number];
type ProductBrandRow = ProductBrandListResponse["brands"][number];

const PRODUCTS_FOR_YOU_PAGE_SIZE = 8;
const NEW_ARRIVAL_CAROUSEL_SIZE = 10;

function toProductsForYouTab(
  data: Awaited<ReturnType<typeof fetchProductSearch>>,
): ProductsForYouTabData {
  return {
    products: data?.products ?? [],
    totalSize: data?.total_size ?? data?.products?.length ?? 0,
    offset: 1,
  };
}

async function fetchProductsForYouInitial(): Promise<
  Record<ProductsForYouTabKey, ProductsForYouTabData>
> {
  const limit = String(PRODUCTS_FOR_YOU_PAGE_SIZE);
  const empty: ProductsForYouTabData = {
    products: [],
    totalSize: 0,
    offset: 1,
  };

  let bestSellingTab = toProductsForYouTab(
    await fetchProductSearch({
      sort_by: "best_selling",
      limit,
      offset: "1",
    }),
  );

  if (bestSellingTab.products.length === 0) {
    bestSellingTab = toProductsForYouTab(
      await fetchProductSearch({ sort_by: "new_arrival", limit, offset: "1" }),
    );
  }
  if (bestSellingTab.products.length === 0) {
    const latest = await fetchLatestProducts(limit, "1");
    if (latest?.products?.length) {
      bestSellingTab = {
        products: latest.products,
        totalSize:
          (latest as { total_size?: number }).total_size ??
          latest.products.length,
        offset: 1,
      };
    }
  }

  return {
    all: empty,
    mostViewed: empty,
    bestSelling: bestSellingTab,
  };
}

function parseHomeServices(raw: unknown[]): HomeServiceRow[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: HomeServiceRow[] = [];
  for (const item of raw) {
    const r = item as Record<string, unknown>;
    const id = Number(r.id);
    const slug = typeof r.slug === "string" ? r.slug.trim() : "";
    if (!Number.isFinite(id) || !slug) {
      continue;
    }
    out.push({
      id,
      slug,
      title: typeof r.title === "string" ? r.title : undefined,
      summary: typeof r.summary === "string" ? r.summary : undefined,
      image: typeof r.image === "string" ? r.image : undefined,
      image_full_url:
        typeof r.image_full_url === "string" ? r.image_full_url : undefined,
      icon: typeof r.icon === "string" ? r.icon : undefined,
    });
  }
  return out;
}

type Props = {
  popular: CategoryRow[];
  bannerClusterB: CampaignBannerRow[];
  bannerClusterC: CampaignBannerRow[];
};

/**
 * Below-the-fold home sections. Streamed via Suspense so hero HTML is not blocked
 * by products/search, featured categories, or brand grids.
 */
export async function HomeBelowFold({
  popular,
  bannerClusterB,
  bannerClusterC,
}: Props) {
  const t = await getTranslations("Home");
  const apiBase = getApiBaseUrl();
  const currencyCode =
    process.env.NEXT_PUBLIC_CURRENCY_CODE?.trim() || "ILS";

  const emptyTabs = {
    all: { products: [], totalSize: 0, offset: 1 },
    mostViewed: { products: [], totalSize: 0, offset: 1 },
    bestSelling: { products: [], totalSize: 0, offset: 1 },
  };

  const [
    productsForYou,
    newArrival,
    brands,
    productBrands,
    servicesRaw,
    flashSale,
    featured,
  ] = await Promise.all([
    apiBase
      ? fetchProductsForYouInitial().catch(() => emptyTabs)
      : Promise.resolve(emptyTabs),
    apiBase
      ? fetchNewArrivalProducts(String(NEW_ARRIVAL_CAROUSEL_SIZE), "1").catch(
          () => null,
        )
      : Promise.resolve(null),
    apiBase
      ? fetchVehicleBrands()
          .then((d) => d.brands ?? [])
          .catch(() => [] as VehicleBrandRow[])
      : Promise.resolve([] as VehicleBrandRow[]),
    apiBase
      ? fetchProductBrands("12", "1")
          .then((d) => d?.brands ?? [])
          .catch(() => [] as ProductBrandRow[])
      : Promise.resolve([] as ProductBrandRow[]),
    apiBase
      ? fetchServices().catch(() => [] as unknown[])
      : Promise.resolve([] as unknown[]),
    apiBase
      ? fetchFlashSale({
          limit: "6",
          offset: "1",
          sort_by: "new_arrival",
        }).catch(() => null)
      : Promise.resolve(null),
    apiBase
      ? fetchFeaturedCategories().catch(() => [] as FeaturedBlock[])
      : Promise.resolve([] as FeaturedBlock[]),
  ]);

  const homeServices = parseHomeServices(servicesRaw);
  const newArrivalBg =
    process.env.NEXT_PUBLIC_HOME_NEW_ARRIVAL_BG?.trim() || null;

  return (
    <>
      <HomeFlashSale data={flashSale} currencyCode={currencyCode} />

      <CampaignPromoGrid items={bannerClusterB} />

      <HomeProductsForYouSection
        pageSize={PRODUCTS_FOR_YOU_PAGE_SIZE}
        initial={productsForYou}
      />

      <CampaignPromoGrid items={bannerClusterC} />

      <div className="home-exact-model-bleed">
        <HomeExactModelSection
          brands={brands}
          categories={popular}
          apiConfigured={Boolean(apiBase)}
        />
      </div>

      <div className="home-new-arrival-bleed">
        <HomeNewArrivalSection
          products={newArrival?.products ?? []}
          currencyCode={currencyCode}
          backgroundSrc={newArrivalBg}
        />
      </div>

      {brands.length > 0 ? (
        <section className="store-card px-4 py-6 md:px-6">
          <div className="cdz-block-title text-center">
            <h2 className="text-2xl font-black text-secondary">
              {t("carBrandsTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-secondary/85">
              {t("carBrandsSubtitle")}
            </p>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {brands.slice(0, 12).map((brand) => {
              const src = resolveMediaUrl(
                brand.image_full_url ?? brand.image ?? null,
                { defaultFolder: "vehicle-brand" },
              );

              return (
                <li key={brand.id}>
                  <Link
                    href={`/shop/search?vehicle_brand_id=${brand.id}&offset=1`}
                    className="store-panel relative z-[1] flex min-h-[110px] touch-manipulation flex-col items-center justify-center gap-2 px-3 py-3 text-center hover:border-primary/30"
                  >
                    {src ? (
                      <div className="pointer-events-none relative h-16 w-full">
                        <Image
                          src={src}
                          alt={brand.name}
                          fill
                          sizes="120px"
                          loading="lazy"
                          className="object-contain p-1.5"
                        />
                      </div>
                    ) : (
                      <span className="pointer-events-none inline-flex h-16 w-full items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                        {brand.name.slice(0, 1)}
                      </span>
                    )}
                    <span className="pointer-events-none line-clamp-2 text-xs font-semibold text-secondary">
                      {brand.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 text-center">
            <Link
              href="/shop/vehicle"
              className="store-btn-primary inline-flex items-center justify-center px-6 text-sm"
            >
              {t("carBrandsCta")}
            </Link>
          </div>
        </section>
      ) : null}

      {productBrands.length > 0 ? (
        <section className="store-card px-4 py-6 md:px-6">
          <div className="cdz-block-title text-center">
            <h2 className="text-2xl font-black text-secondary">
              {t("productBrandsTitle")}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-secondary/85">
              {t("productBrandsSubtitle")}
            </p>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {productBrands.slice(0, 12).map((brand) => {
              const src = resolveMediaUrl(
                brand.image_full_url ?? brand.image ?? null,
                { defaultFolder: "product-brand" },
              );

              return (
                <li key={brand.id}>
                  <Link
                    href={`/shop/search?product_brand_id=${brand.id}&offset=1`}
                    className="store-panel relative z-[1] flex min-h-[110px] touch-manipulation flex-col items-center justify-center gap-2 px-3 py-3 text-center hover:border-primary/30"
                  >
                    {src ? (
                      <Image
                        src={src}
                        alt={brand.name}
                        width={80}
                        height={56}
                        loading="lazy"
                        className="pointer-events-none h-12 w-20 object-contain"
                      />
                    ) : (
                      <span className="pointer-events-none inline-flex h-12 w-20 items-center justify-center rounded-md bg-primary/10 text-lg font-bold text-primary">
                        {brand.name.slice(0, 1)}
                      </span>
                    )}
                    <span className="pointer-events-none line-clamp-2 text-xs font-semibold text-secondary">
                      {brand.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 text-center">
            <Link
              href="/shop/brands"
              className="store-btn-primary inline-flex items-center justify-center px-6 text-sm"
            >
              {t("productBrandsCta")}
            </Link>
          </div>
        </section>
      ) : null}

      <HomeServicesSection
        items={homeServices}
        title={t("servicesTitle")}
        subtitle={t("servicesSubtitle")}
        viewAll={t("servicesViewAll")}
        readMore={t("servicesReadMore")}
      />

      {featured.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-secondary">
            {t("sections.featured")}
          </h2>
          {featured.map((block) => (
            <div key={block.category.id} className="store-card space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-secondary">
                  {block.category.name}
                </h3>
                <Link
                  href={`/shop/categories/${block.category.id}`}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {t("viewAll")}
                </Link>
              </div>
              {block.products?.length ? (
                <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {block.products.slice(0, 8).map((p) => (
                    <li key={p.id}>
                      <ProductCard product={p} currencyCode={currencyCode} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-secondary/70">{t("emptySection")}</p>
              )}
            </div>
          ))}
        </section>
      ) : null}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-primary via-amber-400 to-yellow-300 px-8 py-10 md:px-14 md:py-12">
        <div className="pointer-events-none absolute -end-10 -top-10 h-44 w-44 rounded-full bg-black/10" />
        <div className="pointer-events-none absolute -bottom-14 end-24 h-32 w-32 rounded-full bg-black/10" />
        <div className="pointer-events-none absolute start-4 top-4 h-16 w-16 rounded-full bg-white/15" />

        <div className="relative z-10 flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black/10 text-xl">
              💬
            </div>
            <h2 className="text-2xl font-black text-black md:text-3xl">
              {t("quoteCtaTitle")}
            </h2>
            <p className="mt-2 max-w-lg text-sm font-medium text-black/65">
              {t("quoteCtaBody")}
            </p>
          </div>
          <Link
            href="/cms/quote"
            className="shrink-0 rounded-2xl bg-black px-7 py-3.5 text-sm font-black text-white shadow-lg transition-opacity hover:opacity-80"
          >
            {t("quoteCtaButton")}
          </Link>
        </div>
      </section>
    </>
  );
}

export function HomeBelowFoldFallback() {
  return (
    <div className="space-y-8 py-4" aria-hidden>
      <div className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-xl bg-surface-muted"
          />
        ))}
      </div>
    </div>
  );
}
