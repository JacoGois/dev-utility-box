import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "../Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click here</Button>);
    expect(screen.getByRole("button", { name: /click here/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Ok</Button>);
    await user.click(screen.getByRole("button", { name: /ok/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Ok
      </Button>
    );
    await user.click(screen.getByRole("button", { name: /ok/i }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies variant and size via className", () => {
    render(
      <Button variant="destructive" size="sm">
        Delete
      </Button>
    );
    const btn = screen.getByRole("button", { name: /delete/i });
    expect(btn).toHaveClass("bg-destructive");
  });
});
