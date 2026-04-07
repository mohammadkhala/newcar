/**
 * Normalizes the public Laravel API base (must end at /api/v1, no trailing slash).
 * Collapses duplicate path slashes and preserves the protocol segment.
 */
export function normalizeApiBaseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }
  const protocolMatch = trimmed.match(/^(https?:\/\/)(.*)$/i);
  if (protocolMatch) {
    const proto = protocolMatch[1];
    const rest = protocolMatch[2].replace(/\/+/g, "/").replace(/\/$/, "");
    return `${proto}${rest}`;
  }
  return trimmed.replace(/\/+/g, "/").replace(/\/$/, "");
}

/**
 * Resolves the public API base URL (Laravel /api/v1).
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
  return normalizeApiBaseUrl(raw);
}
