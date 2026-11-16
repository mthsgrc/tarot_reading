import { describe, expect, it } from "vitest";
import { getCardById } from "../domain/deck";
import { cardTypeLabel } from "./cardLabels";

describe("card labels", () => {
  it("labels majors, minors, and court cards distinctly", () => {
    const fool = getCardById("major-00-fool");
    const ace = getCardById("wands-ace");
    const queen = getCardById("cups-queen");

    if (!fool || !ace || !queen) {
      throw new Error("Missing test cards.");
    }

    expect(cardTypeLabel(fool)).toBe("Major Arcana · Atu 0");
    expect(cardTypeLabel(ace)).toBe("Wands · Ace");
    expect(cardTypeLabel(queen)).toBe("Court card · Cups");
  });
});
