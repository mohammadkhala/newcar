import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import {
  HomeHeroCarousel,
  type HomeHeroSlide,
} from "@/components/store/HomeHeroCarousel";
import { TrustStrip } from "@/components/store/TrustStrip";
import { CampaignPromoGrid } from "@/components/store/CampaignPromoGrid";
import {
  HomeServicesSection,
  type HomeServiceRow,
} from "@/components/store/HomeServicesSection";
import { HomeFlashSale } from "@/components/store/HomeFlashSale";
import { HomeCategoryVisualSection } from "@/components/store/HomeCategoryVisualSection";
import {
  HomeProductsForYouSection,
  type ProductsForYouTabData,
  type ProductsForYouTabKey,
} from "@/components/store/HomeProductsForYouSection";
import { HomeExactModelSection } from "@/components/store/HomeExactModelSection";
import { HomeNewArrivalSection } from "@/components/store/HomeNewArrivalSection";
import {
  fetchBanners,
  fetchCampaignBanners,
  fetchConfig,
  fetchFeaturedCategories,
  fetchFlashSale,
  fetchLatestProducts,
  fetchNewArrivalProducts,
  fetchPopularCategories,
  fetchProductBrands,
  fetchProductSearch,
  fetchServices,
  fetchVehicleBrands,
  getApiBaseUrl,
  type FeaturedBlock,
} from "@/lib/api";
import { categoryDisplayImageSrc } from "@/lib/category-image";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type {
  BannerRow,
  CampaignBannerRow,
  CategoryRow,
  ProductBrandListResponse,
  VehicleBrandsResponse,
} from "@/lib/types";

type VehicleBrandRow = VehicleBrandsResponse["brands"][number];
type ProductBrandRow = ProductBrandListResponse["brands"][number];

type Props = { params: Promise<{ locale: string }> };

/** Public home can be revalidated; auth no longer forces dynamic via cookies(). */
export const revalidate = 60;

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

/**
 * SSR only the default tab (best_selling). Other tabs load on the client when
 * selected — removes ~2 heavy products/search calls from the critical path.
 */
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

/**
 * Splits campaign banners sequentially into fixed-size clusters (e.g. [4, 4, 6]) so they
 * land as 2-column banner-pair grids between homepage sections, matching hala-car's
 * distribution (clusters of paired banner rows between content blocks, not one giant grid).
 * Any banners beyond the declared sizes are appended to the last cluster.
 */
function chunkBanners<T>(items: T[], sizes: number[]): T[][] {
  const result: T[][] = [];
  let idx = 0;
  for (const size of sizes) {
    result.push(items.slice(idx, idx + size));
    idx += size;
  }
  if (idx < items.length) {
    result[result.length - 1] = [
      ...(result[result.length - 1] ?? []),
      ...items.slice(idx),
    ];
  }
  return result;
}

/**
 * Temporary frontend copy for campaign banners whose Laravel `title` is still seed/test
 * data ("test", "14", "٢"...). We don't have an authenticated admin endpoint to update the
 * real records, so this stands in until someone sets proper titles in the admin panel —
 * keyed by banner id, matched against the actual creative each id currently uses.
 * id 2-6's image already has its own baked-in headline, so it's overridden to "" to avoid
 * a duplicate caption on top of the artwork.
 */
const CAMPAIGN_TITLE_OVERRIDES: Record<number, string> = {
  1: "ارتقِ بسيارتك لمستوى أعلى من الفخامة",
  17: "ارتقِ بسيارتك لمستوى أعلى من الفخامة",
  18: "ارتقِ بسيارتك لمستوى أعلى من الفخامة",
  14: "تشكيلة إكسسوارات فاخرة تناسب كل سيارة",
  16: "تشكيلة إكسسوارات فاخرة تناسب كل سيارة",
  9: "أرضيات 3W الأصلية لحماية سيارتك بأناقة",
  13: "أرضيات 3W الأصلية لحماية سيارتك بأناقة",
  15: "أرضيات 3W الأصلية لحماية سيارتك بأناقة",
  11: "جودة تدوم وحماية تستحقها سيارتك",
  2: "",
  3: "",
  4: "",
  5: "",
  6: "",
};

function bannerSlideSrc(b: BannerRow): string | null {
  const fullpath =
    typeof b.image_fullpath === "string" ? b.image_fullpath : undefined;
  const raw =
    (typeof b.image === "string" && b.image) ||
    (typeof b.image_full_url === "string" && b.image_full_url) ||
    fullpath ||
    null;
  return resolveMediaUrl(raw, { defaultFolder: "banner" });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const apiBase = getApiBaseUrl();

  const brandsPromise = apiBase
    ? fetchVehicleBrands()
        .then((d) => d.brands ?? [])
        .catch(() => [] as VehicleBrandRow[])
    : Promise.resolve([] as VehicleBrandRow[]);

  const productBrandsPromise = apiBase
    ? fetchProductBrands("12", "1")
        .then((d) => d?.brands ?? [])
        .catch(() => [] as ProductBrandRow[])
    : Promise.resolve([] as ProductBrandRow[]);

  const servicesPromise = apiBase
    ? fetchServices().catch(() => [] as unknown[])
    : Promise.resolve([] as unknown[]);

  const flashPromise = apiBase
    ? fetchFlashSale({ limit: "6", offset: "1", sort_by: "new_arrival" }).catch(
        () => null,
      )
    : Promise.resolve(null);

  const productsForYouPromise = apiBase
    ? fetchProductsForYouInitial().catch(() => ({
        all: { products: [], totalSize: 0, offset: 1 },
        mostViewed: { products: [], totalSize: 0, offset: 1 },
        bestSelling: { products: [], totalSize: 0, offset: 1 },
      }))
    : Promise.resolve({
        all: { products: [], totalSize: 0, offset: 1 },
        mostViewed: { products: [], totalSize: 0, offset: 1 },
        bestSelling: { products: [], totalSize: 0, offset: 1 },
      });

  const [
    banners,
    campaignBanners,
    featured,
    popular,
    newArrival,
    config,
    brands,
    productBrands,
    servicesRaw,
    flashSale,
    productsForYou,
  ] = await Promise.all([
    fetchBanners(),
    fetchCampaignBanners(),
    fetchFeaturedCategories().catch(() => [] as FeaturedBlock[]),
    fetchPopularCategories().catch(() => [] as CategoryRow[]),
    fetchNewArrivalProducts(String(NEW_ARRIVAL_CAROUSEL_SIZE), "1").catch(() => null),
    fetchConfig().catch(() => null),
    brandsPromise,
    productBrandsPromise,
    servicesPromise,
    flashPromise,
    productsForYouPromise,
  ]);

  const homeServices = parseHomeServices(servicesRaw);

  const newArrivalBg =
    process.env.NEXT_PUBLIC_HOME_NEW_ARRIVAL_BG?.trim() || null;

  const currencyCode =
    (config?.currency_code as string | undefined) ||
    (config?.currency_symbol as string | undefined) ||
    "ILS";

  const slides = banners
    .map((b, i): HomeHeroSlide | null => {
      const src = bannerSlideSrc(b);
      if (!src) {
        return null;
      }
      return {
        key: String(b.id ?? `banner-${i}`),
        src,
        alt: String(b.title ?? ""),
        href: typeof b.url === "string" && b.url ? b.url : null,
      };
    })
    .filter((s): s is HomeHeroSlide => s !== null);

  const shortcutCategories = popular.slice(0, 12).map((category) => ({
    id: category.id,
    name: category.name ?? `#${category.id}`,
    imageSrc: categoryDisplayImageSrc(category),
  }));

  const orderedCampaigns = campaignBanners
    .map((b: CampaignBannerRow) =>
      b.id in CAMPAIGN_TITLE_OVERRIDES
        ? { ...b, title: CAMPAIGN_TITLE_OVERRIDES[b.id] }
        : b,
    )
    .sort(
      (a: CampaignBannerRow, b: CampaignBannerRow) =>
        (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id - b.id,
    );
  // hala-car distribution: clusters of paired banners between TrustStrip→categories,
  // categories→products, and products→exact-model (4, 4, then the rest).
  const [bannerClusterA, bannerClusterB, bannerClusterC] = chunkBanners(
    orderedCampaigns,
    [4, 4, Infinity],
  );

  return (
    <>
      {slides.length > 0 ? <HomeHeroCarousel slides={slides} /> : null}

      <HomeFlashSale data={flashSale} currencyCode={currencyCode} />

      <div className="store-shell space-y-10 py-8 md:space-y-12">
        <TrustStrip />

        <CampaignPromoGrid items={bannerClusterA} />

        <HomeCategoryVisualSection
          items={shortcutCategories}
          title={t("shortcutsTitle")}
          subtitle={t("shortcutsSubtitle")}
          viewAll={t("viewAll")}
        />

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
                      className="store-panel flex min-h-[110px] flex-col items-center justify-center gap-2 px-3 py-3 text-center hover:border-primary/30"
                    >
                      {src ? (
                        <div className="relative h-16 w-full">
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
                        <span className="inline-flex h-16 w-full items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                          {brand.name.slice(0, 1)}
                        </span>
                      )}
                      <span className="line-clamp-2 text-xs font-semibold text-secondary">
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
                      className="store-panel flex min-h-[110px] flex-col items-center justify-center gap-2 px-3 py-3 text-center hover:border-primary/30"
                    >
                      {src ? (
                        <Image
                          src={src}
                          alt={brand.name}
                          width={80}
                          height={56}
                          loading="lazy"
                          className="h-12 w-20 object-contain"
                        />
                      ) : (
                        <span className="inline-flex h-12 w-20 items-center justify-center rounded-md bg-primary/10 text-lg font-bold text-primary">
                          {brand.name.slice(0, 1)}
                        </span>
                      )}
                      <span className="line-clamp-2 text-xs font-semibold text-secondary">
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
                        <ProductCard
                          product={p}
                          currencyCode={currencyCode}
                        />
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
          {/* Decorative circles */}
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
      </div>
    </>
  );
}
