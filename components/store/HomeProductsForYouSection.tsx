"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CatalogProductCard } from "@/components/store/CatalogProductCard";
import { clientFetchProductSearch } from "@/lib/client-api";
import type { StoreProductListItem } from "@/lib/types";

export type ProductsForYouTabKey = "all" | "mostViewed" | "bestSelling";

export type ProductsForYouTabData = {
  products: StoreProductListItem[];
  totalSize: number;
  offset: number;
};

type Props = {
  pageSize: number;
  initial: Record<ProductsForYouTabKey, ProductsForYouTabData>;
};

const TAB_SORT: Record<ProductsForYouTabKey, string> = {
  all: "a_to_z",
  mostViewed: "most_viewed",
  bestSelling: "best_selling",
};

const TAB_ORDER: ProductsForYouTabKey[] = [
  "all",
  "mostViewed",
  "bestSelling",
];

/**
 * Home "Products for you" — Codazon tabs-style-08 (box-cate-link + mobile dropdown).
 */
export function HomeProductsForYouSection({ pageSize, initial }: Props) {
  const t = useTranslations("Home.productsForYou");
  const locale = useLocale();

  const tabs = useMemo(
    () =>
      TAB_ORDER.map((id) => ({
        id,
        label: t(
          id === "all"
            ? "all"
            : id === "mostViewed"
              ? "mostViewed"
              : "bestSelling",
        ),
      })).filter((tab) => {
        if (tab.id === "bestSelling") {
          return (
            initial.bestSelling.products.length > 0 ||
            initial.all.products.length > 0
          );
        }
        return initial[tab.id].products.length > 0;
      }),
    [t, initial],
  );

  const defaultTab: ProductsForYouTabKey = tabs.some((tab) => tab.id === "bestSelling")
    ? "bestSelling"
    : (tabs[0]?.id ?? "bestSelling");

  const [active, setActive] = useState<ProductsForYouTabKey>(defaultTab);
  const [tabState, setTabState] = useState(() => {
    const next = { ...initial };
    if (
      next.bestSelling.products.length === 0 &&
      next.all.products.length > 0
    ) {
      next.bestSelling = {
        products: [...next.all.products],
        totalSize: next.all.totalSize,
        offset: next.all.offset,
      };
    }
    return next;
  });
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const effectiveActive = tabs.some((tab) => tab.id === active)
    ? active
    : defaultTab;

  const activeLabel =
    tabs.find((tab) => tab.id === effectiveActive)?.label ?? t("bestSelling");

  const current = tabState[effectiveActive];
  const hasMore = current.products.length < current.totalSize;

  const selectTab = useCallback((id: ProductsForYouTabKey) => {
    setActive(id);
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [menuOpen]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) {
      return;
    }
    setLoading(true);
    const nextOffset = current.offset + 1;
    try {
      const data = await clientFetchProductSearch(
        {
          sort_by: TAB_SORT[effectiveActive],
          limit: String(pageSize),
          offset: String(nextOffset),
        },
        locale,
      );
      if (!data?.products?.length) {
        return;
      }
      setTabState((prev) => {
        const row = prev[effectiveActive];
        const seen = new Set(row.products.map((p) => p.id));
        const merged = [...row.products];
        for (const product of data.products) {
          if (!seen.has(product.id)) {
            merged.push(product);
            seen.add(product.id);
          }
        }
        return {
          ...prev,
          [effectiveActive]: {
            products: merged,
            totalSize: data.total_size ?? row.totalSize,
            offset: nextOffset,
          },
        };
      });
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, current.offset, effectiveActive, pageSize, locale]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <section
      className="cdz-tabs-wrap tabs-style-08 home-products-for-you"
      aria-label={t("title")}
    >
      <div className="cdz-block-title">
        <h2 className="b-title text-2xl font-black text-secondary">{t("title")}</h2>
        <button
          type="button"
          className={`home-tab-mobile-toggle md:hidden ${menuOpen ? "open" : ""}`}
          aria-expanded={menuOpen}
          aria-haspopup="listbox"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {activeLabel}
        </button>
      </div>

      <div className="cdz-block-content" ref={menuRef}>
        <ul
          className={`box-cate-link ${menuOpen ? "abs-dropdown is-open" : ""}`}
          role="tablist"
          aria-label={t("title")}
          dir="ltr"
        >
          {tabs.map((tab) => {
            const isActive = effectiveActive === tab.id;
            return (
              <li
                key={tab.id}
                className={`item ${isActive ? "active" : ""}`}
                role="presentation"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className="tab-title"
                  onClick={() => selectTab(tab.id)}
                >
                  <span>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="tab-content pt-6 md:pt-10" role="tabpanel">
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {current.products.map((product) => (
              <li key={product.id}>
                <CatalogProductCard product={product} />
              </li>
            ))}
          </ul>

          {hasMore ? (
            <div className="listing-actions mt-6 text-center">
              <button
                type="button"
                data-role="ajax_trigger"
                onClick={() => void loadMore()}
                disabled={loading}
                className="cdz-ajax-trigger home-show-more-btn min-h-11 rounded-md px-8 text-sm font-bold text-secondary disabled:opacity-60"
              >
                <span>{loading ? t("loading") : t("showMore")}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
