import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ALL_CARDS } from "../data/cards";
import { SPREADS } from "../data/spreads";
import { drawCards, seededRandom } from "../domain/deck";
import { buildShareUrl } from "../domain/reading/share";
import { App } from "./App";

afterEach(() => {
  window.location.hash = "";
});

describe("App", () => {
  it("renders a generated share link on the reading page", () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    const spread = SPREADS.find((item) => item.id === "thelema-triad");
    if (!spread) {
      throw new Error("Missing thelema-triad spread");
    }

    const url = buildShareUrl("https://example.com/tarot_reading/", {
      spread,
      drawn: drawCards(spread, { shadow: true }, ALL_CARDS, seededRandom(7)),
      question: "What should I notice?",
      shadow: true,
    });

    window.location.hash = new URL(url).hash;
    render(<App />);

    expect(screen.getByText("Shared reading")).toBeInTheDocument();
    expect(screen.getByText("3 of 3 cards revealed.")).toBeInTheDocument();
    expect(screen.queryByText(/the path turns back/i)).not.toBeInTheDocument();
  });

  it("loads a secondary route from its own chunk", async () => {
    window.location.hash = "#/journal";
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /readings you kept/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /draw a reading/i })).toBeInTheDocument();
  });
});
