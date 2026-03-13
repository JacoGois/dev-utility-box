import { describe, it, expect, beforeEach, vi } from "vitest";
import { useThemeStore } from "../useThemeStore";

describe("useThemeStore", () => {
  const mockClassList = {
    add: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(document, "body", {
      value: { classList: mockClassList },
      writable: true,
    });
    const getItem = vi.fn(() => null);
    const setItem = vi.fn();
    Object.defineProperty(window, "localStorage", {
      value: { getItem, setItem },
      writable: true,
    });
    useThemeStore.setState({ currentTheme: "ubuntu" });
  });

  it("setTheme adds theme- class to body", () => {
    const { setTheme } = useThemeStore.getState();
    setTheme("macos");
    expect(mockClassList.remove).toHaveBeenCalledWith(
      "theme-ubuntu",
      "theme-macos",
      "theme-windows-xp"
    );
    expect(mockClassList.add).toHaveBeenCalledWith("theme-macos");
  });

  it("setTheme updates currentTheme state", () => {
    const { setTheme } = useThemeStore.getState();
    setTheme("windows-xp");
    expect(useThemeStore.getState().currentTheme).toBe("windows-xp");
  });
});
