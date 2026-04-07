import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api-base";

const TOKEN_COOKIE = "nc_access_token";

type RouteCtx = { params: Promise<{ path?: string[] }> };

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

  const headers = new Headers();
  headers.set("Accept", "application/json");
  headers.set("X-localization", loc);
  const xff = req.headers.get("x-forwarded-for");
  const xReal = req.headers.get("x-real-ip");
  const clientIp = xff?.split(",")[0]?.trim() || xReal?.trim();
  if (clientIp) {
    headers.set("X-Forwarded-For", clientIp);
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
  });
  const out = new NextResponse(await res.arrayBuffer(), { status: res.status });
  const ct = res.headers.get("content-type");
  if (ct) {
    out.headers.set("Content-Type", ct);
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
