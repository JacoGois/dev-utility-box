import { AppKey, apps, appsType } from "@/lib/apps";
import { create } from "zustand";

export type SearchResultItem = {
  id: AppKey;
  type: "app";
  name: string;
  icon: appsType[AppKey]["icon"];
  action: () => void;
};

type SpotlightStore = {
  isOpen: boolean;
  query: string;
  results: SearchResultItem[];
  selectedIndex: number;
  openSpotlight: () => void;
  closeSpotlight: () => void;
  setQuery: (query: string) => void;
  performSearch: (
    query: string,
    openAppCallback: (appKey: AppKey) => void
  ) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  executeSelected: () => void;
};

export const useSpotlightStore = create<SpotlightStore>((set, get) => ({
  isOpen: false,
  query: "",
  results: [],
  selectedIndex: -1,

  openSpotlight: () =>
    set({ isOpen: true, query: "", results: [], selectedIndex: -1 }),
  closeSpotlight: () => set({ isOpen: false }),
  setQuery: (query) => set({ query }),

  performSearch: (query, openAppCallback) => {
    if (!query.trim()) {
      set({ results: [], selectedIndex: -1 });
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const filteredApps = (Object.entries(apps) as [AppKey, appsType[AppKey]][])
      .filter((app) => app[1].name.toLowerCase().includes(lowerCaseQuery))
      .map(
        ([key, appConfig]): SearchResultItem => ({
          id: key,
          type: "app",
          name: appConfig.name,
          icon: appConfig.icon,
          action: () => {
            openAppCallback(key);
            get().closeSpotlight();
          },
        })
      );

    set({
      results: filteredApps,
      selectedIndex: filteredApps.length > 0 ? 0 : -1,
    });
  },

  selectNext: () =>
    set((state) => ({
      selectedIndex:
        state.results.length > 0
          ? (state.selectedIndex + 1) % state.results.length
          : -1,
    })),

  selectPrevious: () =>
    set((state) => ({
      selectedIndex:
        state.results.length > 0
          ? (state.selectedIndex - 1 + state.results.length) %
            state.results.length
          : -1,
    })),

  executeSelected: () => {
    const { results, selectedIndex } = get();
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      results[selectedIndex].action();
    }
  },
}));
