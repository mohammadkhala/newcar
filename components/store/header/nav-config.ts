export type NavLabelKey =
  | "shopByVehicle"
  | "search"
  | "categories"
  | "brands"
  | "shopMenu"
  | "categoriesMenu"
  | "allPartsByCategory"
  | "allCategories";

export type ShopNavLinkConfig = {
  href: string;
  labelKey: NavLabelKey;
};

/**
 * Central source of truth for storefront navigation links.
 * Any reorder/add/remove should happen here only.
 */
export const SHOP_NAV_LINKS: ShopNavLinkConfig[] = [
  { href: "/shop/vehicle", labelKey: "shopByVehicle" },
  { href: "/shop/search", labelKey: "search" },
  { href: "/shop/categories", labelKey: "categories" },
  { href: "/shop/brands", labelKey: "brands" },
];

