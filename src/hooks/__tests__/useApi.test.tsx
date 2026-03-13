import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useApi } from "../useApi";

function TestComponent({
  requester,
  onState,
  requestArgs,
}: {
  requester: (...args: object[]) => Promise<{ data: unknown; status: number }>;
  onState?: (state: { loading: boolean; data: unknown; error: unknown }) => void;
  requestArgs?: object[];
}) {
  const api = useApi(requester);
  if (onState) {
    onState({ loading: api.loading, data: api.data, error: api.error });
  }
  return (
    <div>
      <span data-testid="loading">{String(api.loading)}</span>
      <span data-testid="data">{api.data ? JSON.stringify(api.data) : "null"}</span>
      <span data-testid="error">{api.error ? JSON.stringify(api.error) : "null"}</span>
      <span data-testid="status">{api.status ?? "null"}</span>
      <span data-testid="statusCode">{api.statusCode ?? "null"}</span>
      <button onClick={() => api.makeRequest(...(requestArgs ?? [])).catch(() => {})}>Request</button>
    </div>
  );
}

describe("useApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with loading false and data/error null", () => {
    const requester = vi.fn();
    render(<TestComponent requester={requester} />);
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("data")).toHaveTextContent("null");
    expect(screen.getByTestId("error")).toHaveTextContent("null");
  });

  it("sets loading true then false and data on successful request", async () => {
    const user = userEvent.setup();
    const response = { data: { id: 1, name: "test" }, status: 200 };
    const requester = vi.fn().mockResolvedValue(response);
    render(
      <TestComponent
        requester={requester}
        onState={() => {}}
      />
    );
    await user.click(screen.getByRole("button", { name: /request/i }));
    expect(requester).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("data")).toHaveTextContent(JSON.stringify(response.data));
    expect(screen.getByTestId("error")).toHaveTextContent("null");
  });

  it("sets error and clears it on next request when requester throws", async () => {
    const user = userEvent.setup();
    const errPayload = { response: { data: { status: "error", data: { message: "Failed" } }, status: 400 } };
    const requester = vi.fn().mockRejectedValue(errPayload);
    render(<TestComponent requester={requester} />);
    await user.click(screen.getByRole("button", { name: /request/i }));
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent(JSON.stringify({ message: "Failed" }));

    requester.mockResolvedValueOnce({ data: { ok: true }, status: 200 });
    await user.click(screen.getByRole("button", { name: /request/i }));
    expect(screen.getByTestId("error")).toHaveTextContent("null");
    expect(screen.getByTestId("data")).toHaveTextContent(JSON.stringify({ ok: true }));
  });

  it("re-throws when error has no response and does not set error state", async () => {
    const user = userEvent.setup();
    const requester = vi.fn().mockRejectedValue(new Error("network"));
    render(<TestComponent requester={requester} />);
    await user.click(screen.getByRole("button", { name: /request/i }));
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("error")).toHaveTextContent("null");
  });

  it("passes request arguments to requester", async () => {
    const user = userEvent.setup();
    const response = { data: { id: 1 }, status: 200 };
    const requester = vi.fn().mockResolvedValue(response);
    render(<TestComponent requester={requester} requestArgs={[{ id: "123" }, "get"]} />);
    await user.click(screen.getByRole("button", { name: /request/i }));
    expect(requester).toHaveBeenCalledWith({ id: "123" }, "get");
  });

  it("sets status and statusCode on successful response", async () => {
    const user = userEvent.setup();
    const response = { data: { status: "ok", meta: { page: 1 } }, status: 201 };
    const requester = vi.fn().mockResolvedValue(response);
    render(<TestComponent requester={requester} />);
    await user.click(screen.getByRole("button", { name: /request/i }));
    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("ok");
      expect(screen.getByTestId("statusCode")).toHaveTextContent("201");
    });
  });

  it("sets statusCode on error response", async () => {
    const user = userEvent.setup();
    const errPayload = {
      response: {
        data: { status: "error", data: { msg: "Bad request" } },
        status: 400,
      },
    };
    const requester = vi.fn().mockRejectedValue(errPayload);
    render(<TestComponent requester={requester} />);
    await user.click(screen.getByRole("button", { name: /request/i }));
    await waitFor(() => {
      expect(screen.getByTestId("statusCode")).toHaveTextContent("400");
    });
  });
});
