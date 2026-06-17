"use client";

import { useTranslations } from "next-intl";
import { StoreHeaderSectionsNav } from "@/components/store/header/StoreHeaderSectionsNav";
import { StoreHeaderMobileDrawer } from "@/components/store/header/StoreHeaderMobileDrawer";
import { useStoreHeaderNavState } from "@/components/store/header/useStoreHeaderNavState";
import type {
  HeaderNavLabels,
  NavCategoryItem,
} from "@/components/store/header/types";
import type {
  CategoryTreeNode,
  LanguageOption,
  VehicleBrandsResponse,
} from "@/lib/types";

type Props = {
  navCategories: NavCategoryItem[];
  featuredNavItems: CategoryTreeNode[];
  languageOptions: LanguageOption[] | null;
  vehicleBrands: VehicleBrandsResponse["brands"];
  apiConfigured: boolean;
};

/**
 * The orange categories/sections nav, kept as its own top-level sibling of <main> (not
 * nested inside the small header-top/header-middle block) so `sticky` has a containing
 * block tall enough to stay pinned for the whole page scroll instead of scrolling away
 * with the rest of the ~216px-tall header once that block leaves the viewport.
 */
export function StoreHeaderCategoriesBar({
  navCategories,
  featuredNavItems,
  languageOptions,
  vehicleBrands,
  apiConfigured,
}: Props) {
  const t = useTranslations("Nav");
  const labels: HeaderNavLabels = {
    allPartsByCategory: t("allPartsByCategory"),
    shopByVehicle: t("shopByVehicle"),
    search: t("search"),
    categories: t("categories"),
    brands: t("brands"),
    allCategories: t("allCategories"),
    secondaryNav: t("secondaryNav"),
    openMenu: t("openMenu"),
    closeMenu: t("closeMenu"),
    shopMenu: t("shopMenu"),
    categoriesMenu: t("categoriesMenu"),
  };

  const { state, refs, actions } = useStoreHeaderNavState();

  return (
    <>
      <StoreHeaderSectionsNav
        labels={labels}
        navCategories={navCategories}
        featuredNavItems={featuredNavItems}
        vehicleBrands={vehicleBrands}
        apiConfigured={apiConfigured}
        categoriesDropdownOpen={state.categoriesDropdownOpen}
        shopDropdownOpen={state.shopDropdownOpen}
        openFeaturedId={state.openFeaturedId}
        onToggleMobileMenu={() => actions.setMenuOpen(true)}
        onToggleCategories={actions.toggleCategories}
        onToggleShop={actions.toggleShop}
        onToggleFeatured={actions.toggleFeatured}
        closeAllDesktop={actions.closeAllDesktop}
        categoriesRef={refs.categoriesRef}
        shopRef={refs.shopRef}
        featuredNavRef={refs.featuredNavRef}
      />

      <StoreHeaderMobileDrawer
        menuOpen={state.menuOpen}
        labels={labels}
        languageOptions={languageOptions}
        navCategories={navCategories}
        featuredNavItems={featuredNavItems}
        vehicleBrands={vehicleBrands}
        apiConfigured={apiConfigured}
        onClose={() => actions.setMenuOpen(false)}
      />
    </>
  );
}
