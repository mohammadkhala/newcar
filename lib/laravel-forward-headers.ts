import type { NextRequest } from "next/server";

/**
 * Headers so Laravel rate limiting uses the browser IP when Next proxies to the API
 * (same idea as BFF). Requires Laravel TrustProxies to trust the Next/nginx hop.
 */
export function forwardClientIpHeaders(req: NextRequest): Record<string, string> {
  const xff = req.headers.get("x-forwarded-for");
  const xReal = req.headers.get("x-real-ip");
  const clientIp = xff?.split(",")[0]?.trim() || xReal?.trim();
  if (!clientIp) {
    return {};
  }
  return { "X-Forwarded-For": clientIp };
}
