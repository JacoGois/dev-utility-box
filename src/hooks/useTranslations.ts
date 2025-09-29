import { useTranslations as useNextIntlTranslations } from 'next-intl';

export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace);
}

// Hook específico para traduções comuns
export function useCommonTranslations() {
  return useTranslations('common');
}

// Hook específico para traduções de apps
export function useAppTranslations(appKey: string) {
  return useTranslations(`apps.${appKey}`);
}

// Hook específico para traduções de desktop
export function useDesktopTranslations() {
  return useTranslations('desktop');
}
