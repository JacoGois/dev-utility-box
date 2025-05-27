import type { AppKey } from "@/lib/apps";
import { create } from "zustand";

type DockStore = {
  dockApps: AppKey[];
  desktopApps: AppKey[];
  isAppLauncherOpen: boolean;
  toggleLauncher: () => void;
  addToDock: (app: AppKey) => void;
  addToDesktop: (app: AppKey) => void;
  removeFromDock: (app: AppKey) => void;
  removeFromDesktop: (app: AppKey) => void;
};

export const useDockStore = create<DockStore>((set) => ({
  dockApps: [],
  desktopApps: [],
  isAppLauncherOpen: false,
  toggleLauncher: () =>
    set((state) => ({ isAppLauncherOpen: !state.isAppLauncherOpen })),
  addToDock: (app) =>
    set((state) =>
      state.dockApps.includes(app)
        ? state
        : { dockApps: [...state.dockApps, app] }
    ),
  addToDesktop: (app) =>
    set((state) =>
      state.desktopApps.includes(app)
        ? state
        : { desktopApps: [...state.desktopApps, app] }
    ),
  removeFromDock: (appKey: AppKey) =>
    set((state) => ({
      dockApps: state.dockApps.filter((a) => a !== appKey),
    })),
  removeFromDesktop: (appKey: AppKey) =>
    set((state) => ({
      desktopApps: state.desktopApps.filter((a) => a !== appKey),
    })),
}));
