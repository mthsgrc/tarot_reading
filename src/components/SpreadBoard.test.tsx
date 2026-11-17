import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ALL_CARDS } from "../data/cards";
import { SPREAD_BY_ID } from "../data/spreads";
import { drawCards, seededRandom } from "../domain/deck";
import { SpreadBoard } from "./SpreadBoard";

function renderBoard(spreadId: string) {
  const spread = SPREAD_BY_ID.get(spreadId);

  if (!spread) {
    throw new Error(`Missing test spread: ${spreadId}`);
  }

  const drawn = drawCards(spread, {}, ALL_CARDS, seededRandom(5));
  const { container } = render(
    <SpreadBoard spread={spread} drawn={drawn} onReveal={() => {}} onOpen={() => {}} />,
  );

  return [...container.querySelectorAll<HTMLElement>("div[title]")];
}

describe("SpreadBoard", () => {
  it("exposes the spread as a named region with a heading", () => {
    renderBoard("thelema-triad");

    expect(
      screen.getByRole("region", { name: /thelema triad spread/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /thelema triad spread/i }),
    ).toBeInTheDocument();
  });

  it("auto-places row spreads instead of naming grid areas", () => {
    const positions = renderBoard("thelema-triad");

    expect(positions).toHaveLength(3);

    for (const position of positions) {
      expect(position.style.getPropertyValue("--grid-area")).toBe("");
    }
  });

  it("names the grid area for diagram spreads", () => {
    const positions = renderBoard("thelemic-cross");

    expect(
      positions.map((position) => position.style.getPropertyValue("--grid-area")),
    ).toEqual(["crown", "abyss", "root", "star", "aeon"]);
  });
});
