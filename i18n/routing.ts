import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en", "he"],
  defaultLocale: "ar",
  localePrefix: "as-needed",
  localeDetection: false,
});
