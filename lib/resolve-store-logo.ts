import { getLaravelPublicOrigin } from "@/lib/resolve-media-url";

/**
 * Resolves the storefront logo URL from Laravel `config` API (same source as the admin / footer).
 */
export function resolveStoreLogoUrl(
  config: Record<string, unknown> | null | undefined,
): string {
  if (!config) {
    return "";
  }
  const full = String(config.logo_full_url ?? "").trim();
  if (full && /^https?:\/\//i.test(full)) {
    return full;
  }
  const file = String(
    (config as { ecommerce_logo?: string }).ecommerce_logo ??
      (config as { app_logo?: string }).app_logo ??
      "",
  ).trim();
  if (!file) {
    return "";
  }
  const origin = getLaravelPublicOrigin();
  if (!origin) {
    return "";
  }
  return `${origin}/storage/ecommerce/${file.replace(/^\/+/, "")}`;
}
