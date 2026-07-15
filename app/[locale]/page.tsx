import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import {
  HomeHeroCarousel,
  type HomeHeroSlide,
} from "@/components/store/HomeHeroCarousel";
import { TrustStrip } from "@/components/store/TrustStrip";
import { CampaignPromoGrid } from "@/components/store/CampaignPromoGrid";
import { HomeCategoryVisualSection } from "@/components/store/HomeCategoryVisualSection";
import {
  HomeBelowFold,
  HomeBelowFoldFallback,
} from "@/components/store/home/HomeBelowFold";
import {
  fetchBanners,
  fetchCampaignBanners,
  fetchPopularCategories,
  getApiBaseUrl,
} from "@/lib/api";
import { categoryDisplayImageSrc } from "@/lib/category-image";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import type { BannerRow, CampaignBannerRow, CategoryRow } from "@/lib/types";

type Props = { params: Promise<{ locale: string }> };

/** Public home can be revalidated; auth no longer forces dynamic via cookies(). */
export const revalidate = 60;

/**
 * Temporary frontend copy for campaign banners whose Laravel `title` is still seed/test
 * data. Keyed by banner id until admin titles are fixed.
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
 * Above-the-fold only awaits banners + popular categories, then streams the rest
 * via Suspense so products/search and featured blocks cannot block first paint HTML.
 */
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const apiBase = getApiBaseUrl();

  const [banners, campaignBanners, popular] = await Promise.all([
    apiBase ? fetchBanners() : Promise.resolve([] as BannerRow[]),
    apiBase
      ? fetchCampaignBanners()
      : Promise.resolve([] as CampaignBannerRow[]),
    apiBase
      ? fetchPopularCategories().catch(() => [] as CategoryRow[])
      : Promise.resolve([] as CategoryRow[]),
  ]);

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

  const [bannerClusterA, bannerClusterB, bannerClusterC] = chunkBanners(
    orderedCampaigns,
    [4, 4, Infinity],
  );

  return (
    <>
      {slides.length > 0 ? <HomeHeroCarousel slides={slides} /> : null}

      <div className="store-shell space-y-10 py-8 md:space-y-12">
        <TrustStrip />

        <CampaignPromoGrid items={bannerClusterA} />

        <HomeCategoryVisualSection
          items={shortcutCategories}
          title={t("shortcutsTitle")}
          subtitle={t("shortcutsSubtitle")}
          viewAll={t("viewAll")}
        />

        <Suspense fallback={<HomeBelowFoldFallback />}>
          <HomeBelowFold
            popular={popular}
            bannerClusterB={bannerClusterB}
            bannerClusterC={bannerClusterC}
          />
        </Suspense>
      </div>
    </>
  );
}
