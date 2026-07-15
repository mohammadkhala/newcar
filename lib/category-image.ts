import type { CategoryRow } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/resolve-media-url";

function isAdminPlaceholder(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const s = raw.trim().toLowerCase();
  return s.includes("img2.jpg") || s.includes("/assets/admin/img/");
}

/**
 * Resolved storefront URL for a category image.
 *
 * Laravel's `image_fullpath` already checks Storage::exists and falls back to
 * admin img2.jpg when the file is missing. We must trust that and NOT fall
 * through to the raw `image` filename (e.g. category-1-thumb.png) which 404s.
 */
export function categoryDisplayImageSrc(row: CategoryRow): string | null {
  for (const raw of [
    row.image_full_url,
    row.image_fullpath,
    row.image_full_path,
  ]) {
    const resolved = resolveMediaUrl(raw, { defaultFolder: "category" });
    if (resolved) return resolved;
  }

  const full =
    row.image_full_url ?? row.image_fullpath ?? row.image_full_path ?? null;
  if (isAdminPlaceholder(typeof full === "string" ? full : null)) {
    return null;
  }

  return resolveMediaUrl(row.image, { defaultFolder: "category" });
}
