import { describe, expect, it } from "vitest";
import { ALL_CARDS } from "../data/cards";
import { SPREAD_BY_ID } from "../data/spreads";
import type { Spread } from "./types";
import {
  cardImageBase,
  cryptoRandom,
  drawCards,
  getCardById,
  seededRandom,
  shuffle,
} from "./deck";

function requireSpread(id: string): Spread {
  const spread = SPREAD_BY_ID.get(id);

  if (!spread) {
    throw new Error(`Missing test spread: ${id}`);
  }

  return spread;
}

describe("shuffle", () => {
  it("does not mutate its input", () => {
    const original = [...ALL_CARDS];
    shuffle(ALL_CARDS, seededRandom(7));

    expect(ALL_CARDS).toEqual(original);
  });

  it("keeps every card exactly once", () => {
    const shuffled = shuffle(ALL_CARDS, seededRandom(11));

    expect(shuffled).toHaveLength(ALL_CARDS.length);
    expect(shuffled.map((card) => card.id).sort()).toEqual(
      ALL_CARDS.map((card) => card.id).sort(),
    );
  });

  it("is deterministic when given the same seed", () => {
    const first = shuffle(ALL_CARDS, seededRandom(42)).map((card) => card.id);
    const second = shuffle(ALL_CARDS, seededRandom(42)).map((card) => card.id);

    expect(first).toEqual(second);
  });

  it("actually changes the order", () => {
    const shuffled = shuffle(ALL_CARDS, seededRandom(42)).map((card) => card.id);

    expect(shuffled).not.toEqual(ALL_CARDS.map((card) => card.id));
  });
});

describe("random sources", () => {
  it("produces crypto values in the half-open unit interval", () => {
    for (let index = 0; index < 100; index += 1) {
      const value = cryptoRandom();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("produces repeatable values from a seed", () => {
    const first = seededRandom(123);
    const second = seededRandom(123);

    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });
});

describe("drawCards", () => {
  it("draws one unique card per position in order", () => {
    const spread = requireSpread("tree-of-life");
    const drawn = drawCards(spread, {}, ALL_CARDS, seededRandom(9));

    expect(drawn).toHaveLength(10);
    expect(new Set(drawn.map((entry) => entry.card.id)).size).toBe(10);
    expect(drawn.map((entry) => entry.position.id)).toEqual(
      spread.positions.map((position) => position.id),
    );
    expect(drawn.every((entry) => entry.revealed === false)).toBe(true);
  });

  it("keeps every card upright when shadow mode is off", () => {
    const spread = requireSpread("thelema-triad");
    const drawn = drawCards(spread, { shadow: false }, ALL_CARDS, seededRandom(3));

    expect(drawn.every((entry) => entry.orientation === "upright")).toBe(true);
  });

  it("can draw every card in shadow orientation", () => {
    const spread = requireSpread("thelema-triad");
    const drawn = drawCards(spread, { shadow: true }, ALL_CARDS, () => 0);

    expect(drawn.every((entry) => entry.orientation === "shadow")).toBe(true);
  });

  it("rejects a spread that needs more cards than the deck contains", () => {
    const spread = requireSpread("tree-of-life");

    expect(() => drawCards(spread, {}, ALL_CARDS.slice(0, 3), seededRandom(1))).toThrow(
      /needs 10 cards but only 3 are available/,
    );
  });
});

describe("lookups", () => {
  it("finds cards by id", () => {
    expect(getCardById("major-00-fool")?.name).toBe("The Fool");
    expect(getCardById("disks-princess")?.name).toBe("Princess of Disks");
    expect(getCardById("not-a-card")).toBeUndefined();
  });

  it("builds stable image paths from card ids", () => {
    const card = getCardById("cups-ace");

    if (!card) {
      throw new Error("Missing test card.");
    }

    expect(cardImageBase(card)).toMatch(/images\/cards\/cups-ace$/);
  });
});
