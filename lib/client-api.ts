"use client";

import type { SearchQuery } from "@/lib/api-queries";
import { getApiBaseUrl } from "@/lib/api-base";
import { bffFetch } from "@/lib/bff-client";
import type {
  ProductSearchResponse,
  VehicleModelRow,
  VehicleYearRow,
} from "@/lib/types";

export function clientLocalizationHeaders(locale: string): HeadersInit {
  return { "X-localization": locale };
}

function clientApiBase(): string {
  return getApiBaseUrl();
}

/**
 * Browser-side product search via the Next.js BFF (pagination / home load-more).
 */
export async function clientFetchProductSearch(
  query: SearchQuery,
  locale: string,
): Promise<ProductSearchResponse | null> {
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
  const res = await bffFetch(`products/search?${q.toString()}`, {
    locale,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    return null;
  }
  return res.json() as Promise<ProductSearchResponse>;
}

/**
 * Browser-side fetch for vehicle models (CORS must allow the storefront origin).
 */
export async function clientFetchVehicleModels(
  brandId: number,
  locale: string,
): Promise<VehicleModelRow[]> {
  const base = clientApiBase();
  if (!base || brandId <= 0) {
    return [];
  }
  try {
    const res = await fetch(
      `${base}/vehicles/models?brand_id=${encodeURIComponent(String(brandId))}`,
      { headers: { ...clientLocalizationHeaders(locale), Accept: "application/json" } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { models?: VehicleModelRow[] };
    return data.models ?? [];
  } catch {
    return [];
  }
}

/**
 * Browser-side fetch for vehicle years.
 */
export async function clientFetchVehicleYears(
  modelId: number,
  locale: string,
): Promise<VehicleYearRow[]> {
  const base = clientApiBase();
  if (!base || modelId <= 0) {
    return [];
  }
  try {
    const res = await fetch(
      `${base}/vehicles/years?model_id=${encodeURIComponent(String(modelId))}`,
      { headers: { ...clientLocalizationHeaders(locale), Accept: "application/json" } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { years?: VehicleYearRow[] };
    return data.years ?? [];
  } catch {
    return [];
  }
}
