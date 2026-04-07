/**
 * Storefront API shapes — align with Laravel JSON; keep optional fields loose for forward compatibility.
 */

export type VehicleBrandsResponse = {
  brands: Array<{
    id: number;
    name: string;
    slug: string;
    image?: string | null;
    image_full_url?: string | null;
  }>;
};

export type VehicleModelRow = {
  id: number;
  vehicle_brand_id: number;
  name: string;
  slug: string;
};

export type VehicleYearRow = {
  id: number;
  vehicle_model_id: number;
  year: number;
};

export type StoreProductListItem = {
  id: number;
  name: string;
  price: number;
  discount?: number;
  discount_type?: "percent" | "amount";
  total_stock?: number;
  unit?: string;
  image?: unknown;
};

export type FlashSaleInfo = {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  image?: string | null;
  status: number;
};

export type FlashSaleResponse = {
  total_size: number | null;
  limit: number;
  offset: number;
  flash_sale: FlashSaleInfo | null;
  products: StoreProductListItem[];
};

export type CategoryTreeNode = {
  id: number;
  name: string;
  imageSrc: string | null;
  children: CategoryTreeNode[];
};

export type ProductSearchResponse = {
  total_size: number;
  limit: number;
  offset: number;
  lowest_price?: number;
  highest_price?: number;
  products: StoreProductListItem[];
  sort_by?: string | null;
};

export type ProductDetailPayload = {
  product: StoreProductListItem & {
    description?: string;
    total_stock?: number;
    variations?: unknown;
  };
  related_products?: StoreProductListItem[];
  customers_also_bought?: StoreProductListItem[];
  overall_rating?: {
    rating?: number[];
    total?: number;
    reviews?: unknown[];
  };
};

export type CategoryRow = {
  id: number;
  name?: string;
  parent_id?: number;
  products_count?: number;
  slug?: string;
  image?: string | null;
  image_full_url?: string | null;
  /** Laravel Category append / accessor variants */
  image_fullpath?: string | null;
  image_full_path?: string | null;
};

export type BannerRow = {
  id?: number;
  title?: string;
  image?: string | null;
  image_full_url?: string | null;
  /** Laravel accessor JSON key for resolved storage URL */
  image_fullpath?: string | null;
  url?: string | null;
  [key: string]: unknown;
};

export type CampaignBannerRow = {
  id: number;
  title: string;
  image?: string | null;
  image_full_url?: string | null;
  target_type: "product" | "category";
  target_id: number;
  target_url: string | null;
  sort_order?: number;
  starts_at?: string | null;
  ends_at?: string | null;
};

export type LanguageOption = { key: string; value: string };

export type TagRow = { id: number; name?: string; slug?: string };
export type AttributeRow = { id: number; name?: string; values?: unknown };

export type ProductBrandListResponse = {
  total_size: number;
  limit: number;
  offset: number;
  brands: Array<{
    id: number;
    name: string;
    slug: string;
    image?: string | null;
    image_full_url?: string | null;
    products_count?: number;
  }>;
};

export type ProductBrandProductsResponse = {
  brand: {
    id: number;
    name: string;
    slug: string;
    image?: string | null;
    image_full_url?: string | null;
  };
  total_size: number;
  limit: number;
  offset: number;
  sort_by?: string;
  category_id?: number | null;
  products: StoreProductListItem[];
};
