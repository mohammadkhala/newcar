import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en", "he"],
  defaultLocale: "ar",
  // Avoid 307 redirect loop (Location: /) behind reverse proxy; use explicit locale paths.
  localePrefix: "always",
  localeDetection: false,
});
