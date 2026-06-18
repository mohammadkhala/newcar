import type { NextRequest } from "next/server";

/** First trustworthy client IP from common proxy/CDN headers. */
export function resolveClientIp(req: NextRequest): string | null {
  const candidates = [
    req.headers.get("cf-connecting-ip"),
    req.headers.get("true-client-ip"),
    req.headers.get("x-vercel-forwarded-for"),
    req.headers.get("x-real-ip"),
    req.headers.get("x-forwarded-for")?.split(",")[0],
  ];

  for (const raw of candidates) {
    const ip = raw?.trim();
    if (ip) {
      return ip;
    }
  }

  return null;
}

/**
 * Headers so Laravel rate limiting uses the browser IP when Next proxies to the API
 * (same idea as BFF). Requires Laravel TrustProxies to trust the Next/nginx hop.
 */
export function forwardClientIpHeaders(req: NextRequest): Record<string, string> {
  const clientIp = resolveClientIp(req);
  if (!clientIp) {
    return {};
  }

  return {
    "X-Forwarded-For": clientIp,
    "X-Real-IP": clientIp,
  };
}
