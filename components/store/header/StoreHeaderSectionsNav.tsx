"use client";

import { Link } from "@/i18n/navigation";
import { CategoryMegaGrid } from "@/components/store/header/CategoryMegaGrid";
import { FeaturedPanel } from "@/components/store/header/FeaturedPanel";
import { VehicleByCarMegaPanel } from "@/components/store/header/VehicleByCarMegaPanel";
import { SHOP_NAV_LINKS } from "@/components/store/header/nav-config";
import { DESKTOP_NAV_SCHEMA } from "@/components/store/header/nav-schema";
import type { HeaderNavLabels, NavCategoryItem } from "@/components/store/header/types";
import type { CategoryTreeNode, VehicleBrandsResponse } from "@/lib/types";
import type { RefObject } from "react";

type Props = {
  labels: HeaderNavLabels;
  navCategories: NavCategoryItem[];
  featuredNavItems: CategoryTreeNode[];
  vehicleBrands: VehicleBrandsResponse["brands"];
  apiConfigured: boolean;
  categoriesDropdownOpen: boolean;
  shopDropdownOpen: boolean;
  openFeaturedId: number | null;
  onToggleMobileMenu: () => void;
  onToggleCategories: () => void;
  onToggleShop: () => void;
  onToggleFeatured: (id: number) => void;
  closeAllDesktop: () => void;
  categoriesRef: RefObject<HTMLDivElement | null>;
  shopRef: RefObject<HTMLLIElement | null>;
  featuredNavRef: RefObject<HTMLElement | null>;
};

export function StoreHeaderSectionsNav({
  labels,
  navCategories,
  featuredNavItems,
  vehicleBrands,
  apiConfigured,
  categoriesDropdownOpen,
  shopDropdownOpen,
  openFeaturedId,
  onToggleMobileMenu,
  onToggleCategories,
  onToggleShop,
  onToggleFeatured,
  closeAllDesktop,
  categoriesRef,
  shopRef,
  featuredNavRef,
}: Props) {
  return (
    <div
      id="header-sections-nav"
      className="sticky top-0 z-[200] bg-primary shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]"
    >
      <div className="store-shell flex flex-nowrap items-center gap-2 py-2 md:gap-3">
        <div className="order-1 flex shrink-0 items-center gap-2">
          <div ref={categoriesRef} className="hidden md:block">
            <div className="relative">
              <button
                type="button"
                onClick={onToggleCategories}
                className={`inline-flex min-h-[2.5rem] max-w-[min(100vw-2rem,16rem)] items-center gap-2 truncate rounded-md px-4 text-sm font-bold text-black shadow-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-black/30 sm:max-w-none ${
                  categoriesDropdownOpen ? "bg-gray-100" : "bg-white hover:bg-gray-50"
                }`}
              >
                <span className="shrink-0 text-lg" aria-hidden>
                  ☰
                </span>
                <span className="truncate">{labels.allPartsByCategory}</span>
              </button>
              {categoriesDropdownOpen ? (
                <div className="absolute start-0 top-full z-[120] pt-2">
                  <div className="w-[min(95vw,60rem)] overflow-hidden rounded-2xl border border-border-soft bg-white shadow-2xl">
                    <CategoryMegaGrid
                      navCategories={navCategories}
                      emptyLabel={labels.allCategories}
                      onNavigate={closeAllDesktop}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-md bg-white px-3 text-sm font-bold text-black shadow-sm outline-none transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-black/30 md:hidden"
            onClick={onToggleMobileMenu}
          >
            <span aria-hidden>☰</span>
            <span className="max-w-[10rem] truncate">{labels.allPartsByCategory}</span>
          </button>
        </div>

        <nav
          ref={featuredNavRef}
          className="order-2 hidden min-h-10 min-w-0 flex-1 md:flex md:items-center"
          aria-label={labels.secondaryNav}
        >
          <div className="static-wrap relative min-w-0 w-full">
            <ul className="show-page flex w-full flex-nowrap items-center gap-0.5 overflow-x-auto px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {DESKTOP_NAV_SCHEMA.map((entry) => {
                if (entry.kind === "vehicle-panel") {
                  return (
                    <li key={entry.id} ref={shopRef} className="relative shrink-0">
                      <button
                        type="button"
                        onClick={onToggleShop}
                        className={`inline-flex min-h-[2.25rem] whitespace-nowrap rounded-md px-3 text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black/30 ${
                          shopDropdownOpen
                            ? "bg-black/15 text-black"
                            : "text-black hover:bg-black/10"
                        }`}
                      >
                        {labels[entry.labelKey]}
                      </button>
                      {shopDropdownOpen ? (
                        <div
                          className="absolute start-0 top-full z-[160] pt-0"
                          role="region"
                          aria-label={labels[entry.labelKey]}
                        >
                          <VehicleByCarMegaPanel
                            brands={vehicleBrands}
                            apiConfigured={apiConfigured}
                            onNavigate={closeAllDesktop}
                          />
                        </div>
                      ) : null}
                    </li>
                  );
                }

                return featuredNavItems.map((node) => (
                  <li key={node.id} className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleFeatured(node.id)}
                      className={`inline-flex min-h-[2.25rem] max-w-[9rem] truncate rounded-md px-3 text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black/30 sm:max-w-[12rem] ${
                        openFeaturedId === node.id
                          ? "bg-black/15 text-black"
                          : "text-black hover:bg-black/10"
                      }`}
                    >
                      {node.name}
                    </button>
                    {openFeaturedId === node.id ? (
                      <div className="absolute start-0 top-full z-[160] pt-0">
                        <div className="w-[min(95vw,48rem)] overflow-hidden rounded-2xl border border-border-soft bg-white shadow-2xl">
                          <FeaturedPanel node={node} onNavigate={closeAllDesktop} />
                        </div>
                      </div>
                    ) : null}
                  </li>
                ));
              })}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}

export function HeaderShopLinks({
  labels,
  onNavigate,
}: {
  labels: HeaderNavLabels;
  onNavigate: () => void;
}) {
  return (
    <ul className="flex flex-col gap-1 py-2 text-sm md:min-w-[220px]">
      {SHOP_NAV_LINKS.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="block rounded-md px-3 py-2 text-secondary hover:bg-surface-muted"
            onClick={onNavigate}
          >
            {labels[link.labelKey]}
          </Link>
        </li>
      ))}
    </ul>
  );
}
