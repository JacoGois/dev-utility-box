import { ThemeKey } from "@/stores/useThemeStore";
import React from "react";
import { DockUbuntu } from "./DockUbuntu";
import { DockWindowsXP } from "./DockWindowsXP";
import { DockThemeProps } from "./types";

export const dockThemeRegistry: Record<ThemeKey, React.FC<DockThemeProps>> = {
  ubuntu: DockUbuntu,
  macos: DockUbuntu,
  "windows-xp": DockWindowsXP,
};
