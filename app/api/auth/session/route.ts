import { NextRequest, NextResponse } from "next/server";

const TOKEN_COOKIE = "nc_access_token";

/**
 * Tells the client whether an httpOnly auth cookie exists, without exposing the token.
 * Used to skip wish-list BFF calls for guests (avoids noisy 401 in the network panel).
 */
export function GET(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  const authenticated = Boolean(token && token.trim().length > 0);
  return NextResponse.json({ authenticated });
}
