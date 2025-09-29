"use client";

import { useThemeStore } from "@/stores/useThemeStore";
import { useEffect, useState } from "react";

export function ThemeBootstrapper() {
  const { hydrateTheme } = useThemeStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    hydrateTheme();
    setIsHydrated(true);
  }, [hydrateTheme]);

  if (!isHydrated) {
    return null;
  }

  return null;
}
