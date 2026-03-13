import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ErrorBoundary from "../ErrorBoundary";

const ThrowError = () => {
  throw new Error("Test error");
};

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <span data-testid="child">Content ok</span>
      </ErrorBoundary>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Content ok")).toBeInTheDocument();
  });

  it("renders fallback when child throws", () => {
    render(
      <ErrorBoundary fallback={<div data-testid="fallback">Error caught</div>}>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.getByText("Error caught")).toBeInTheDocument();
  });

  it("renders default error UI when child throws and no fallback", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary appName="Pomodoro">
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Algo deu errado/)).toBeInTheDocument();
    expect(screen.getByText(/em Pomodoro/)).toBeInTheDocument();
    expect(screen.getByText(/recarregar/)).toBeInTheDocument();
    expect(screen.getByText(/Detalhes do Erro/)).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("includes appName in message when provided", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary appName="Kanban">
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/em Kanban/)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("does not include 'em' when appName is not provided", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Algo deu errado\./)).toBeInTheDocument();
    expect(screen.queryByText(/\sem\s/)).not.toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("renders children as-is when no error and no parentModalContainerRef", () => {
    const Child = () => <span data-testid="child">Child</span>;
    render(
      <ErrorBoundary>
        <Child />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Child")).toBeInTheDocument();
  });

  it("passes parentModalContainerRef to valid element children when provided", () => {
    const Child = (props: { parentModalContainerRef?: React.RefObject<HTMLDivElement | null> }) => (
      <span data-testid="child" data-has-ref={String(!!props.parentModalContainerRef)}>Child</span>
    );
    const ref = { current: document.createElement("div") };
    render(
      <ErrorBoundary parentModalContainerRef={ref}>
        <Child />
      </ErrorBoundary>
    );
    expect(screen.getByTestId("child")).toHaveAttribute("data-has-ref", "true");
  });
});
