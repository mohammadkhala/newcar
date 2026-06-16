"use client";

import { Link } from "@/i18n/navigation";
import { CategoryMegaGrid } from "@/components/store/header/CategoryMegaGrid";
import { HeaderShopLinks } from "@/components/store/header/StoreHeaderSectionsNav";
import { MOBILE_DRAWER_SECTION_SCHEMA } from "@/components/store/header/nav-schema";
import type { HeaderNavLabels, NavCategoryItem } from "@/components/store/header/types";
import { LocaleSwitcher } from "@/components/store/LocaleSwitcher";
import { HeaderSearch } from "@/components/store/HeaderSearch";
import { VehicleFitmentPicker } from "@/components/vehicle/VehicleFitmentPicker";
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
  languageOptions,
  navCategories,
  featuredNavItems,
  vehicleBrands,
  apiConfigured,
  onClose,
}: Props) {
  if (!menuOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[400] md:hidden" id="store-mobile-nav">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={labels.closeMenu}
        onClick={onClose}
      />

      <div
        className="absolute start-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-xl"
        dir="auto"
      >
        <div className="flex items-center justify-between border-b border-surface-muted px-4 py-3">
          <span className="text-sm font-semibold text-secondary">
            {labels.allPartsByCategory}
          </span>
          <button
            type="button"
            className="rounded-lg px-3 py-1 text-sm font-medium text-primary"
            onClick={onClose}
          >
            {labels.closeMenu}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <HeaderSearch variant="light" />

          <div className="mt-3 flex items-center justify-end gap-2">
            <LocaleSwitcher languageOptions={languageOptions} variant="topBar" />
          </div>

          {MOBILE_DRAWER_SECTION_SCHEMA.map((section) => {
            if (section.id === "vehicleLinks") {
              return (
                <div key={section.id}>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-secondary/70">
                    {labels[section.titleKey]}
                  </p>
                  <HeaderShopLinks labels={labels} onNavigate={onClose} />
                  {apiConfigured && vehicleBrands.length > 0 ? (
                    <div className="mt-4 border-t border-surface-muted pt-4">
                      <VehicleFitmentPicker
                        brands={vehicleBrands}
                        apiConfigured={apiConfigured}
                        onSearch={onClose}
                      />
                    </div>
                  ) : null}
                </div>
              );
            }

            if (section.id === "categoriesGrid") {
              return (
                <div key={section.id}>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-secondary/70">
                    {labels[section.titleKey]}
                  </p>
                  <CategoryMegaGrid
                    navCategories={navCategories}
                    emptyLabel={labels.allCategories}
                    onNavigate={onClose}
                  />
                </div>
              );
            }

            if (featuredNavItems.length === 0) {
              return null;
            }

            return (
              <div key={section.id}>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-secondary/70">
                  {labels[section.titleKey]}
                </p>
                <ul className="mt-2 space-y-3 text-sm">
                  {featuredNavItems.map((node) => (
                    <li key={node.id}>
                      <Link
                        href={`/shop/categories/${node.id}`}
                        className="font-bold text-secondary hover:text-primary"
                        onClick={onClose}
                      >
                        {node.name}
                      </Link>
                      {node.children.length > 0 ? (
                        <ul className="ms-2 mt-1 space-y-1 border-s border-border-soft ps-2">
                          {node.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/shop/categories/${child.id}`}
                                className="text-secondary/90 hover:text-primary"
                                onClick={onClose}
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
