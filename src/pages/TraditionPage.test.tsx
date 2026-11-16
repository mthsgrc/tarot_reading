import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TraditionPage } from "./TraditionPage";

describe("TraditionPage", () => {
  it("teaches Thelema, the Tree, and the Thelemic correction", () => {
    render(
      <MemoryRouter>
        <TraditionPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: /the map behind the cards/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /why the emperor is tzaddi/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /the tree of life/i })).toBeInTheDocument();
    expect(screen.getAllByText("Tzaddi").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/love is the law, love under will/i)).toBeInTheDocument();
  });
});
