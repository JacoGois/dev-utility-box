import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { usePersistentAppStore } from "../usePersistentAppStore";
import { useAppStateStore } from "@/stores/useAppStateStore";

describe("usePersistentAppStore", () => {
  beforeEach(() => {
    useAppStateStore.setState({ appStates: {} });
  });

  it("returns defaultState when no stored state", () => {
    const { result } = renderHook(() =>
      usePersistentAppStore("Todo-1", { items: [], filter: "all" })
    );
    const [state] = result.current;
    expect(state).toEqual({ items: [], filter: "all" });
  });

  it("returns merge of defaultState with stored state", () => {
    useAppStateStore.setState({
      appStates: { "Todo-1": { items: ["a", "b"] } },
    });
    const { result } = renderHook(() =>
      usePersistentAppStore("Todo-1", { items: [], filter: "all" })
    );
    const [state] = result.current;
    expect(state.items).toEqual(["a", "b"]);
    expect(state.filter).toBe("all");
  });

  it("setState with object updates global store", () => {
    const { result } = renderHook(() =>
      usePersistentAppStore("Todo-1", { items: [], filter: "all" })
    );
    const [, setState] = result.current;
    act(() => {
      setState({ filter: "done" });
    });
    expect(useAppStateStore.getState().appStates["Todo-1"]).toMatchObject({
      filter: "done",
    });
  });

  it("setState with function receives previous state and updates", () => {
    useAppStateStore.setState({
      appStates: { "Todo-1": { count: 5 } },
    });
    const { result } = renderHook(() =>
      usePersistentAppStore("Todo-1", { count: 0 })
    );
    const [, setState] = result.current;
    act(() => {
      setState((prev) => ({ count: prev.count + 1 }));
    });
    expect(useAppStateStore.getState().appStates["Todo-1"]).toMatchObject({
      count: 6,
    });
  });
});
