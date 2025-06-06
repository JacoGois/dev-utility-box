import { apps, type AppKey } from "@/lib/apps";
import { toast } from "sonner";
import { create } from "zustand";
import { useDockStore } from "./useDockStore";

export type WindowInstance = {
  id: string;
  appKey: AppKey;
};

type WindowStore = {
  openApps: WindowInstance[];
  focusStack: string[];
  minimizedApps: string[];
  maximizedApps: string[];

  openApp: (appKey: AppKey) => void;
  closeApp: (id: string) => void;
  focusApp: (id: string) => void;
  minimizeApp: (id: string) => void;
  toggleMaximizeApp: (id: string) => void;
  restoreApp: (id: string) => void;
};

export const useWindowStore = create<WindowStore>((set, get) => ({
  openApps: [],
  focusStack: [],
  minimizedApps: [],
  maximizedApps: [],

  openApp: (appKey: AppKey) => {
    const currentCount = get().openApps.filter(
      (app) => app.appKey === appKey
    ).length;
    const maxAllowed = apps[appKey].maxInstances ?? Infinity;

    if (currentCount >= maxAllowed) {
      toast("Você já abriu o número máximo de janelas deste aplicativo.");
      return;
    }

    const id = `${appKey}-${Date.now()}`;

    set((state) => ({
      openApps: [...state.openApps, { id, appKey }],
      focusStack: [...state.focusStack, id],
    }));

    const { dockApps, addToDock } = useDockStore.getState();
    if (!dockApps.includes(appKey)) {
      addToDock(appKey);
    }
  },

  closeApp: (id) =>
    set((state) => {
      const instance = state.openApps.find((w) => w.id === id);
      const remainingApps = state.openApps.filter((w) => w.id !== id);
      const { removeFromDock } = useDockStore.getState();

      if (
        instance &&
        !remainingApps.some((w) => w.appKey === instance.appKey)
      ) {
        removeFromDock(instance.appKey);
      }

      return {
        openApps: remainingApps,
        focusStack: state.focusStack.filter((w) => w !== id),
        minimizedApps: state.minimizedApps.filter((w) => w !== id),
        maximizedApps: state.maximizedApps.filter((w) => w !== id),
      };
    }),

  focusApp: (id) =>
    set((state) => ({
      focusStack: [...state.focusStack.filter((w) => w !== id), id],
    })),

  minimizeApp: (id) =>
    set((state) => ({
      minimizedApps: [...new Set([...state.minimizedApps, id])],
    })),

  toggleMaximizeApp: (id) =>
    set((state) => ({
      maximizedApps: state.maximizedApps.includes(id)
        ? state.maximizedApps.filter((w) => w !== id)
        : [...state.maximizedApps, id],
    })),
  restoreApp: (id: string) =>
    set((state) => ({
      minimizedApps: state.minimizedApps.filter((minId) => minId !== id),
      focusStack: state.focusStack.filter((fid) => fid !== id).concat(id),
    })),
}));
