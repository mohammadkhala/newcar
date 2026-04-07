import { getLocale } from "next-intl/server";

/**
 * Builds Laravel API localization header for the active next-intl locale.
 */
export async function apiLocalizationHeaders(): Promise<Record<string, string>> {
  const locale = await getLocale();
  return { "X-localization": locale };
}
