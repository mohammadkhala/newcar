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
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-localization": loc,
      Accept: "application/json",
    },
    body,
  });
  const data = (await res.json()) as {
    token?: string;
    status?: boolean;
    errors?: unknown;
  };
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
