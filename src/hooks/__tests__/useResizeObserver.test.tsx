import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useContainerSize } from "../useResizeObserver";

describe("useContainerSize (useResizeObserver)", () => {
  let observe: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;
  let captureCallback: (entries: Array<{ contentRect: { width: number; height: number } }>) => void = () => {};

  beforeEach(() => {
    observe = vi.fn();
    disconnect = vi.fn();

    vi.stubGlobal(
      "ResizeObserver",
      class MockResizeObserver {
        constructor(cb: (entries: Array<{ contentRect: { width: number; height: number } }>) => void) {
          captureCallback = cb;
        }
        observe = observe;
        disconnect = disconnect;
      }
    );
  });

  it("returns ref and initial size 0x0", () => {
    function TestComponent() {
      const { ref, width, height } = useContainerSize();
      return (
        <div ref={ref} data-testid="container">
          {width}x{height}
        </div>
      );
    }
    render(<TestComponent />);
    expect(screen.getByTestId("container")).toBeInTheDocument();
    expect(screen.getByText("0x0")).toBeInTheDocument();
  });

  it("updates size when ResizeObserver callback runs", () => {
    function TestComponent() {
      const { ref, width, height } = useContainerSize();
      return (
        <div ref={ref} data-testid="container">
          {width}x{height}
        </div>
      );
    }
    render(<TestComponent />);
    expect(screen.getByText("0x0")).toBeInTheDocument();

    const entries = [{ contentRect: { width: 320, height: 240 } }];
    act(() => {
      captureCallback(entries);
    });

    expect(screen.getByText("320x240")).toBeInTheDocument();
  });

  it("observes the element attached to ref", () => {
    function TestComponent() {
      const { ref } = useContainerSize();
      return <div ref={ref} data-testid="container" />;
    }
    render(<TestComponent />);
    const el = screen.getByTestId("container");
    expect(observe).toHaveBeenCalledWith(el);
  });

  it("calls disconnect on unmount", () => {
    function TestComponent() {
      const { ref } = useContainerSize();
      return <div ref={ref} data-testid="container" />;
    }
    const { unmount } = render(<TestComponent />);
    expect(disconnect).not.toHaveBeenCalled();
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
