import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = hasLocale(routing.locales, requestLocale)
    ? requestLocale
    : routing.defaultLocale;

  const messages = await import(`./messages/${locale}.json`).then(
    (module) => module.default
  );

  return {
    locale,
    messages,
  };
});
