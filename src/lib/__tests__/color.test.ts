import { describe, it, expect } from "vitest";
import {
  normalizeHexColor,
  hexToRgba,
  getTagTextColor,
} from "../color";

describe("normalizeHexColor", () => {
  it("returns undefined for empty or undefined string", () => {
    expect(normalizeHexColor("")).toBeUndefined();
    expect(normalizeHexColor(undefined)).toBeUndefined();
  });

  it("returns undefined for invalid format", () => {
    expect(normalizeHexColor("red")).toBeUndefined();
    expect(normalizeHexColor("#gggggg")).toBeUndefined();
    expect(normalizeHexColor("#12")).toBeUndefined();
  });

  it("expands 3-digit hex to 6 digits", () => {
    expect(normalizeHexColor("#f00")).toBe("#ff0000");
    expect(normalizeHexColor("#abc")).toBe("#aabbcc");
  });

  it("keeps valid 6-digit hex as-is", () => {
    expect(normalizeHexColor("#ff0000")).toBe("#ff0000");
    expect(normalizeHexColor("#aabbcc")).toBe("#aabbcc");
  });

  it("accepts uppercase and lowercase", () => {
    expect(normalizeHexColor("#FF0000")).toBe("#FF0000");
    expect(normalizeHexColor("#ff0000")).toBe("#ff0000");
  });

  it("trims whitespace", () => {
    expect(normalizeHexColor("  #f00  ")).toBe("#ff0000");
  });
});

describe("hexToRgba", () => {
  it("converts hex to rgba with alpha", () => {
    expect(hexToRgba("#ff0000", 0.5)).toBe("rgba(255, 0, 0, 0.5)");
    expect(hexToRgba("#000000", 1)).toBe("rgba(0, 0, 0, 1)");
    expect(hexToRgba("#ffffff", 0)).toBe("rgba(255, 255, 255, 0)");
  });

  it("returns undefined for invalid hex", () => {
    expect(hexToRgba("invalid", 1)).toBeUndefined();
    expect(hexToRgba("", 1)).toBeUndefined();
  });
});

describe("getTagTextColor", () => {
  it("returns dark color for light background (high luminance)", () => {
    expect(getTagTextColor("#ffffff")).toBe("#111827");
    expect(getTagTextColor("#f8fafc")).toBe("#111827");
  });

  it("returns light color for dark background (low luminance)", () => {
    expect(getTagTextColor("#000000")).toBe("#F8FAFC");
    expect(getTagTextColor("#1a1a1a")).toBe("#F8FAFC");
  });

  it("returns undefined for invalid hex", () => {
    expect(getTagTextColor("")).toBeUndefined();
    expect(getTagTextColor(undefined)).toBeUndefined();
  });
});
