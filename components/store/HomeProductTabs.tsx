"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/store/ProductCard";
import type { StoreProductListItem } from "@/lib/types";

type TabId = "latest" | "discounted" | "newArrival";

type Props = {
  currencyCode: string;
  latest: StoreProductListItem[];
  discounted: StoreProductListItem[];
  newArrival: StoreProductListItem[];
};

/**
 * Switches between latest, discounted, and new-arrival product grids on the home page.
 */
export function HomeProductTabs({
  currencyCode,
  latest,
  discounted,
  newArrival,
}: Props) {
  const t = useTranslations("Home.productTabs");
  const tabs = useMemo(
    () =>
      [
        { id: "latest" as const, label: t("latest"), items: latest },
        { id: "discounted" as const, label: t("discounted"), items: discounted },
        { id: "newArrival" as const, label: t("newArrival"), items: newArrival },
      ].filter((tab) => tab.items.length > 0),
    [t, latest, discounted, newArrival],
  );

  const [active, setActive] = useState<TabId>("latest");

  const effectiveId = useMemo(() => {
    if (tabs.length === 0) {
      return active;
    }
    if (tabs.some((x) => x.id === active)) {
      return active;
    }
    return tabs[0].id;
  }, [tabs, active]);

  if (tabs.length === 0) {
    return null;
  }

  const current = tabs.find((x) => x.id === effectiveId) ?? tabs[0];

  return (
    <section className="space-y-4" aria-label={current.label}>
      <div className="flex flex-wrap gap-2 border-b border-border-soft pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`min-h-10 rounded-lg px-4 text-sm font-bold transition-colors ${
              effectiveId === tab.id
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-muted text-secondary hover:bg-surface-muted/80"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {current.items.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} currencyCode={currencyCode} />
          </li>
        ))}
      </ul>
    </section>
  );
}
