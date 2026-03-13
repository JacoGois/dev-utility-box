import { describe, it, expect } from "vitest";
import { shortcuts } from "../shortcuts";

describe("shortcuts", () => {
  it("is a non-empty array", () => {
    expect(Array.isArray(shortcuts)).toBe(true);
    expect(shortcuts.length).toBeGreaterThan(0);
  });

  it("each item has description", () => {
    for (const s of shortcuts) {
      expect(s).toHaveProperty("description");
      expect(typeof s.description).toBe("string");
      expect(s.description.length).toBeGreaterThan(0);
    }
  });

  it("when keys exists, it is an array of strings", () => {
    for (const s of shortcuts) {
      if (s.keys !== undefined) {
        expect(Array.isArray(s.keys)).toBe(true);
        expect(s.keys.every((k) => typeof k === "string")).toBe(true);
      }
    }
  });

  it("contains quick search shortcut (Ctrl+K)", () => {
    const searchShortcut = shortcuts.find(
      (s) => s.keys?.includes("Ctrl") && s.keys?.includes("K")
    );
    expect(searchShortcut).toBeDefined();
    expect(searchShortcut?.description).toBeTruthy();
  });
});
