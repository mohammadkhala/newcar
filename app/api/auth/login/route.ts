import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api-base";
import { forwardClientIpHeaders } from "@/lib/laravel-forward-headers";

const TOKEN_COOKIE = "nc_access_token";

export async function POST(req: NextRequest) {
  const base = getApiBaseUrl();
  if (!base) {
    return NextResponse.json({ message: "API not configured" }, { status: 500 });
  }
  const loc = req.headers.get("x-localization") ?? "ar";
  let body: string;
  try {
    body = await req.text();
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }
  let res: Response;
  try {
    res = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-localization": loc,
        Accept: "application/json",
        ...forwardClientIpHeaders(req),
      },
      body,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "fetch failed";
    return NextResponse.json(
      { message: "Could not reach login API", detail },
      { status: 502 },
    );
  }
  const raw = await res.text();
  let data: {
    token?: string;
    status?: boolean;
    errors?: unknown;
    message?: string;
  } = {};
  if (raw) {
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      return NextResponse.json(
        { message: "Login service returned a non-JSON response" },
        { status: res.status >= 400 ? res.status : 502 },
      );
    }
  }
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }
  if (typeof data.token === "string" && data.status === true) {
    const out = NextResponse.json({ status: true });
    out.cookies.set(TOKEN_COOKIE, data.token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === "production",
    });
    return out;
  }
  return NextResponse.json(data, { status: res.status });
}
