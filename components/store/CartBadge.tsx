"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { IconCart } from "@/components/store/header-icons";
import { useCart } from "@/lib/cart-context";

type Props = {
  variant?: "light" | "dark";
};

export function CartBadge({ variant = "light" }: Props) {
  const t = useTranslations("Nav");
  const { lines } = useCart();
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const dark = variant === "dark";

  return (
    <Link
      href="/shop/cart"
      aria-label={t("cartAria")}
      className={`relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 ${
        dark
          ? "border-white/25 bg-white/5 text-white hover:border-primary/40 hover:bg-white/10"
          : "border-surface-muted bg-white text-secondary hover:bg-surface-muted"
      }`}
    >
      <IconCart className="h-5 w-5" />
      {count > 0 && (
        <span
          className={`absolute -top-1 -end-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white shadow-sm ring-2 ${
            dark ? "ring-slate-900" : "ring-white"
          }`}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
