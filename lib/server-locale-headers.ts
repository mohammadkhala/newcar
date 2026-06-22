import { getLocale } from "next-intl/server";

/**
 * Builds Laravel API localization header for the active next-intl locale.
 * Falls back to "ar" when called outside of a next-intl request context
 * (e.g. from Route Handlers that don't go through the locale middleware).
 */
export async function apiLocalizationHeaders(): Promise<Record<string, string>> {
  try {
    const locale = await getLocale();
    return { "X-localization": locale };
  } catch {
    return { "X-localization": "ar" };
  }
}
