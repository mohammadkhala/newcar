"use client";

import type { VehicleModelRow, VehicleYearRow } from "@/lib/types";
import { getApiBaseUrl } from "@/lib/api-base";

export function clientLocalizationHeaders(locale: string): HeadersInit {
  return { "X-localization": locale };
}

function clientApiBase(): string {
  return getApiBaseUrl();
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
  const res = await fetch(
    `${base}/vehicles/models?brand_id=${encodeURIComponent(String(brandId))}`,
    { headers: { ...clientLocalizationHeaders(locale), Accept: "application/json" } },
  );
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as { models?: VehicleModelRow[] };
  return data.models ?? [];
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
  const res = await fetch(
    `${base}/vehicles/years?model_id=${encodeURIComponent(String(modelId))}`,
    { headers: { ...clientLocalizationHeaders(locale), Accept: "application/json" } },
  );
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as { years?: VehicleYearRow[] };
  return data.years ?? [];
}
