import type { AppKey } from "@/lib/apps";
import { toast } from "sonner";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAppStateStore } from "./useAppStateStore";
import { useDockStore } from "./useDockStore";

export type WindowInstance = {
  id: string;
  appKey: AppKey;
};

type Position = { x: number; y: number };
type Size = { width: number; height: number };

type WindowStore = {
  openApps: WindowInstance[];
  focusStack: string[];
  minimizedApps: string[];
  maximizedApps: string[];
  positions: Record<string, Position>;
  sizes: Record<string, Size>;

  openApp: (
    appKey: AppKey,
    maxInstances?: number,
    t?: (key: string, params?: Record<string, string>) => string
  ) => void;
  closeApp: (id: string) => void;
  focusApp: (id: string) => void;
  minimizeApp: (id: string) => void;
  toggleMaximizeApp: (id: string) => void;
  restoreApp: (id: string) => void;
  setWindowPosition: (id: string, position: Position) => void;
  setWindowSize: (id: string, size: Size) => void;
};

export const useWindowStore = create<WindowStore>()(
  persist(
    (set, get) => ({
      openApps: [],
      focusStack: [],
      minimizedApps: [],
      maximizedApps: [],
      positions: {},
      sizes: {},

      openApp: (
        appKey: AppKey,
        maxInstances: number = Infinity,
        t?: (key: string, params?: Record<string, string>) => string
      ) => {
        const currentApps = get().openApps.filter(
          (app) => app.appKey === appKey
        );

        if (currentApps?.length >= maxInstances) {
          toast(
            t
              ? t("maxWindowsReached", { appName: currentApps[0].appKey })
              : "You have already opened the maximum number of windows for this application."
          );
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

      closeApp: (id) => {
        const { removeAppState } = useAppStateStore.getState();

        removeAppState(id);

        set((state) => {
          const instance = state.openApps.find((w) => w.id === id);

          if (!instance) {
            return state;
          }

          const remainingApps = state.openApps.filter((w) => w.id !== id);
          const { removeFromDock } = useDockStore.getState();
          const newPositions = { ...state.positions };
          delete newPositions[id];
          const newSizes = { ...state.sizes };
          delete newSizes[id];

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
            positions: newPositions,
            sizes: newSizes,
          };
        });
      },

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
      setWindowPosition: (id, position) =>
        set((state) => ({
          positions: { ...state.positions, [id]: position },
        })),

      setWindowSize: (id, size) =>
        set((state) => ({
          sizes: { ...state.sizes, [id]: size },
        })),
    }),
    {
      name: "window-store-state",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
