import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RouteErrorBoundary, RouteFallback } from "./RouteStates";

function BrokenRoute(): never {
  throw new Error("Chunk failed to load");
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("route states", () => {
  it("announces a loading route", () => {
    render(<RouteFallback />);

    expect(screen.getByRole("status")).toHaveTextContent(/loading/i);
  });

  it("offers a reload and a way back when a route throws", async () => {
    const user = userEvent.setup();
    const reload = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <MemoryRouter>
        <RouteErrorBoundary reload={reload}>
          <BrokenRoute />
        </RouteErrorBoundary>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /this page did not load/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /return to the reading/i })).toHaveAttribute(
      "href",
      "/",
    );

    await user.click(screen.getByRole("button", { name: /reload the app/i }));

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
