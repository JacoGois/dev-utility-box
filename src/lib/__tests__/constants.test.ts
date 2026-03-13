import { describe, it, expect } from "vitest";
import { AUTH_TOKEN_KEY } from "../constants";

describe("constants", () => {
  it("AUTH_TOKEN_KEY is defined", () => {
    expect(AUTH_TOKEN_KEY).toBeDefined();
    expect(typeof AUTH_TOKEN_KEY).toBe("string");
    expect(AUTH_TOKEN_KEY).toBe("auth:token");
  });
});
