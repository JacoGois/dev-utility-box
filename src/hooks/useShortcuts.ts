import { useDesktopTranslations } from "./useTranslations";

export interface Shortcut {
  keys?: string[];
  description: string;
}

export function useShortcuts(): Shortcut[] {
  const t = useDesktopTranslations();

  return [
    {
      keys: ["Ctrl", "K"],
      description: t("help.spotlight"),
    },
    {
      keys: ["Ctrl", "M"],
      description: t("help.launcher"),
    },
    {
      keys: ["Ctrl", "L"],
      description: t("help.language"),
    },
    {
      description: t("help.resizeWindow"),
    },
  ];
}
