"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconCart } from "@/components/store/header-icons";
import { useCart } from "@/lib/cart-context";

type Props = {
  /** New Car: white icon, label (e.g. سلة المشتريات), yellow count badge. */
  variant?: "light" | "dark" | "newcar";
  compact?: boolean;
};

/**
 * Minicart trigger: `newcar` matches stacked label + `IconCart` per reference.
 */
export function CartBadge({ variant = "light", compact = false }: Props) {
  const t = useTranslations("Nav");
  const { lines } = useCart();
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const dark = variant === "dark";
  const newcar = variant === "newcar";

  if (newcar) {
    return (
      <div id="desk_cart-wrapper" className="cart-link">
        <Link
          href="/shop/cart"
          className="action showcart cdz-top-link group flex min-w-0 max-w-[6.5rem] flex-col items-center gap-0.5 text-center text-white no-underline outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#EAB308] focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:max-w-[7rem]"
          aria-label={t("cartAria")}
        >
          <span className="relative inline-flex items-center justify-center text-white">
            <IconCart
              className={compact ? "h-5 w-5" : "h-6 w-6 sm:h-7 sm:w-7"}
            />
            {count > 0 && (
              <span className="absolute -top-1.5 -end-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#EAB308] px-0.5 text-[8px] font-bold text-neutral-900 ring-1 ring-black/20 sm:min-w-4 sm:text-[9px]">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </span>
          <span
            className={
              compact
                ? "max-w-[4.5rem] text-[8px] font-semibold leading-tight"
                : "max-w-[5.5rem] text-[9px] font-semibold leading-tight sm:max-w-[6rem] sm:text-[10px]"
            }
          >
            {t("cartLabelShort")}
          </span>
        </Link>
      </div>
    );
  }

  const baseLight = `action showcart cdz-top-link group relative inline-flex items-center justify-center rounded-sm border-0 bg-transparent p-0 text-inherit no-underline outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
    compact ? "h-9 w-7 min-w-[1.75rem]" : "h-9 w-8 min-w-[2rem] sm:h-10"
  }`;

  return (
    <div id="desk_cart-wrapper" className="cart-link">
      <Link
        href="/shop/cart"
        className={
          dark
            ? `showcart inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-white/25 text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary/60 ${
                compact ? "h-9 w-8" : ""
              }`
            : baseLight
        }
        aria-label={t("cartAria")}
        title={t("cartAria")}
      >
        <span className="relative inline-flex h-6 w-6 items-center justify-center sm:h-6 sm:w-6">
          <IconCart
            className={
              dark ? "h-5 w-5" : "h-6 w-6 text-secondary group-hover:text-primary"
            }
          />
          {count > 0 && (
            <span
              className={`absolute -top-1.5 -end-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold leading-none text-white ring-2 sm:-top-2 sm:min-w-[1.125rem] sm:text-[10px] ${
                dark ? "ring-slate-900" : "ring-white"
              }`}
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </span>
      </Link>
    </div>
  );
}
