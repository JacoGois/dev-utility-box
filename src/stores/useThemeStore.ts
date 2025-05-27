import { create } from "zustand";

type ThemeKey = "ubuntu" | "macos";

const getStoredTheme = () =>
  typeof localStorage !== "undefined"
    ? (localStorage.getItem("theme") as ThemeKey) || "ubuntu"
    : "ubuntu";

export const useThemeStore = create<{
  currentTheme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;
}>((set) => ({
  currentTheme: getStoredTheme(),
  setTheme: (theme) => {
    document.body.classList.remove("theme-ubuntu", "theme-macos");
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem("theme", theme);
    set({ currentTheme: theme });
  },
}));
