import { resolveMediaUrl } from "@/lib/resolve-media-url";

/**
 * Picks a display URL for a product image from API `image` field (array or string).
 */
export function productPrimaryImageSrc(imageField: unknown): string | null {
  const raw = extractRawImagePath(imageField);
  return raw ? resolveMediaUrl(raw, { defaultFolder: "product" }) : null;
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
