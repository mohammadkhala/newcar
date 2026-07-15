"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/format-price";
import { getProductPriceInfo } from "@/lib/product-price";
import { productPrimaryImageSrc } from "@/lib/product-image";
import type { StoreProductListItem } from "@/lib/types";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { WishlistToggleButton } from "@/components/store/WishlistToggleButton";
import { FallbackImg } from "@/components/store/FallbackImg";

type Props = {
  product: StoreProductListItem;
  currencyCode?: string;
  showAdd?: boolean;
};

export function ProductCard({
  product,
  currencyCode = "ILS",
  showAdd = true,
}: Props) {
  const t = useTranslations("Product");
  const locale = useLocale();
  const src = productPrimaryImageSrc(product.image);
  const href = `/shop/product/${product.id}`;
  const priceInfo = getProductPriceInfo(product);

  return (
    <article className="store-card group flex h-full flex-col overflow-hidden transition-transform hover:-translate-y-0.5">
      <div className="relative">
        <Link href={href} className="relative block aspect-[4/3] touch-manipulation bg-surface-muted">
          <FallbackImg
            src={src ?? "/logo.png"}
            alt=""
            width={800}
            height={600}
            loading="lazy"
            decoding="async"
            className="pointer-events-none h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            fallbackClassName="pointer-events-none h-full w-full object-contain p-6 opacity-60"
          />
        </Link>
        <div className="absolute start-2 top-2 z-10 flex flex-col gap-1">
          {/* Stock badge removed */}
        </div>
        <div className="absolute end-2 top-2 z-10">
          <WishlistToggleButton productId={Number(product.id)} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link href={href} className="line-clamp-2 min-h-11 text-sm font-semibold text-black md:text-base">
          {product.name}
        </Link>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            {priceInfo.hasDiscount ? (
              <span className="text-xs text-secondary/60 line-through">
                {formatMoney(priceInfo.originalPrice, locale, currencyCode)}
              </span>
            ) : null}
            <span className="text-base font-extrabold text-primary md:text-lg">
              {formatMoney(priceInfo.finalPrice, locale, currencyCode)}
            </span>
          </div>
          {priceInfo.hasDiscount && priceInfo.discountPercent > 0 ? (
            <span className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
              {t("discount")} {priceInfo.discountPercent}%
            </span>
          ) : null}
        </div>
        {showAdd && <AddToCartButton product={product} />}
      </div>
    </article>
  );
}
