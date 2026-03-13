import { describe, it, expect, beforeEach } from "vitest";
import { useAppStateStore } from "../useAppStateStore";

describe("useAppStateStore", () => {
  beforeEach(() => {
    useAppStateStore.setState({ appStates: {} });
  });

  it("setAppState stores state by instanceId", () => {
    const { setAppState } = useAppStateStore.getState();
    setAppState("Pomodoro-1", { duration: 25 });
    expect(useAppStateStore.getState().appStates["Pomodoro-1"]).toEqual({
      duration: 25,
    });
  });

  it("setAppState merges with existing state", () => {
    const { setAppState } = useAppStateStore.getState();
    setAppState("Todo-1", { items: ["a"] });
    setAppState("Todo-1", { filter: "all" });
    expect(useAppStateStore.getState().appStates["Todo-1"]).toEqual({
      items: ["a"],
      filter: "all",
    });
  });

  it("removeAppState removes state for instanceId", () => {
    const { setAppState, removeAppState } = useAppStateStore.getState();
    setAppState("Pomodoro-1", { duration: 25 });
    removeAppState("Pomodoro-1");
    expect(useAppStateStore.getState().appStates["Pomodoro-1"]).toBeUndefined();
  });

  it("multiple instanceIds are independent", () => {
    const { setAppState } = useAppStateStore.getState();
    setAppState("Todo-1", { count: 1 });
    setAppState("Todo-2", { count: 2 });
    expect(useAppStateStore.getState().appStates["Todo-1"]).toEqual({ count: 1 });
    expect(useAppStateStore.getState().appStates["Todo-2"]).toEqual({ count: 2 });
  });
});
