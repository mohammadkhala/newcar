import type { StoreProductListItem } from "@/lib/types";

type PriceInfo = {
  originalPrice: number;
  finalPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  inStock: boolean;
};

/**
 * Display prices from list API: percent vs fixed discount; stock when total_stock is present.
 */
export function getProductPriceInfo(product: StoreProductListItem): PriceInfo {
  const originalPrice = Number(product.price) || 0;
  const discount = Number(product.discount ?? 0);
  const discountType = product.discount_type ?? "percent";
  const totalStock = product.total_stock;

  let finalPrice = originalPrice;
  let discountPercent = 0;

  if (discount > 0) {
    if (discountType === "percent") {
      finalPrice = originalPrice * (1 - discount / 100);
      discountPercent = discount;
    } else {
      finalPrice = originalPrice - discount;
      discountPercent =
        originalPrice > 0 ? Math.round((discount / originalPrice) * 100) : 0;
    }
    finalPrice = Math.max(0, finalPrice);
  }

  return {
    originalPrice,
    finalPrice,
    hasDiscount: discount > 0,
    discountPercent,
    inStock: totalStock == null || totalStock > 0,
  };
}
