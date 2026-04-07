import { getApiBaseUrl } from "@/lib/api-base";

/**
 * Laravel public disk subfolder used when the API returns a bare filename.
 */
export type MediaDiskFolder =
  | "product"
  | "banner"
  | "campaign-banners"
  | "vehicle-brand"
  | "category"
  | "notification"
  | "product-brand"
  | "profile"
  | "service"
  | "flash-sale";

/**
 * Laravel public origin derived from NEXT_PUBLIC_API_BASE_URL (strip /api/v1).
 */
export function getLaravelPublicOrigin(): string {
  const base = getApiBaseUrl();
  if (!base) {
    return "";
  }
  try {
    const u = new URL(base);
    return u.origin;
  } catch {
    return "";
  }
}

/**
 * Turns API image paths into absolute URLs; drops known placeholder filenames.
 * Bare filenames are resolved under /storage/{defaultFolder}/ (Laravel Storage::url).
 */
export function resolveMediaUrl(
  raw: string | null | undefined,
  options?: { defaultFolder?: MediaDiskFolder },
): string | null {
  if (raw == null) {
    return null;
  }
  const s = raw.trim();
  if (!s) {
    return null;
  }
  const file = s.split("/").pop()?.toLowerCase() ?? "";
  if (file === "def.png" || file === "default.png") {
    return null;
  }
  if (s.startsWith("data:") || s.startsWith("blob:")) {
    return s;
  }
  if (s.startsWith("http://") || s.startsWith("https://")) {
    return s;
  }
  if (s.startsWith("//")) {
    return `https:${s}`;
  }
  const origin = getLaravelPublicOrigin();
  if (!origin) {
    return null;
  }

  const defaultFolder = options?.defaultFolder ?? "product";

  if (s.startsWith("/")) {
    return `${origin}${s}`;
  }
  if (s.startsWith("storage/")) {
    return `${origin}/${s}`;
  }
  if (s.includes("/")) {
    return `${origin}/storage/${s.replace(/^\/+/, "")}`;
  }
  return `${origin}/storage/${defaultFolder}/${s}`;
}
