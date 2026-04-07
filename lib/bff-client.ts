"use client";

/**
 * Calls the Next.js BFF proxy to Laravel with optional guest id; sends httpOnly auth cookie when present.
 */
export async function bffFetch(
  laravelPath: string,
  init: RequestInit & {
    locale: string;
    guestId?: string;
  },
): Promise<Response> {
  const path = laravelPath.replace(/^\//, "");
  const headers = new Headers(init.headers);
  headers.set("X-localization", init.locale);
  if (init.guestId) {
    headers.set("x-guest-id", init.guestId);
  }
  return fetch(`/api/bff/${path}`, {
    ...init,
    headers,
    credentials: "include",
  });
}
