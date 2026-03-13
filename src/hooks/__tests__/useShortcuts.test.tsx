import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useShortcuts, type Shortcut } from "../useShortcuts";

const mockT = vi.fn((key: string) => key);

vi.mock("../useTranslations", () => ({
  useDesktopTranslations: () => mockT,
}));

function TestComponent({ onShortcuts }: { onShortcuts: (s: Shortcut[]) => void }) {
  const shortcuts = useShortcuts();
  onShortcuts(shortcuts);
  return null;
}

describe("useShortcuts", () => {
  it("returns an array of shortcuts with keys and description", () => {
    let shortcuts: Shortcut[] = [];
    render(<TestComponent onShortcuts={(s) => (shortcuts = s)} />);
    expect(shortcuts).toHaveLength(4);
    expect(shortcuts[0]).toEqual({ keys: ["Ctrl", "K"], description: "help.spotlight" });
    expect(shortcuts[1]).toEqual({ keys: ["Ctrl", "M"], description: "help.launcher" });
    expect(shortcuts[2]).toEqual({ keys: ["Ctrl", "L"], description: "help.language" });
    expect(shortcuts[3]).toEqual({ description: "help.resizeWindow" });
  });

  it("uses useDesktopTranslations for each description", () => {
    mockT.mockClear();
    render(<TestComponent onShortcuts={() => {}} />);
    expect(mockT).toHaveBeenCalledWith("help.spotlight");
    expect(mockT).toHaveBeenCalledWith("help.launcher");
    expect(mockT).toHaveBeenCalledWith("help.language");
    expect(mockT).toHaveBeenCalledWith("help.resizeWindow");
  });

  it("each shortcut has description; first three have keys array", () => {
    let shortcuts: Shortcut[] = [];
    render(<TestComponent onShortcuts={(s) => (shortcuts = s)} />);
    shortcuts.forEach((s) => {
      expect(s).toHaveProperty("description");
      expect(typeof s.description).toBe("string");
    });
    expect(shortcuts[0].keys).toEqual(["Ctrl", "K"]);
    expect(shortcuts[1].keys).toEqual(["Ctrl", "M"]);
    expect(shortcuts[2].keys).toEqual(["Ctrl", "L"]);
    expect(shortcuts[3].keys).toBeUndefined();
  });
});
