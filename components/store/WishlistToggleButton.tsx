"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useWishlist } from "@/lib/wishlist-context";
import { toast } from "sonner";

type Props = {
  productId: number;
  className?: string;
};

export function WishlistToggleButton({ productId, className = "" }: Props) {
  const t = useTranslations("Product");
  const locale = useLocale();
  const { ready, isFavorite, toggleFavorite } = useWishlist();
  const [loading, setLoading] = useState(false);
  const active = isFavorite(productId);

  async function onToggle() {
    if (!ready || loading) {
      return;
    }
    setLoading(true);
    const result = await toggleFavorite(productId);
    setLoading(false);
    
    if (result.unauthorized) {
      toast.error(t("unauthorizedWishlist"));
      setTimeout(() => {
        window.location.href = `/${locale}/auth/login`;
      }, 1000);
      return;
    }
    
    if (result.ok) {
      if (result.isFavorite) {
        toast.success(t("addedToWishlist"));
      } else {
        toast.success(t("removedFromWishlist"));
      }
    } else {
      toast.error("Failed to update wishlist");
    }
  }

  if (!ready) {
    return (
      <button
        type="button"
        disabled
        aria-busy="true"
        aria-label={t("wishlistPreparing")}
        title={t("wishlistPreparing")}
        className={`inline-flex h-9 w-9 cursor-wait items-center justify-center rounded-full border border-border-soft bg-white/95 text-secondary shadow-sm opacity-70 ${className}`}
      >
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-secondary/30 border-t-secondary"
          aria-hidden
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void onToggle()}
      disabled={loading}
      aria-busy={loading}
      aria-label={active ? t("removeFromWishlist") : t("addToWishlist")}
      title={active ? t("removeFromWishlist") : t("addToWishlist")}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 text-secondary shadow-sm transition hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-60 ${
        active ? "border-primary text-primary" : "border-border-soft"
      } ${className}`}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
          aria-hidden
        />
      ) : (
        <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} className="h-5 w-5">
          <path
            d="M12 20.4 10.6 19C5.4 14.3 2 11.2 2 7.5 2 4.4 4.4 2 7.5 2c1.8 0 3.6.8 4.5 2.1C12.9 2.8 14.7 2 16.5 2 19.6 2 22 4.4 22 7.5c0 3.7-3.4 6.8-8.6 11.6L12 20.4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
