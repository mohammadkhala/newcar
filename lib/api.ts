import { cache } from "react";
import { apiLocalizationHeaders } from "@/lib/server-locale-headers";
import { getApiBaseUrl } from "@/lib/api-base";
import type {
  AttributeRow,
  BannerRow,
  CampaignBannerRow,
  CategoryRow,
  FlashSaleResponse,
  LanguageOption,
  ProductBrandListResponse,
  ProductBrandProductsResponse,
  ProductDetailPayload,
  ProductSearchResponse,
  ProductReview,
  StoreProductListItem,
  TagRow,
  VehicleBrandsResponse,
  VehicleModelRow,
  VehicleYearRow,
} from "@/lib/types";
import type { SearchQuery } from "@/lib/api-queries";

export type { SearchQuery } from "@/lib/api-queries";
export { getApiBaseUrl } from "@/lib/api-base";

async function apiHeaders(): Promise<HeadersInit> {
  return apiLocalizationHeaders();
}

async function apiFetch(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<Response> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  }
  const url = `${base}/${path.replace(/^\//, "")}`;
  try {
    const locHeaders = await apiHeaders();
    return await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...locHeaders,
        ...init?.headers,
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}

/**
 * Fetches active vehicle brands for storefront filters.
 * Returns empty list when the API base URL is not configured (avoids throwing from apiFetch).
 */
export async function fetchVehicleBrands(): Promise<VehicleBrandsResponse> {
  const base = getApiBaseUrl();
  if (!base) {
    return { brands: [] };
  }
  const res = await apiFetch("vehicles/brands", {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    return { brands: [] };
  }
  return res.json() as Promise<VehicleBrandsResponse>;
}

export async function fetchVehicleModels(
  brandId: number,
): Promise<VehicleModelRow[]> {
  const base = getApiBaseUrl();
  if (!base || brandId <= 0) {
    return [];
  }
  const res = await apiFetch(
    `vehicles/models?brand_id=${encodeURIComponent(String(brandId))}`,
    { next: { revalidate: 300 } },
  );
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as { models?: VehicleModelRow[] };
  return data.models ?? [];
}

export async function fetchVehicleYears(
  modelId: number,
): Promise<VehicleYearRow[]> {
  const base = getApiBaseUrl();
  if (!base || modelId <= 0) {
    return [];
  }
  const res = await apiFetch(
    `vehicles/years?model_id=${encodeURIComponent(String(modelId))}`,
    { next: { revalidate: 300 } },
  );
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as { years?: VehicleYearRow[] };
  return data.years ?? [];
}

/**
 * Runs product search against Laravel ProductLogic-backed endpoint.
 */
export async function fetchProductSearch(
  query: SearchQuery,
): Promise<ProductSearchResponse | null> {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }
  const q = new URLSearchParams();
  const entries: [string, string | undefined][] = [
    ["name", query.name],
    ["vehicle_brand_id", query.vehicle_brand_id],
    ["vehicle_model_id", query.vehicle_model_id],
    ["vehicle_year_id", query.vehicle_year_id],
    ["product_brand_id", query.product_brand_id],
    ["category_ids", query.category_ids],
    ["tag_ids", query.tag_ids],
    ["attribute_ids", query.attribute_ids],
    ["price_low", query.price_low],
    ["price_high", query.price_high],
    ["rating", query.rating],
    ["sort_by", query.sort_by ?? "new_arrival"],
    ["limit", query.limit ?? "12"],
    ["offset", query.offset ?? "1"],
    ["in_stock_only", query.in_stock_only],
  ];
  for (const [k, v] of entries) {
    if (v !== undefined && v !== "") {
      q.set(k, v);
    }
  }
  const res = await apiFetch(`products/search?${q.toString()}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<ProductSearchResponse>;
}

export async function fetchProductDetail(
  id: string,
): Promise<ProductDetailPayload | null> {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }
  const res = await apiFetch(`products/details/${encodeURIComponent(id)}`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<ProductDetailPayload>;
}

export async function fetchBanners(): Promise<BannerRow[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  try {
    const res = await apiFetch("banners", { next: { revalidate: 60 } });
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as BannerRow[]) : [];
  } catch {
    return [];
  }
}

/**
 * Fetches active campaign promo tiles for the home page.
 * Order matches Laravel: sort_order ASC, then id DESC; see STORE-MASTER-PLAN D.1.1.
 */
export async function fetchCampaignBanners(): Promise<CampaignBannerRow[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  try {
    const res = await apiFetch("marketing/campaign-banners", {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return [];
    }
    const data = (await res.json()) as { items?: CampaignBannerRow[] };
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

export const fetchConfig = cache(async (): Promise<Record<string, unknown> | null> => {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }
  const res = await apiFetch("config", { next: { revalidate: 300 } });
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<Record<string, unknown>>;
});

/**
 * Active storefront languages from Laravel business settings (`language` key), with display labels.
 */
export async function fetchLanguages(): Promise<LanguageOption[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  const res = await apiFetch("language", {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    return [];
  }
  const out: LanguageOption[] = [];
  for (const row of data) {
    if (
      row &&
      typeof row === "object" &&
      "key" in row &&
      "value" in row &&
      typeof (row as LanguageOption).key === "string" &&
      typeof (row as LanguageOption).value === "string"
    ) {
      out.push({
        key: (row as LanguageOption).key,
        value: (row as LanguageOption).value,
      });
    }
  }
  return out;
}

export async function fetchLatestProducts(
  limit = "12",
  offset = "1",
  sort_by?: string,
): Promise<{ products?: StoreProductListItem[] } | null> {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }
  const q = new URLSearchParams({ limit, offset });
  if (sort_by) {
    q.set("sort_by", sort_by);
  }
  const res = await apiFetch(`products/latest?${q}`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<{ products?: StoreProductListItem[] }>;
}

export async function fetchDiscountedProducts(): Promise<
  StoreProductListItem[] | null
> {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }
  const res = await apiFetch("products/discounted", {
    next: { revalidate: 120 },
  });
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<StoreProductListItem[]>;
}

export async function fetchNewArrivalProducts(
  limit = "12",
  offset = "1",
): Promise<{ products?: StoreProductListItem[] } | null> {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }
  const res = await apiFetch(
    `products/new-arrival?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`,
    { next: { revalidate: 120 } },
  );
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<{ products?: StoreProductListItem[] }>;
}

export type FeaturedBlock = {
  category: CategoryRow;
  products: StoreProductListItem[];
};

export async function fetchFeaturedCategories(): Promise<FeaturedBlock[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  const res = await apiFetch("categories/featured", {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as {
    featured_data?: FeaturedBlock[];
  };
  return data.featured_data ?? [];
}

export async function fetchPopularCategories(): Promise<CategoryRow[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  const res = await apiFetch("categories/popular", {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    return [];
  }
  return res.json() as Promise<CategoryRow[]>;
}

export async function fetchRootCategories(): Promise<CategoryRow[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  const res = await apiFetch("categories", { next: { revalidate: 300 } });
  if (!res.ok) {
    return [];
  }
  return res.json() as Promise<CategoryRow[]>;
}

export async function fetchCategoryChildren(
  categoryId: number,
): Promise<CategoryRow[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  const res = await apiFetch(`categories/childes/${categoryId}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    return [];
  }
  return res.json() as Promise<CategoryRow[]>;
}

export type CategoryContextNavItem = { id: number; name: string };

export type CategoryContextPayload = {
  breadcrumb: CategoryContextNavItem[];
  parent: CategoryContextNavItem | null;
  siblings: CategoryContextNavItem[];
  current_id: number;
};

/**
 * Breadcrumb, parent, and siblings for nested category UX (Laravel categories/context/{id}).
 */
export async function fetchCategoryContext(
  categoryId: number,
): Promise<CategoryContextPayload | null> {
  const base = getApiBaseUrl();
  if (!base || categoryId <= 0) {
    return null;
  }
  const res = await apiFetch(`categories/context/${categoryId}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as Partial<CategoryContextPayload>;
  if (!Array.isArray(data.breadcrumb) || typeof data.current_id !== "number") {
    return null;
  }
  return {
    breadcrumb: data.breadcrumb,
    parent: data.parent ?? null,
    siblings: Array.isArray(data.siblings) ? data.siblings : [],
    current_id: data.current_id,
  };
}

export async function fetchCategoryProducts(
  categoryId: number,
): Promise<StoreProductListItem[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  const res = await apiFetch(`categories/products/${categoryId}`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) {
    return [];
  }
  return res.json() as Promise<StoreProductListItem[]>;
}

export async function fetchCategoryProductsAll(
  categoryId: number,
): Promise<StoreProductListItem[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  const res = await apiFetch(`categories/products/${categoryId}/all`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) {
    return [];
  }
  return res.json() as Promise<StoreProductListItem[]>;
}

export async function fetchTags(): Promise<TagRow[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  const res = await apiFetch("tags", { next: { revalidate: 300 } });
  if (!res.ok) {
    return [];
  }
  return res.json() as Promise<TagRow[]>;
}

export async function fetchAttributes(): Promise<AttributeRow[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  const res = await apiFetch("attributes", { next: { revalidate: 300 } });
  if (!res.ok) {
    return [];
  }
  return res.json() as Promise<AttributeRow[]>;
}

export async function fetchFlashSale(
  query: Record<string, string | undefined>,
): Promise<FlashSaleResponse | null> {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v) {
      q.set(k, v);
    }
  }
  const res = await apiFetch(`flash-sale?${q}`, { next: { revalidate: 60 } });
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<FlashSaleResponse>;
}

export async function fetchProductBrands(
  limit = "24",
  offset = "1",
  search?: string,
): Promise<ProductBrandListResponse | null> {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }
  const q = new URLSearchParams({ limit, offset });
  if (search) {
    q.set("search", search);
  }
  const res = await apiFetch(`product-brands?${q}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<ProductBrandListResponse>;
}

export async function fetchProductBrandProducts(
  slug: string,
  query: Record<string, string | undefined>,
): Promise<ProductBrandProductsResponse | null> {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v) {
      q.set(k, v);
    }
  }
  const path = `product-brands/${encodeURIComponent(slug)}/products${q.toString() ? `?${q}` : ""}`;
  const res = await apiFetch(path, { next: { revalidate: 60 } });
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<ProductBrandProductsResponse>;
}

export async function fetchProductReviews(
  productId: string,
  limit: string,
  offset: string,
): Promise<{ data?: ProductReview[]; limit?: number; offset?: number } | null> {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }
  const q = new URLSearchParams({ limit, offset });
  const res = await apiFetch(`products/reviews/${encodeURIComponent(productId)}?${q}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<{
    data?: ProductReview[];
    limit?: number;
    offset?: number;
  }>;
}

export async function fetchProductRatingFloat(
  productId: string,
): Promise<number | null> {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }
  const res = await apiFetch(`products/rating/${encodeURIComponent(productId)}`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) {
    return null;
  }
  const raw = (await res.json()) as unknown;
  if (typeof raw === "number") {
    return raw;
  }
  return null;
}

export async function fetchPages(): Promise<unknown[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  const res = await apiFetch("pages", { next: { revalidate: 600 } });
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchFaqs(): Promise<unknown[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  const res = await apiFetch("faqs", { next: { revalidate: 600 } });
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchServices(): Promise<unknown[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  const res = await apiFetch("services", { next: { revalidate: 600 } });
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchServiceDetail(
  slug: string,
): Promise<Record<string, unknown> | null> {
  const base = getApiBaseUrl();
  if (!base) {
    return null;
  }
  const res = await apiFetch(`services/${encodeURIComponent(slug)}`, {
    next: { revalidate: 600 },
  });
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<Record<string, unknown>>;
}

export async function fetchUserTypes(): Promise<unknown[]> {
  const base = getApiBaseUrl();
  if (!base) {
    return [];
  }
  const res = await apiFetch("user-types", { next: { revalidate: 600 } });
  if (!res.ok) {
    return [];
  }
  return res.json() as Promise<unknown[]>;
}
