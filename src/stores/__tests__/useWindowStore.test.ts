import { describe, it, expect, beforeEach, vi } from "vitest";
import { useWindowStore } from "../useWindowStore";
import { useDockStore } from "../useDockStore";
import { useAppStateStore } from "../useAppStateStore";

vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

describe("useWindowStore", () => {
  beforeEach(() => {
    const getItem = vi.fn(() => null);
    const setItem = vi.fn();
    Object.defineProperty(window, "localStorage", {
      value: { getItem, setItem },
      writable: true,
    });
    useWindowStore.setState({
      openApps: [],
      focusStack: [],
      minimizedApps: [],
      maximizedApps: [],
      positions: {},
      sizes: {},
    });
    useDockStore.setState({ dockApps: [], desktopApps: [], isAppLauncherOpen: false });
    useAppStateStore.setState({ appStates: {} });
  });

  it("openApp adds one app and updates focusStack", () => {
    const { openApp } = useWindowStore.getState();
    openApp("Todo");
    const state = useWindowStore.getState();
    expect(state.openApps).toHaveLength(1);
    expect(state.openApps[0].appKey).toBe("Todo");
    expect(state.openApps[0].id).toMatch(/^Todo-\d+$/);
    expect(state.focusStack).toHaveLength(1);
    expect(state.focusStack[0]).toBe(state.openApps[0].id);
  });

  it("openApp adds app to dock when not already there", () => {
    const { openApp } = useWindowStore.getState();
    openApp("Pomodoro");
    expect(useDockStore.getState().dockApps).toContain("Pomodoro");
  });

  it("openApp does not duplicate app in dock when already present", () => {
    useDockStore.getState().addToDock("Todo");
    const { openApp } = useWindowStore.getState();
    openApp("Todo");
    expect(useDockStore.getState().dockApps).toEqual(["Todo"]);
  });

  it("openApp shows toast when maxInstances reached", async () => {
    const { toast } = await import("sonner");
    const { openApp } = useWindowStore.getState();
    const t = vi.fn((key: string) => key);
    openApp("Todo", 1, t);
    openApp("Todo", 1, t);
    expect(toast).toHaveBeenCalledWith("maxWindowsReached");
    expect(t).toHaveBeenCalledWith("maxWindowsReached", { appName: "Todo" });
  });

  it("openApp shows default English toast when maxInstances reached and t not provided", async () => {
    const { toast } = await import("sonner");
    const { openApp } = useWindowStore.getState();
    openApp("Todo", 1);
    openApp("Todo", 1);
    expect(toast).toHaveBeenCalledWith(
      "You have already opened the maximum number of windows for this application."
    );
  });

  it("openApp allows multiple windows when under maxInstances", () => {
    const { openApp } = useWindowStore.getState();
    openApp("Todo", 2);
    openApp("Todo", 2);
    expect(useWindowStore.getState().openApps).toHaveLength(2);
  });

  it("closeApp removes app and removes from dock when last of that app", () => {
    const { openApp, closeApp } = useWindowStore.getState();
    openApp("Todo");
    const id = useWindowStore.getState().openApps[0].id;
    closeApp(id);
    expect(useWindowStore.getState().openApps).toHaveLength(0);
    expect(useDockStore.getState().dockApps).not.toContain("Todo");
  });

  it("closeApp does not remove from dock when another window of same app exists", () => {
    vi.useFakeTimers();
    const { openApp, closeApp } = useWindowStore.getState();
    openApp("Todo", 2);
    vi.advanceTimersByTime(1);
    openApp("Todo", 2);
    const ids = useWindowStore.getState().openApps.map((w) => w.id);
    expect(ids).toHaveLength(2);
    closeApp(ids[0]);
    expect(useWindowStore.getState().openApps).toHaveLength(1);
    expect(useDockStore.getState().dockApps).toContain("Todo");
    vi.useRealTimers();
  });

  it("closeApp is no-op when id not found", () => {
    const { openApp, closeApp } = useWindowStore.getState();
    openApp("Todo");
    closeApp("non-existent-id");
    expect(useWindowStore.getState().openApps).toHaveLength(1);
  });

  it("closeApp removes position and size for closed window", () => {
    const { openApp, closeApp, setWindowPosition, setWindowSize } = useWindowStore.getState();
    openApp("Todo");
    const id = useWindowStore.getState().openApps[0].id;
    setWindowPosition(id, { x: 50, y: 50 });
    setWindowSize(id, { width: 400, height: 300 });
    closeApp(id);
    const state = useWindowStore.getState();
    expect(state.positions[id]).toBeUndefined();
    expect(state.sizes[id]).toBeUndefined();
  });

  it("focusApp moves id to front of focusStack", () => {
    const { openApp, focusApp } = useWindowStore.getState();
    openApp("Todo");
    openApp("Pomodoro");
    const state = useWindowStore.getState();
    const [firstId, secondId] = state.openApps.map((w) => w.id);
    expect(state.focusStack[state.focusStack.length - 1]).toBe(secondId);
    focusApp(firstId);
    expect(useWindowStore.getState().focusStack[useWindowStore.getState().focusStack.length - 1]).toBe(firstId);
  });

  it("focusApp adds id to focusStack when not present", () => {
    const { openApp, focusApp } = useWindowStore.getState();
    openApp("Todo");
    const id = useWindowStore.getState().openApps[0].id;
    useWindowStore.setState(() => ({ focusStack: [] }));
    focusApp(id);
    expect(useWindowStore.getState().focusStack).toContain(id);
    expect(useWindowStore.getState().focusStack[useWindowStore.getState().focusStack.length - 1]).toBe(id);
  });

  it("minimizeApp adds id to minimizedApps", () => {
    const { openApp, minimizeApp } = useWindowStore.getState();
    openApp("Todo");
    const id = useWindowStore.getState().openApps[0].id;
    minimizeApp(id);
    expect(useWindowStore.getState().minimizedApps).toContain(id);
  });

  it("minimizeApp does not duplicate id when called twice", () => {
    const { openApp, minimizeApp } = useWindowStore.getState();
    openApp("Todo");
    const id = useWindowStore.getState().openApps[0].id;
    minimizeApp(id);
    minimizeApp(id);
    expect(useWindowStore.getState().minimizedApps.filter((x) => x === id)).toHaveLength(1);
  });

  it("toggleMaximizeApp toggles maximized state", () => {
    const { openApp, toggleMaximizeApp } = useWindowStore.getState();
    openApp("Todo");
    const id = useWindowStore.getState().openApps[0].id;
    expect(useWindowStore.getState().maximizedApps).not.toContain(id);
    toggleMaximizeApp(id);
    expect(useWindowStore.getState().maximizedApps).toContain(id);
    toggleMaximizeApp(id);
    expect(useWindowStore.getState().maximizedApps).not.toContain(id);
  });

  it("restoreApp removes from minimized and brings to front of focusStack", () => {
    const { openApp, minimizeApp, restoreApp } = useWindowStore.getState();
    openApp("Todo");
    openApp("Pomodoro");
    const state = useWindowStore.getState();
    const firstId = state.openApps[0].id;
    minimizeApp(firstId);
    restoreApp(firstId);
    const after = useWindowStore.getState();
    expect(after.minimizedApps).not.toContain(firstId);
    expect(after.focusStack[after.focusStack.length - 1]).toBe(firstId);
  });

  it("setWindowPosition stores position by id", () => {
    const { openApp, setWindowPosition } = useWindowStore.getState();
    openApp("Todo");
    const id = useWindowStore.getState().openApps[0].id;
    setWindowPosition(id, { x: 100, y: 200 });
    expect(useWindowStore.getState().positions[id]).toEqual({ x: 100, y: 200 });
  });

  it("setWindowSize stores size by id", () => {
    const { openApp, setWindowSize } = useWindowStore.getState();
    openApp("Todo");
    const id = useWindowStore.getState().openApps[0].id;
    setWindowSize(id, { width: 800, height: 600 });
    expect(useWindowStore.getState().sizes[id]).toEqual({ width: 800, height: 600 });
  });
});
