"use client";

import {
  ThemeKey,
  defaultTheme as defaultThemeStore,
  useThemeStore,
} from "@/stores/useThemeStore";
import React from "react";

interface ThemedComponentProps<P> {
  registry: Partial<Record<ThemeKey, React.ComponentType<P>>>;
  defaultTheme?: ThemeKey;
  [key: string]: unknown;
}

export function ThemedComponent<P extends object>({
  registry,
  defaultTheme = defaultThemeStore,
  ...props
}: ThemedComponentProps<P>) {
  const { currentTheme } = useThemeStore();

  if (currentTheme === null) {
    return null;
  }

  const ComponentToRender =
    registry[currentTheme] ||
    registry[defaultTheme] ||
    Object.values(registry)[0];

  if (!ComponentToRender || currentTheme === null) {
    return null;
  }

  return <ComponentToRender {...(props as P)} />;
}
