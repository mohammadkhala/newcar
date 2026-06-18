"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { productPrimaryImageSrc } from "@/lib/product-image";
import type { StoreProductListItem } from "@/lib/types";

type Props = {
  product: StoreProductListItem;
};

function CartIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 6h15l-1.5 9h-12L6 6z" />
      <path d="M6 6 5 3H2" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

/**
 * Catalog-style product tile (reference: hala-car grid-style-25 — image, name, availability CTA).
 */
export function CatalogProductCard({ product }: Props) {
  const t = useTranslations("Product");
  const src = productPrimaryImageSrc(product.image);
  const href = `/shop/product/${product.id}`;

  return (
    <article className="flex h-full flex-col overflow-hidden bg-surface-muted">
      <Link href={href} className="relative block aspect-square bg-white">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote API hosts vary
          <img
            src={src}
            alt=""
            width={400}
            height={400}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-secondary/50">
            {t("noImage")}
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 px-3 pb-3 pt-3 text-center">
        <Link
          href={href}
          className="line-clamp-2 min-h-11 text-sm font-semibold leading-snug text-secondary"
        >
          {product.name}
        </Link>
        <Link
          href={href}
          className="mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition-opacity hover:opacity-90 bg-primary text-white"
        >
          <span>{t("addToCart")}</span>
          <CartIcon />
        </Link>
      </div>
    </article>
  );
}
