import { describe, it, expect, beforeEach } from "vitest";
import { useDesktopStore } from "../useDesktopStore";

describe("useDesktopStore", () => {
  beforeEach(() => {
    useDesktopStore.setState({ background: "var(--background-url)" });
  });

  it("initial state has background var(--background-url)", () => {
    expect(useDesktopStore.getState().background).toBe("var(--background-url)");
  });

  it("setBackground updates background", () => {
    const { setBackground } = useDesktopStore.getState();
    setBackground("url(/wallpaper.jpg)");
    expect(useDesktopStore.getState().background).toBe("url(/wallpaper.jpg)");
  });
});
