import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn (utils)", () => {
  it("merges conditional classes", () => {
    expect(cn("a", "b")).toBe("a b");
    expect(cn("a", false && "b", "c")).toBe("a c");
  });

  it("merges conflicting Tailwind classes (last wins)", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("accepts conditional objects", () => {
    expect(cn({ "bg-red-500": true, "bg-blue-500": false })).toBe("bg-red-500");
  });

  it("returns empty string when no arguments", () => {
    expect(cn()).toBe("");
  });
});
