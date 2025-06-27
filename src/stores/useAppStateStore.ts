import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AppState = Record<string, unknown>;

type AppStateStore = {
  appStates: AppState;

  setAppState: <T>(instanceId: string, newState: Partial<T>) => void;
  removeAppState: (instanceId: string) => void;
};

export const useAppStateStore = create<AppStateStore>()(
  persist(
    (set) => ({
      appStates: {},

      setAppState: <T>(instanceId: string, newState: Partial<T>) =>
        set((state) => ({
          appStates: {
            ...state.appStates,
            [instanceId]: {
              ...(state.appStates[instanceId] as Partial<T>),
              ...newState,
            },
          },
        })),

      removeAppState: (instanceId) =>
        set((state) => {
          const newAppStates = { ...state.appStates };
          delete newAppStates[instanceId];
          return { appStates: newAppStates };
        }),
    }),
    {
      name: "app-states-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
