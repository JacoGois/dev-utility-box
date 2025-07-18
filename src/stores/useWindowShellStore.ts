import React from "react";
import { create } from "zustand";

type RefMap = {
  [windowId: string]: React.RefObject<HTMLDivElement | null> | null;
};

type WindowShellState = {
  refs: RefMap;
  setShellRef: (
    id: string,
    ref: React.RefObject<HTMLDivElement | null> | null
  ) => void;
};

export const useWindowShellStore = create<WindowShellState>((set) => ({
  refs: {},
  setShellRef: (id, ref) =>
    set((state) => ({
      refs: { ...state.refs, [id]: ref },
    })),
}));
