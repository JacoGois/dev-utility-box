import { create } from "zustand";

type DesktopStore = {
  background: string;
  setBackground: (bg: string) => void;
};

export const useDesktopStore = create<DesktopStore>((set) => ({
  background: "/wallpaper-default.jpg",
  setBackground: (bg) => set({ background: bg }),
}));
