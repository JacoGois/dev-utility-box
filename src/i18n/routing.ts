import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "pt", "es", "fr", "de", "ja", "zh"],
  defaultLocale: "en",
});
