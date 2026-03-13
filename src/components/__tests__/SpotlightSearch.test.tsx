import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SpotlightSearch } from "../SpotlightSearch";
import { useSpotlightStore } from "@/stores/useSpotlightStore";
import { useWindowStore } from "@/stores/useWindowStore";

vi.mock("@/hooks/useTranslations", () => ({
  useDesktopTranslations: () => (key: string) => key,
}));

describe("SpotlightSearch", () => {
  beforeEach(() => {
    useSpotlightStore.setState({
      isOpen: false,
      query: "",
      results: [],
      selectedIndex: -1,
    });
    useWindowStore.setState({
      openApps: [],
      focusStack: [],
      minimizedApps: [],
      maximizedApps: [],
      positions: {},
      sizes: {},
    });
  });

  it("renders nothing when spotlight is closed", () => {
    render(<SpotlightSearch />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog with input when spotlight is open", () => {
    useSpotlightStore.getState().openSpotlight();
    render(<SpotlightSearch />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("spotlight.placeholder")).toBeInTheDocument();
  });

  it("updates query and runs search when user types", async () => {
    const user = userEvent.setup();
    useSpotlightStore.getState().openSpotlight();
    render(<SpotlightSearch />);
    const input = screen.getByPlaceholderText("spotlight.placeholder");
    await user.type(input, "Todo");
    expect(useSpotlightStore.getState().query).toBe("Todo");
  });

  it("shows results when query matches an app name", async () => {
    const user = userEvent.setup();
    useSpotlightStore.getState().openSpotlight();
    render(<SpotlightSearch />);
    const input = screen.getByPlaceholderText("spotlight.placeholder");
    await user.type(input, "todo");
    expect(useSpotlightStore.getState().results.length).toBeGreaterThan(0);
    const resultNames = useSpotlightStore.getState().results.map((r) => r.name);
    const firstResult = resultNames[0];
    expect(screen.getByText(firstResult)).toBeInTheDocument();
  });

  it("closes spotlight on Escape", async () => {
    const user = userEvent.setup();
    useSpotlightStore.getState().openSpotlight();
    render(<SpotlightSearch />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(useSpotlightStore.getState().isOpen).toBe(false);
  });

  it("shows noResults message when query has no matches", async () => {
    const user = userEvent.setup();
    useSpotlightStore.getState().openSpotlight();
    render(<SpotlightSearch />);
    const input = screen.getByPlaceholderText("spotlight.placeholder");
    await user.type(input, "xyznonexistent123");
    expect(screen.getByText("spotlight.noResults")).toBeInTheDocument();
  });

  it("empty query clears results", async () => {
    const user = userEvent.setup();
    useSpotlightStore.getState().openSpotlight();
    render(<SpotlightSearch />);
    const input = screen.getByPlaceholderText("spotlight.placeholder");
    await user.type(input, "todo");
    expect(useSpotlightStore.getState().results.length).toBeGreaterThan(0);
    await user.clear(input);
    expect(useSpotlightStore.getState().results).toEqual([]);
  });

  it("ArrowDown updates selectedIndex when results exist", async () => {
    const user = userEvent.setup();
    useSpotlightStore.getState().openSpotlight();
    render(<SpotlightSearch />);
    const input = screen.getByPlaceholderText("spotlight.placeholder");
    await user.type(input, "todo");
    await user.keyboard("{ArrowDown}");
    const { selectedIndex, results } = useSpotlightStore.getState();
    expect(results.length).toBeGreaterThan(0);
    expect(selectedIndex).toBeGreaterThanOrEqual(0);
    expect(selectedIndex).toBeLessThan(results.length);
  });

  it("ArrowUp changes selectedIndex when results exist", async () => {
    const user = userEvent.setup();
    useSpotlightStore.getState().openSpotlight();
    render(<SpotlightSearch />);
    const input = screen.getByPlaceholderText("spotlight.placeholder");
    await user.type(input, "todo");
    await user.keyboard("{ArrowDown}");
    const afterDown = useSpotlightStore.getState().selectedIndex;
    await user.keyboard("{ArrowUp}");
    const afterUp = useSpotlightStore.getState().selectedIndex;
    const len = useSpotlightStore.getState().results.length;
    expect(len).toBeGreaterThan(0);
    if (afterDown <= 0) expect(afterUp).toBe(len - 1);
    else expect(afterUp).toBe(afterDown - 1);
  });

  it("Escape closes spotlight even when results are empty", async () => {
    const user = userEvent.setup();
    useSpotlightStore.getState().openSpotlight();
    render(<SpotlightSearch />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(useSpotlightStore.getState().isOpen).toBe(false);
  });
});
