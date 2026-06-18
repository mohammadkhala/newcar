import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { WishlistToggleButton } from "@/components/store/WishlistToggleButton";
import {
  fetchConfig,
  fetchProductDetail,
  fetchProductReviews,
  getApiBaseUrl,
} from "@/lib/api";
import { formatMoney } from "@/lib/format-price";
import { productAllImageSrcs } from "@/lib/product-image";
import { ProductImageGallery } from "@/components/store/ProductImageGallery";
import { ReviewsCarousel } from "@/components/store/ReviewsCarousel";

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ShopProductPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Product");
  const apiBase = getApiBaseUrl();
  if (!apiBase) {
    return (
      <p className="text-sm text-red-600">{t("configMissing")}</p>
    );
  }

  const [payload, reviewsPayload, config] = await Promise.all([
    fetchProductDetail(id),
    fetchProductReviews(id, "10", "1"),
    fetchConfig(),
  ]);

  if (!payload?.product) {
    notFound();
  }

  const loc = await getLocale();
  const currencyCode =
    (config?.currency_code as string | undefined) || "ILS";

  const p = payload.product;
  const images = productAllImageSrcs(p.image, p.image_fullpath);
  const related = payload.related_products ?? [];
  const also = payload.customers_also_bought ?? [];
  const ratingBlock = payload.overall_rating as
    | { rating?: number[]; total?: number }
    | undefined;
  const avgRating =
    ratingBlock?.rating && ratingBlock.rating.length > 0
      ? ratingBlock.rating[0]
      : null;
  const reviewCount = ratingBlock?.total ?? 0;
  const reviews = reviewsPayload?.data ?? [];

  return (
    <div className="store-shell space-y-8 py-8 md:space-y-10">
      <nav className="text-sm text-secondary/80">
        <Link href="/shop/search" className="text-primary hover:underline">
          {t("breadcrumbSearch")}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-secondary">{p.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ProductImageGallery
            images={images}
            alt={p.name ?? ""}
            noImageLabel={t("noImage")}
          />
        </div>
        <div className="space-y-4 lg:col-span-5">
          <div className="store-card p-5 md:p-6">
            <h1 className="text-2xl font-black leading-tight text-secondary md:text-3xl">
              {p.name}
            </h1>
            <p className="mt-3 text-3xl font-black text-primary">
              {formatMoney(Number(p.price), loc, currencyCode)}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {avgRating != null && (
                <div className="store-panel px-3 py-2 text-secondary/90">
                  {t("rating")}: <strong>{avgRating.toFixed(1)}</strong> ({reviewCount})
                </div>
              )}
              {p.discount != null && p.discount > 0 && (
                <div className="store-panel px-3 py-2 text-red-600">
                  {t("discount")} <strong>{p.discount}%</strong>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <AddToCartButton product={p} />
              <WishlistToggleButton productId={Number(p.id)} />
            </div>
            <p className="mt-3 text-xs text-secondary/60">{t("descriptionTrusted")}</p>
          </div>

          {p.description && p.description.replace(/<[^>]*>/g, "").trim().length > 0 && (
            <section className="store-card p-5 md:p-6">
              <h2 className="text-base font-bold text-secondary">{t("descriptionTitle")}</h2>
              <div
                className="mt-3 text-sm leading-relaxed text-secondary/90
                  [&_p]:mb-3 [&_p:last-child]:mb-0
                  [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:ps-5
                  [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:ps-5
                  [&_li]:mb-1
                  [&_strong]:font-bold [&_b]:font-bold
                  [&_em]:italic [&_i]:italic
                  [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-secondary
                  [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-secondary
                  [&_h3]:mb-1 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-secondary
                  [&_a]:text-primary [&_a]:underline
                  [&_blockquote]:border-s-4 [&_blockquote]:border-primary/30 [&_blockquote]:ps-4 [&_blockquote]:text-secondary/70
                  [&_img]:max-w-full [&_img]:rounded-lg"
                dangerouslySetInnerHTML={{ __html: p.description }}
              />
            </section>
          )}
        </div>
      </div>

      <section className="store-card space-y-4 p-5 md:p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-secondary">{t("reviews")}</h2>
          {avgRating != null && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-primary">{avgRating.toFixed(1)}</span>
              <div className="flex gap-0.5" aria-label={`${avgRating} ${t("outOf5")}`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "text-amber-400" : "text-border-soft"}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-secondary/60">({reviewCount})</span>
            </div>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="text-sm text-secondary/70">{t("noReviews")}</p>
        ) : (
          <ReviewsCarousel
            reviews={reviews}
            anonymousReviewer={t("anonymousReviewer")}
            outOf5={t("outOf5")}
          />
        )}
      </section>

      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-secondary">{t("related")}</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} currencyCode={currencyCode} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {also.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-secondary">{t("alsoBought")}</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {also.map((item) => (
              <li key={item.id}>
                <ProductCard product={item} currencyCode={currencyCode} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
