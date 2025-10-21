import { useTranslations as useNextIntlTranslations } from "next-intl";

export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace);
}

export function useCommonTranslations() {
  return useTranslations("common");
}

export function useAppTranslations(appKey: string) {
  return useTranslations(`apps.${appKey}`);
}

export function useDesktopTranslations() {
  return useTranslations("desktop");
}

export function useGlobalErrorTranslations() {
  return useTranslations("errors");
}
