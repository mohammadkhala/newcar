"use client";

import { Link } from "@/i18n/navigation";
import { CategoryMegaGrid } from "@/components/store/header/CategoryMegaGrid";
import { FeaturedPanel } from "@/components/store/header/FeaturedPanel";
import { VehicleByCarMegaPanel } from "@/components/store/header/VehicleByCarMegaPanel";
import { SHOP_NAV_LINKS } from "@/components/store/header/nav-config";
import { DESKTOP_NAV_SCHEMA } from "@/components/store/header/nav-schema";
import type { HeaderNavLabels, NavCategoryItem } from "@/components/store/header/types";
import type { CategoryTreeNode, VehicleBrandsResponse } from "@/lib/types";
import { useRef, useState } from "react";
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
  onOpenFeatured: (id: number) => void;
  onScheduledCloseFeatured: () => void;
  onCancelCloseFeatured: () => void;
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
  onOpenFeatured,
  onScheduledCloseFeatured,
  onCancelCloseFeatured,
  closeAllDesktop,
  categoriesRef,
  shopRef,
  featuredNavRef,
}: Props) {
  const navShellRef = useRef<HTMLDivElement | null>(null);
  const [panelInsetStart, setPanelInsetStart] = useState(0);

  const handleFeaturedHover = (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
    onOpenFeatured(id);
    const shell = navShellRef.current;
    if (shell) {
      const shellRect = shell.getBoundingClientRect();
      const btnRect = e.currentTarget.getBoundingClientRect();
      const isRtl = window.getComputedStyle(shell).direction === "rtl";
      setPanelInsetStart(
        isRtl ? shellRect.right - btnRect.right : btnRect.left - shellRect.left
      );
    }
  };

  return (
    <div
      id="header-sections-nav"
      ref={featuredNavRef as RefObject<HTMLDivElement | null>}
      className="sticky top-0 z-[200] bg-primary shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]"
      onMouseLeave={onScheduledCloseFeatured}
    >
      <div ref={navShellRef} className="store-shell flex flex-nowrap items-center gap-2 py-2 md:gap-3">
        <div className="order-1 flex shrink-0 items-center gap-2">
          <div ref={categoriesRef} className="hidden md:block">
            <div className="relative">
              <button
                type="button"
                onClick={onToggleCategories}
                suppressHydrationWarning
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
            suppressHydrationWarning
          >
            <span aria-hidden>☰</span>
            <span className="max-w-[10rem] truncate">{labels.allPartsByCategory}</span>
          </button>
        </div>

        <nav
          className="order-2 hidden min-h-10 min-w-0 flex-1 md:flex md:items-center"
          aria-label={labels.secondaryNav}
        >
          <div className="static-wrap relative min-w-0 w-full">
            <ul className="show-page flex w-full flex-nowrap items-center gap-0.5 overflow-x-auto px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {DESKTOP_NAV_SCHEMA.map((entry) => {
                if (entry.kind === "vehicle-panel") {
                  return (
                    <li key={entry.id} className="relative shrink-0">
                      <Link
                        href="/shop/search"
                        onClick={closeAllDesktop}
                        className="inline-flex min-h-[2.25rem] whitespace-nowrap rounded-md px-3 text-sm font-bold text-black transition-colors hover:bg-black/10"
                      >
                        {labels[entry.labelKey]}
                      </Link>
                    </li>
                  );
                }

                return featuredNavItems.map((node) => (
                  <li key={node.id} className="relative shrink-0">
                    <button
                      type="button"
                      onMouseEnter={(e) => handleFeaturedHover(node.id, e)}
                      suppressHydrationWarning
                      className={`inline-flex min-h-[2.25rem] max-w-[9rem] truncate rounded-md px-3 text-sm font-bold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black/30 sm:max-w-[12rem] ${
                        openFeaturedId === node.id
                          ? "bg-black/15 text-black"
                          : "text-black hover:bg-black/10"
                      }`}
                    >
                      {node.name}
                    </button>
                  </li>
                ));
              })}
            </ul>
          </div>
        </nav>
      </div>

      {/* Rendered as a sibling of the scrollable <ul> above (not nested inside it):
          `overflow-x-auto` on that <ul> forces overflow-y to compute as `auto` too
          (CSS overflow auto-pairing rule), which clipped these dropdowns to the row's
          own ~40px height instead of letting them float below it. */}

      {openFeaturedId && featuredNavItems.length > 0 ? (
        <div className="store-shell relative" onMouseEnter={onCancelCloseFeatured}>
          <div
            className="absolute top-0 z-[160]"
            style={{ insetInlineStart: panelInsetStart }}
          >
            <FeaturedPanel
              items={featuredNavItems}
              initialId={openFeaturedId}
              onNavigate={closeAllDesktop}
            />
          </div>
        </div>
      ) : null}
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
