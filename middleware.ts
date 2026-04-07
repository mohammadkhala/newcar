import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * next-intl expects the Edge middleware runtime. Next.js 16 `proxy.ts` uses the Node runtime and
 * can cause redirect loops with locale rewrites; keep this file as `middleware.ts` until the
 * library documents a Node-safe proxy pattern.
 */
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next/|_vercel/|.*\\..*).*)"],
};
