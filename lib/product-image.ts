import { resolveMediaUrl } from "@/lib/resolve-media-url";

/**
 * Picks a display URL for a product image from API `image` field (array or string).
 */
export function productPrimaryImageSrc(imageField: unknown): string | null {
  const raw = extractRawImagePath(imageField);
  return raw ? resolveMediaUrl(raw, { defaultFolder: "product" }) : null;
}

/**
 * Returns all resolved image URLs for a product.
 * Prefers image_fullpath (already full URLs from Laravel storage accessor).
 */
export function productAllImageSrcs(
  imageField: unknown,
  imageFullpath?: unknown,
): string[] {
  // Use image_fullpath array first (full storage URLs)
  if (Array.isArray(imageFullpath) && imageFullpath.length > 0) {
    const urls = imageFullpath
      .map((u) => (typeof u === "string" ? u.trim() : null))
      .filter((u): u is string => Boolean(u));
    if (urls.length > 0) return urls;
  }
  // Fall back to resolving the image filenames
  if (Array.isArray(imageField)) {
    return imageField
      .map((item) => {
        const raw =
          typeof item === "string"
            ? item
            : item && typeof item === "object" && "image" in item
              ? (item as { image?: string }).image ?? null
              : null;
        return raw ? resolveMediaUrl(raw, { defaultFolder: "product" }) : null;
      })
      .filter((u): u is string => Boolean(u));
  }
  const single = productPrimaryImageSrc(imageField);
  return single ? [single] : [];
}

function extractRawImagePath(imageField: unknown): string | null {
  if (typeof imageField === "string") {
    return imageField;
  }
  if (!Array.isArray(imageField) || imageField.length === 0) {
    return null;
  }
  const first = imageField[0];
  if (typeof first === "string") {
    return first;
  }
  if (first && typeof first === "object" && "image" in first) {
    const v = (first as { image?: string }).image;
    return typeof v === "string" ? v : null;
  }
  return null;
}
