"use client";

import { useThemeStore } from "@/stores/useThemeStore";
import { useEffect } from "react";

export function ThemeBootstrapper() {
  const { hydrateTheme, currentTheme } = useThemeStore();

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  if (!currentTheme) {
    return null;
  }

  return null;
}
