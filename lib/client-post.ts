"use client";

import { getApiBaseUrl } from "@/lib/api-base";

/**
 * POST JSON to Laravel public API (CORS) with localization header.
 */
export async function clientPostJson(
  path: string,
  body: unknown,
  locale: string,
): Promise<Response> {
  const base = getApiBaseUrl();
  if (!base) {
    return new Response(null, { status: 500 });
  }
  return fetch(`${base}/${path.replace(/^\//, "")}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-localization": locale,
    },
    body: JSON.stringify(body),
  });
}
