"use client";

import { useThemeStore } from "@/stores/useThemeStore";
import { useEffect } from "react";

export function ThemeBootstrapper() {
  const { currentTheme } = useThemeStore();

  useEffect(() => {
    document.body.classList.add(`theme-${currentTheme}`);
  }, [currentTheme]);

  return null;
}
