import { create } from "zustand";

export type ThemeKey = "ubuntu" | "macos" | "windows-xp";

export const defaultTheme: ThemeKey = "ubuntu";

export const useThemeStore = create<{
  currentTheme: ThemeKey | null;
  setTheme: (theme: ThemeKey) => void;
  hydrateTheme: () => void;
}>((set, get) => ({
  currentTheme: defaultTheme, // Start with default theme to prevent hydration mismatch
  setTheme: (theme) => {
    if (typeof document !== "undefined") {
      document.body.classList.remove(
        "theme-ubuntu",
        "theme-macos",
        "theme-windows-xp"
      );
      document.body.classList.add(`theme-${theme}`);
      localStorage.setItem("theme", theme);
    }
    set({ currentTheme: theme });
  },
  hydrateTheme: () => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      const storedTheme =
        (localStorage.getItem("theme") as ThemeKey) || defaultTheme;
      get().setTheme(storedTheme);
    }
  },
}));
