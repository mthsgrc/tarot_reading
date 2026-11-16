import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CardPage } from "./CardPage";

function renderCardPage(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/cards/:cardId" element={<CardPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CardPage", () => {
  it("renders a major card with its correspondences", () => {
    renderCardPage("/cards/major-00-fool");

    expect(
      screen.getByRole("heading", { level: 1, name: "The Fool" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Aleph/)).toBeInTheDocument();
    expect(screen.getByText(/11 · Kether → Chokmah/)).toBeInTheDocument();
    expect(screen.getByText(/The Spirit of the Aether/)).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /the fool from the thoth tarot/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /next/i })).toBeInTheDocument();
  });

  it("renders a minor card with its Sephira and decan", () => {
    renderCardPage("/cards/wands-two");

    expect(
      screen.getByRole("heading", { level: 1, name: "Two of Wands" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Chokmah — Wisdom/)).toBeInTheDocument();
    expect(screen.getByText("Mars in Aries")).toBeInTheDocument();
    expect(screen.getByText(/Lord of Dominion/)).toBeInTheDocument();
  });

  it("renders a court card with its sub-element", () => {
    renderCardPage("/cards/cups-queen");

    expect(
      screen.getByRole("heading", { level: 1, name: "Queen of Cups" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Watery part of Water/)).toBeInTheDocument();
    expect(screen.getByText(/21° Gemini – 20° Cancer/)).toBeInTheDocument();
  });

  it("handles an unknown card id", () => {
    renderCardPage("/cards/not-a-card");

    expect(
      screen.getByRole("heading", { level: 1, name: /not in the deck/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /browse the 78 cards/i }),
    ).toBeInTheDocument();
  });
});
