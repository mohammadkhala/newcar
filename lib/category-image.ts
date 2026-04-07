import type { CategoryRow } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

/**
 * Resolved storefront URL for a category image; omits Laravel default placeholders.
 */
export function categoryDisplayImageSrc(row: CategoryRow): string | null {
  const raw =
    row.image_full_url ??
    row.image_fullpath ??
    row.image_full_path ??
    row.image ??
    null;
  const url = resolveMediaUrl(raw, { defaultFolder: "category" });
  if (url?.includes("img2.jpg") || url?.includes("160x160")) {
    return null;
  }
  return url;
}
