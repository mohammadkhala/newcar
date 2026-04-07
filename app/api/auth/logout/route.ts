import { NextResponse } from "next/server";

const TOKEN_COOKIE = "nc_access_token";

export async function POST() {
  const out = NextResponse.json({ ok: true });
  out.cookies.delete(TOKEN_COOKIE);
  return out;
}
