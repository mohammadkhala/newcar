import type {
  CategoryTreeNode,
  LanguageOption,
  VehicleBrandsResponse,
} from "@/lib/types";

export type NavCategoryItem = {
  id: number;
  name: string;
  imageSrc: string | null;
};

export type StoreHeaderBodyProps = {
  navCategories: NavCategoryItem[];
  featuredNavItems: CategoryTreeNode[];
  languageOptions: LanguageOption[] | null;
  isAuthenticated: boolean;
  vehicleBrands: VehicleBrandsResponse["brands"];
  apiConfigured: boolean;
  storeLogoSrc: string;
  storeLogoAlt: string;
  storePhone?: string;
};

export type HeaderNavLabels = {
  allPartsByCategory: string;
  shopByVehicle: string;
  search: string;
  categories: string;
  brands: string;
  allCategories: string;
  secondaryNav: string;
  openMenu: string;
  closeMenu: string;
  shopMenu: string;
  categoriesMenu: string;
};
