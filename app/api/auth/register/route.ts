import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api-base";

const TOKEN_COOKIE = "nc_access_token";

export async function POST(req: NextRequest) {
  const base = getApiBaseUrl();
  if (!base) {
    return NextResponse.json({ message: "API not configured" }, { status: 500 });
  }
  const loc = req.headers.get("x-localization") ?? "ar";
  const body = await req.text();
  const res = await fetch(`${base}/auth/registration`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-localization": loc,
      Accept: "application/json",
    },
    body,
  });
  const raw = await res.text();
  let data: {
    token?: string;
    temporary_token?: string;
    errors?: unknown;
    message?: string;
  } = {};
  if (raw) {
    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      return NextResponse.json(
        { message: "Registration service returned a non-JSON response" },
        { status: res.status >= 400 ? res.status : 502 },
      );
    }
  }
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }
  if (typeof data.token === "string") {
    const out = NextResponse.json({ ok: true });
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
