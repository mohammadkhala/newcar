import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api-base";
import { forwardClientIpHeaders } from "@/lib/laravel-forward-headers";

const TOKEN_COOKIE = "nc_access_token";

/** Public catalog GETs safe to edge/data-cache briefly (not cart/customer). */
const CACHEABLE_GET_PREFIXES = [
  "products/search",
  "products/new-arrival",
  "products/latest",
  "products/details",
  "banners",
  "marketing/campaign-banners",
  "categories",
  "categories/mega-nav",
  "vehicles/brands",
  "vehicles/models",
  "vehicles/years",
  "product-brands",
  "flash-sale",
  "services",
  "config",
  "language",
  "tags",
  "attributes",
] as const;

type RouteCtx = { params: Promise<{ path?: string[] }> };

function isCacheablePublicGet(path: string[], method: string): boolean {
  if (method !== "GET") {
    return false;
  }
  const joined = path.join("/");
  if (!joined || joined.startsWith("customer") || joined.startsWith("cart")) {
    return false;
  }
  return CACHEABLE_GET_PREFIXES.some(
    (p) => joined === p || joined.startsWith(`${p}/`),
  );
}

async function forward(
  req: NextRequest,
  params: Promise<{ path?: string[] }>,
  method: string,
): Promise<NextResponse> {
  const { path = [] } = await params;
  const base = getApiBaseUrl();
  if (!base) {
    return NextResponse.json({ message: "API not configured" }, { status: 500 });
  }
  const target = `${base}/${path.join("/")}${req.nextUrl.search}`;
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;
  const guestId = req.headers.get("x-guest-id") ?? "";
  const loc = req.headers.get("x-localization") ?? "ar";
  const cacheable = !token && isCacheablePublicGet(path, method);

  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("X-localization", loc);
  for (const [k, v] of Object.entries(forwardClientIpHeaders(req))) {
    headers.set(k, v);
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (guestId) {
    headers.set("guest-id", guestId);
  }

  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  let body: ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  const res = await fetch(target, {
    method,
    headers,
    body: body && body.byteLength > 0 ? body : undefined,
    ...(cacheable
      ? { next: { revalidate: 60 } }
      : { cache: "no-store" as const }),
  });
  const out = new NextResponse(await res.arrayBuffer(), { status: res.status });
  const ct = res.headers.get("content-type");
  if (ct) {
    out.headers.set("Content-Type", ct);
  }
  if (cacheable && res.ok) {
    out.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300",
    );
  }
  return out;
}

export function GET(req: NextRequest, ctx: RouteCtx) {
  return forward(req, ctx.params, "GET");
}

export function POST(req: NextRequest, ctx: RouteCtx) {
  return forward(req, ctx.params, "POST");
}

export function PUT(req: NextRequest, ctx: RouteCtx) {
  return forward(req, ctx.params, "PUT");
}

export function DELETE(req: NextRequest, ctx: RouteCtx) {
  return forward(req, ctx.params, "DELETE");
}
