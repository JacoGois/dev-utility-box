import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AppIcon from "../AppIcon";
import { FileText } from "lucide-react";

const mockOpenApp = vi.fn();
const mockRemoveFromDesktop = vi.fn();

vi.mock("@/stores/useWindowStore", () => ({
  useWindowStore: () => ({ openApp: mockOpenApp }),
}));
vi.mock("@/stores/useDockStore", () => ({
  useDockStore: () => ({ removeFromDesktop: mockRemoveFromDesktop }),
}));
vi.mock("@/hooks/useTranslations", () => ({
  useDesktopTranslations: () => (key: string) => key,
  useGlobalErrorTranslations: () => (key: string) => key,
}));

describe("AppIcon", () => {
  const defaultProps = {
    appKey: "Todo" as const,
    app: {
      shortName: "Todo",
      icon: FileText,
      maxInstances: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders app short name and icon", () => {
    render(<AppIcon {...defaultProps} />);
    expect(screen.getByText("Todo")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls openApp when the button is clicked", async () => {
    const user = userEvent.setup();
    render(<AppIcon {...defaultProps} />);
    await user.click(screen.getByRole("button"));
    expect(mockOpenApp).toHaveBeenCalledWith("Todo", 1, expect.any(Function));
  });

  it("calls openApp with maxInstances from app config", async () => {
    const user = userEvent.setup();
    render(
      <AppIcon
        appKey="Kanban"
        app={{ shortName: "Kanban", icon: FileText, maxInstances: 3 }}
      />
    );
    await user.click(screen.getByRole("button"));
    expect(mockOpenApp).toHaveBeenCalledWith("Kanban", 3, expect.any(Function));
  });

  it("shows context menu with Open and Remove from desktop", async () => {
    const user = userEvent.setup();
    render(<AppIcon {...defaultProps} />);
    await user.pointer({ keys: "[MouseRight]", target: screen.getByRole("button") });
    expect(screen.getByRole("menuitem", { name: /open/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /removeFromDesktop/i })).toBeInTheDocument();
  });

  it("calls removeFromDesktop when context menu item is clicked", async () => {
    const user = userEvent.setup();
    render(<AppIcon {...defaultProps} />);
    await user.pointer({ keys: "[MouseRight]", target: screen.getByRole("button") });
    await user.click(screen.getByRole("menuitem", { name: /removeFromDesktop/i }));
    expect(mockRemoveFromDesktop).toHaveBeenCalledWith("Todo");
  });

  it("calls openApp when Open context menu item is clicked", async () => {
    const user = userEvent.setup();
    render(<AppIcon {...defaultProps} />);
    await user.pointer({ keys: "[MouseRight]", target: screen.getByRole("button") });
    await user.click(screen.getByRole("menuitem", { name: /open/i }));
    expect(mockOpenApp).toHaveBeenCalledWith("Todo", 1, expect.any(Function));
  });

  it("truncates long shortName to 10 characters", () => {
    render(
      <AppIcon
        appKey="Todo"
        app={{ shortName: "VeryLongAppName", icon: FileText, maxInstances: 1 }}
      />
    );
    expect(screen.queryByText("VeryLongAppName")).not.toBeInTheDocument();
    expect(screen.getByText(/VeryLon\.\.\./)).toBeInTheDocument();
  });
});
