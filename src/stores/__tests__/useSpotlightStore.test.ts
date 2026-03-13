import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSpotlightStore } from "../useSpotlightStore";
import { createApps } from "@/lib/apps";

const t = (key: string) => key;
const apps = createApps(t);

describe("useSpotlightStore", () => {
  beforeEach(() => {
    useSpotlightStore.setState({
      isOpen: false,
      query: "",
      results: [],
      selectedIndex: -1,
    });
  });

  it("openSpotlight sets isOpen true and clears query/results", () => {
    const { openSpotlight } = useSpotlightStore.getState();
    useSpotlightStore.setState({ query: "x", results: [] });
    openSpotlight();
    expect(useSpotlightStore.getState().isOpen).toBe(true);
    expect(useSpotlightStore.getState().query).toBe("");
    expect(useSpotlightStore.getState().results).toEqual([]);
    expect(useSpotlightStore.getState().selectedIndex).toBe(-1);
  });

  it("closeSpotlight sets isOpen false", () => {
    const { openSpotlight, closeSpotlight } = useSpotlightStore.getState();
    openSpotlight();
    closeSpotlight();
    expect(useSpotlightStore.getState().isOpen).toBe(false);
  });

  it("setQuery updates query", () => {
    const { setQuery } = useSpotlightStore.getState();
    setQuery("pomo");
    expect(useSpotlightStore.getState().query).toBe("pomo");
  });

  it("performSearch with empty query clears results", () => {
    const openApp = vi.fn();
    const { performSearch } = useSpotlightStore.getState();
    const Icon = () => null;
    useSpotlightStore.setState({ results: [{ id: "Pomodoro", type: "app", name: "Pomodoro", icon: Icon, action: vi.fn() }] });
    performSearch("  ", openApp, apps);
    expect(useSpotlightStore.getState().results).toEqual([]);
    expect(useSpotlightStore.getState().selectedIndex).toBe(-1);
  });

  it("performSearch filters apps by name", () => {
    const openApp = vi.fn();
    const { performSearch } = useSpotlightStore.getState();
    performSearch("pomo", openApp, apps);
    const { results, selectedIndex } = useSpotlightStore.getState();
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name.toLowerCase().includes("pomo"))).toBe(true);
    expect(selectedIndex).toBe(0);
  });

  it("selectNext advances selectedIndex in cycle", () => {
    const Icon = () => null;
    useSpotlightStore.setState({
      results: [
        { id: "Pomodoro", type: "app", name: "Pomodoro", icon: Icon, action: vi.fn() },
        { id: "Todo", type: "app", name: "Todo", icon: Icon, action: vi.fn() },
      ],
      selectedIndex: 0,
    });
    const { selectNext } = useSpotlightStore.getState();
    selectNext();
    expect(useSpotlightStore.getState().selectedIndex).toBe(1);
    selectNext();
    expect(useSpotlightStore.getState().selectedIndex).toBe(0);
  });

  it("selectPrevious decrements selectedIndex in cycle", () => {
    const Icon = () => null;
    useSpotlightStore.setState({
      results: [
        { id: "Pomodoro", type: "app", name: "Pomodoro", icon: Icon, action: vi.fn() },
        { id: "Todo", type: "app", name: "Todo", icon: Icon, action: vi.fn() },
      ],
      selectedIndex: 1,
    });
    const { selectPrevious } = useSpotlightStore.getState();
    selectPrevious();
    expect(useSpotlightStore.getState().selectedIndex).toBe(0);
    selectPrevious();
    expect(useSpotlightStore.getState().selectedIndex).toBe(1);
  });

  it("executeSelected calls action of selected item", () => {
    const action = vi.fn();
    const Icon = () => null;
    useSpotlightStore.setState({
      results: [{ id: "Pomodoro", type: "app", name: "Pomodoro", icon: Icon, action }],
      selectedIndex: 0,
    });
    const { executeSelected } = useSpotlightStore.getState();
    executeSelected();
    expect(action).toHaveBeenCalledTimes(1);
  });
});
