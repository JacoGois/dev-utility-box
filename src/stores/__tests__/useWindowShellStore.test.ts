import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { useWindowShellStore } from "../useWindowShellStore";

describe("useWindowShellStore", () => {
  beforeEach(() => {
    useWindowShellStore.setState({ refs: {} });
  });

  it("initial state has empty refs", () => {
    expect(useWindowShellStore.getState().refs).toEqual({});
  });

  it("setShellRef registers ref by id", () => {
    const { setShellRef } = useWindowShellStore.getState();
    const ref = React.createRef<HTMLDivElement | null>();
    setShellRef("win-1", ref);
    expect(useWindowShellStore.getState().refs["win-1"]).toBe(ref);
  });

  it("setShellRef with null overwrites ref", () => {
    const { setShellRef } = useWindowShellStore.getState();
    const ref = React.createRef<HTMLDivElement | null>();
    setShellRef("win-1", ref);
    setShellRef("win-1", null);
    expect(useWindowShellStore.getState().refs["win-1"]).toBeNull();
  });

  it("multiple ids keep refs independent", () => {
    const { setShellRef } = useWindowShellStore.getState();
    const ref1 = React.createRef<HTMLDivElement | null>();
    const ref2 = React.createRef<HTMLDivElement | null>();
    setShellRef("win-1", ref1);
    setShellRef("win-2", ref2);
    expect(useWindowShellStore.getState().refs["win-1"]).toBe(ref1);
    expect(useWindowShellStore.getState().refs["win-2"]).toBe(ref2);
  });
});
