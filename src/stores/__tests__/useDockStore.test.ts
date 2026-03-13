import { describe, it, expect, beforeEach } from "vitest";
import { useDockStore } from "../useDockStore";
import type { AppKey } from "@/lib/apps";

describe("useDockStore", () => {
  beforeEach(() => {
    useDockStore.setState({
      dockApps: [],
      desktopApps: [],
      isAppLauncherOpen: false,
    });
  });

  it("addToDock adds app when not already in dock", () => {
    const { addToDock } = useDockStore.getState();
    addToDock("Pomodoro");
    expect(useDockStore.getState().dockApps).toContain("Pomodoro");
  });

  it("addToDock does not duplicate app already in dock", () => {
    const { addToDock } = useDockStore.getState();
    addToDock("Pomodoro");
    addToDock("Pomodoro");
    expect(useDockStore.getState().dockApps).toEqual(["Pomodoro"]);
  });

  it("removeFromDock removes app from dock", () => {
    const { addToDock, removeFromDock } = useDockStore.getState();
    addToDock("Pomodoro");
    addToDock("Todo");
    removeFromDock("Pomodoro");
    expect(useDockStore.getState().dockApps).toEqual(["Todo"]);
  });

  it("addToDesktop adds app to desktop", () => {
    const { addToDesktop } = useDockStore.getState();
    addToDesktop("Kanban" as AppKey);
    expect(useDockStore.getState().desktopApps).toContain("Kanban");
  });

  it("removeFromDesktop removes app from desktop", () => {
    const { addToDesktop, removeFromDesktop } = useDockStore.getState();
    addToDesktop("Kanban" as AppKey);
    removeFromDesktop("Kanban" as AppKey);
    expect(useDockStore.getState().desktopApps).not.toContain("Kanban");
  });

  it("toggleLauncher toggles isAppLauncherOpen", () => {
    const { toggleLauncher } = useDockStore.getState();
    expect(useDockStore.getState().isAppLauncherOpen).toBe(false);
    toggleLauncher();
    expect(useDockStore.getState().isAppLauncherOpen).toBe(true);
    toggleLauncher();
    expect(useDockStore.getState().isAppLauncherOpen).toBe(false);
  });
});
