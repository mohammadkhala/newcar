import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import {
  HomeHeroCarousel,
  type HomeHeroSlide,
} from "@/components/store/HomeHeroCarousel";
import { HomeProductTabs } from "@/components/store/HomeProductTabs";
import { TrustStrip } from "@/components/store/TrustStrip";
import { CampaignPromoGrid } from "@/components/store/CampaignPromoGrid";
import {
  HomeServicesSection,
  type HomeServiceRow,
} from "@/components/store/HomeServicesSection";
import { VehicleFitmentPicker } from "@/components/vehicle/VehicleFitmentPicker";
import { HomeFlashSale } from "@/components/store/HomeFlashSale";
import {
  fetchBanners,
  fetchCampaignBanners,
  fetchConfig,
  fetchDiscountedProducts,
  fetchFeaturedCategories,
  fetchFlashSale,
  fetchLatestProducts,
  fetchNewArrivalProducts,
  fetchPopularCategories,
  fetchProductBrands,
  fetchServices,
  fetchVehicleBrands,
  getApiBaseUrl,
  type FeaturedBlock,
} from "@/lib/api";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type {
  BannerRow,
  CategoryRow,
  ProductBrandListResponse,
  VehicleBrandsResponse,
} from "@/lib/types";

type VehicleBrandRow = VehicleBrandsResponse["brands"][number];
type ProductBrandRow = ProductBrandListResponse["brands"][number];

type Props = { params: Promise<{ locale: string }> };
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
  const tNav = await getTranslations("Nav");
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

  const [
    banners,
    campaignBanners,
    featured,
    popular,
    latest,
    discounted,
    newArrival,
    config,
    brands,
    productBrands,
    servicesRaw,
    flashSale,
  ] = await Promise.all([
    fetchBanners(),
    fetchCampaignBanners(),
    fetchFeaturedCategories().catch(() => [] as FeaturedBlock[]),
    fetchPopularCategories().catch(() => [] as CategoryRow[]),
    fetchLatestProducts("8", "1").catch(() => null),
    fetchDiscountedProducts().catch(() => null),
    fetchNewArrivalProducts("8", "1").catch(() => null),
    fetchConfig().catch(() => null),
    brandsPromise,
    productBrandsPromise,
    servicesPromise,
    flashPromise,
  ]);

  const homeServices = parseHomeServices(servicesRaw);

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

  const shortcutCategories = popular.slice(0, 12);

  return (
    <>
      {slides.length > 0 ? <HomeHeroCarousel slides={slides} /> : null}

      <HomeFlashSale data={flashSale} currencyCode={currencyCode} />

      <div className="store-shell space-y-10 py-8 md:space-y-12">
        <section className="store-card overflow-hidden">
          <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
            <div>
              <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {t("heroBadge")}
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-secondary md:text-4xl">
                {t("title")}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-secondary/90 md:text-base">
                {t("tagline")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/shop/vehicle"
                  className="store-btn-primary inline-flex items-center justify-center px-6 text-sm"
                >
                  {tNav("shopByVehicle")}
                </Link>
                <Link
                  href="/shop/search"
                  className="store-btn-soft inline-flex items-center justify-center px-6 text-sm"
                >
                  {t("heroBrowseCta")}
                </Link>
              </div>
              <p className="mt-5 text-xs text-secondary/70">{t("heroHelp")}</p>
            </div>

            <div className="store-panel p-4 md:p-5">
              <h2 className="text-lg font-bold text-secondary">{t("fitmentTitle")}</h2>
              <p className="mt-1 text-sm text-secondary/85">{t("fitmentSubtitle")}</p>
              <div className="mt-5">
                <VehicleFitmentPicker
                  brands={brands}
                  apiConfigured={Boolean(apiBase)}
                />
              </div>
            </div>
          </div>
        </section>

        <TrustStrip />

        {shortcutCategories.length > 0 ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-semibold text-secondary">
                {t("shortcutsTitle")}
              </h2>
              <Link
                href="/shop/categories"
                className="text-sm font-medium text-primary hover:underline"
              >
                {t("viewAll")}
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {shortcutCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/shop/categories/${c.id}`}
                    className="store-card flex min-h-[4.5rem] items-center justify-center px-3 py-3 text-center text-sm font-semibold text-secondary hover:border-primary/30"
                  >
                    {c.name ?? `#${c.id}`}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <HomeProductTabs
          currencyCode={currencyCode}
          latest={latest?.products ?? []}
          discounted={discounted ?? []}
          newArrival={newArrival?.products ?? []}
        />

        <CampaignPromoGrid items={campaignBanners} />

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
                        <Image
                          src={src}
                          alt={brand.name}
                          width={56}
                          height={56}
                          unoptimized
                          className="h-14 w-14 rounded-full border border-border-soft bg-white object-cover"
                        />
                      ) : (
                        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
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
                          unoptimized
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

        <section className="store-card border-primary/20 bg-linear-to-br from-primary/5 to-white px-6 py-8 text-center md:text-start">
          <h2 className="text-xl font-semibold text-secondary">
            {t("quoteCtaTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-secondary/90">
            {t("quoteCtaBody")}
          </p>
          <Link
            href="/cms/quote"
            className="store-btn-primary mt-4 inline-flex items-center justify-center px-6 text-sm"
          >
            {t("quoteCtaButton")}
          </Link>
        </section>
      </div>
    </>
  );
}
