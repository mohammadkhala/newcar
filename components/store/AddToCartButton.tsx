"use client";

import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart-context";
import type { StoreProductListItem } from "@/lib/types";
import { getProductPriceInfo } from "@/lib/product-price";
import { toast } from "sonner";

type Props = {
  product: StoreProductListItem;
};

export function AddToCartButton({ product }: Props) {
  const t = useTranslations("Product");
  const { add } = useCart();
  const { inStock } = getProductPriceInfo(product);

  function handleAdd() {
    if (!inStock) {
      return;
    }
    add(product, 1);
    toast.success(t("addedToCart"), {
      description: product.name,
    });
  }

  return (
    <button
      type="button"
      disabled={!inStock}
      onClick={handleAdd}
      className="store-btn-primary mt-2 flex w-full items-center justify-center gap-2 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
    >
      {inStock ? t("addToCart") : t("outOfStock")}
    </button>
  );
}
