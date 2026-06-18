"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { HeaderNavLabels, NavCategoryItem } from "@/components/store/header/types";
import type { CategoryTreeNode, LanguageOption, VehicleBrandsResponse } from "@/lib/types";

type Props = {
  menuOpen: boolean;
  labels: HeaderNavLabels;
  languageOptions: LanguageOption[] | null;
  navCategories: NavCategoryItem[];
  featuredNavItems: CategoryTreeNode[];
  vehicleBrands: VehicleBrandsResponse["brands"];
  apiConfigured: boolean;
  onClose: () => void;
};

export function StoreHeaderMobileDrawer({
  menuOpen,
  labels,
  featuredNavItems,
  onClose,
}: Props) {
  const [openTopId, setOpenTopId] = useState<number | null>(
    featuredNavItems[0]?.id ?? null,
  );
  const [openSubId, setOpenSubId] = useState<number | null>(null);

  if (!menuOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] md:hidden" id="store-mobile-nav">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label={labels.closeMenu}
        onClick={onClose}
      />

      {/* Panel — slides in from start side (right in RTL) */}
      <div className="absolute inset-y-0 start-0 flex w-[min(100%,22rem)] flex-col bg-white shadow-2xl">

        {/* Header bar */}
        <div className="flex shrink-0 items-center justify-between bg-primary px-5 py-4">
          <span className="text-sm font-black text-black">
            {labels.allPartsByCategory}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.closeMenu}
            className="text-xl font-bold text-black/60 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* Accordion list */}
        <div className="flex-1 overflow-y-auto">
          <ul>
            {featuredNavItems.map((topNode) => {
              const topOpen = openTopId === topNode.id;
              return (
                <li key={topNode.id} className="border-b border-gray-100">

                  {/* Top-level section toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpenTopId(topOpen ? null : topNode.id);
                      setOpenSubId(null);
                    }}
                    className="flex w-full min-h-[3.25rem] items-center justify-between gap-3 bg-primary/8 px-5 py-3.5 text-sm font-black text-secondary hover:bg-primary/15"
                  >
                    {/* text-start = RIGHT in RTL */}
                    <span className="flex-1 truncate text-start">{topNode.name}</span>
                    {/* chevron last = LEFT side in RTL justify-between */}
                    <span
                      aria-hidden
                      className={`shrink-0 text-base leading-none transition-transform duration-200 ${
                        topOpen ? "rotate-90 text-primary" : "text-secondary/40"
                      }`}
                    >
                      ›
                    </span>
                  </button>

                  {topOpen && (
                    <ul className="bg-white">
                      {topNode.children.map((item) => {
                        const hasChildren = item.children.length > 0;
                        const subOpen = openSubId === item.id;

                        if (hasChildren) {
                          return (
                            <li key={item.id} className="border-b border-gray-50">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenSubId(subOpen ? null : item.id)
                                }
                                className={`flex w-full min-h-[3rem] items-center justify-between gap-3 px-6 py-3 text-sm font-semibold transition-colors ${
                                  subOpen
                                    ? "text-primary"
                                    : "text-secondary hover:bg-gray-50"
                                }`}
                              >
                                <span className="flex-1 truncate text-start">
                                  {item.name}
                                </span>
                                <span
                                  aria-hidden
                                  className={`shrink-0 text-base leading-none transition-transform duration-200 ${
                                    subOpen
                                      ? "rotate-90 text-primary"
                                      : "text-secondary/30"
                                  }`}
                                >
                                  ›
                                </span>
                              </button>

                              {subOpen && (
                                <ul className="bg-gray-50">
                                  {item.children.map((child) => (
                                    <li key={child.id}>
                                      <Link
                                        href={`/shop/categories/${child.id}`}
                                        onClick={onClose}
                                        className="flex min-h-[2.75rem] items-center border-b border-gray-100 px-10 py-2 text-sm text-secondary/75 last:border-0 hover:text-primary"
                                      >
                                        {child.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          );
                        }

                        return (
                          <li key={item.id} className="border-b border-gray-50">
                            <Link
                              href={`/shop/categories/${item.id}`}
                              onClick={onClose}
                              className="flex min-h-[3rem] items-center justify-between gap-3 px-6 py-3 text-sm text-secondary/80 hover:bg-gray-50 hover:text-primary"
                            >
                              <span className="flex-1 truncate text-start">
                                {item.name}
                              </span>
                              <span
                                aria-hidden
                                className="shrink-0 text-base leading-none text-secondary/25"
                              >
                                ›
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
