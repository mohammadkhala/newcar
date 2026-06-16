import type { CategoryRow } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

/**
 * Resolved storefront URL for a category image; omits Laravel default placeholders
 * (resolveMediaUrl already drops the generic admin img2.jpg placeholder).
 */
export function categoryDisplayImageSrc(row: CategoryRow): string | null {
  const raw =
    row.image_full_url ??
    row.image_fullpath ??
    row.image_full_path ??
    row.image ??
    null;
  return resolveMediaUrl(raw, { defaultFolder: "category" });
}
