"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/format-price";
import { productPrimaryImageSrc } from "@/lib/product-image";

export default function CartPage() {
  const t = useTranslations("Cart");
  const tCheckout = useTranslations("Checkout");
  const locale = useLocale();
  const { lines, remove, setQty } = useCart();

  const total = lines.reduce(
    (sum, l) => sum + l.price * l.quantity,
    0,
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-secondary">{t("title")}</h1>
      <p className="text-sm text-secondary/70">{t("couponHint")}</p>

      {lines.length === 0 ? (
        <p className="text-secondary/80">{t("empty")}</p>
      ) : (
        <>
          <ul className="space-y-4">
            {lines.map((l) => {
              const src = productPrimaryImageSrc(l.image);
              return (
                <li
                  key={l.productId}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-surface-muted p-4"
                >
                  <Link
                    href={`/shop/product/${l.productId}`}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted"
                  >
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/shop/product/${l.productId}`}
                      className="font-medium text-secondary hover:underline"
                    >
                      {l.name}
                    </Link>
                    <p className="text-sm text-primary">
                      {formatMoney(l.price, locale)}
                    </p>
                    <label className="mt-2 flex items-center gap-2 text-sm">
                      Qty
                      <input
                        type="number"
                        min={1}
                        value={l.quantity}
                        onChange={(e) =>
                          setQty(l.productId, Number(e.target.value) || 1)
                        }
                        className="w-20 rounded border border-surface-muted px-2 py-1"
                        autoComplete="off"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(l.productId)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    {t("remove")}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-surface-muted pt-4">
            <p className="text-lg font-semibold text-secondary">
              {t("total")}: {formatMoney(total, locale)}
            </p>
            <Link
              href="/shop/checkout"
              className="inline-flex min-h-11 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:opacity-90"
            >
              {tCheckout("title")}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
