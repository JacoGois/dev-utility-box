import { create } from "zustand";

export type ThemeKey = "ubuntu" | "macos" | "windows-xp";

export const defaultTheme: ThemeKey = "ubuntu";

export const useThemeStore = create<{
  currentTheme: ThemeKey | null;
  setTheme: (theme: ThemeKey) => void;
  hydrateTheme: () => void;
}>((set) => ({
  currentTheme: null,
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
    if (typeof localStorage !== "undefined") {
      const storedTheme =
        (localStorage.getItem("theme") as ThemeKey) || defaultTheme;
      set((state) => {
        state.setTheme(storedTheme);
        return { currentTheme: storedTheme };
      });
    } else {
      set((state) => {
        state.setTheme(defaultTheme);
        return { currentTheme: defaultTheme };
      });
    }
  },
}));
