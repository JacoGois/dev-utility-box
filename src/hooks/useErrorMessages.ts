import { useTranslations } from './useTranslations';

export function useErrorMessages() {
  const t = useTranslations('errors');
  
  return {
    maxWindowsReached: () => t('maxWindowsReached'),
    generic: () => t('generic'),
    network: () => t('network'),
    validation: () => t('validation'),
  };
}
