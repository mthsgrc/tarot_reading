import { describe, expect, it } from "vitest";
import { SEPHIROTH } from "../domain/tree";
import { DEFAULT_SPREAD, SPREADS, SPREAD_BY_ID } from "./spreads";

describe("spreads", () => {
  it("defines the six approved spreads with unique ids", () => {
    expect(SPREADS).toHaveLength(6);
    expect(new Set(SPREADS.map((spread) => spread.id)).size).toBe(6);
    expect(SPREAD_BY_ID.size).toBe(6);
  });

  it("starts with the Thelema Triad as the default", () => {
    expect(DEFAULT_SPREAD.id).toBe("thelema-triad");
    expect(DEFAULT_SPREAD.positions).toHaveLength(3);
  });

  it("gives every spread positions with labels and guidance", () => {
    for (const spread of SPREADS) {
      expect(spread.name.length).toBeGreaterThan(3);
      expect(spread.description.length).toBeGreaterThan(40);
      expect(spread.positions.length).toBeGreaterThanOrEqual(3);
      expect(new Set(spread.positions.map((position) => position.id)).size).toBe(
        spread.positions.length,
      );

      for (const position of spread.positions) {
        expect(position.label.length).toBeGreaterThan(1);
        expect(position.hint.length).toBeGreaterThan(20);
      }
    }
  });

  it("maps the Tree of Life spread to the ten Sephiroth in order", () => {
    const treeSpread = SPREAD_BY_ID.get("tree-of-life");

    expect(treeSpread).toBeDefined();
    expect(treeSpread?.layout).toBe("tree");
    expect(treeSpread?.positions.map((position) => position.id)).toEqual(
      SEPHIROTH.map((sephira) => sephira.id),
    );
  });

  it("uses the expected layouts and card counts", () => {
    const expected = {
      "thelema-triad": { layout: "row", count: 3 },
      "past-present-future": { layout: "row", count: 3 },
      "thelemic-cross": { layout: "cross", count: 5 },
      "tree-of-life": { layout: "tree", count: 10 },
      "great-work-hexagram": { layout: "hexagram", count: 7 },
      "lovers-cross": { layout: "lovers", count: 5 },
    } as const;

    for (const [id, expectation] of Object.entries(expected)) {
      const spread = SPREAD_BY_ID.get(id);

      expect(spread?.layout).toBe(expectation.layout);
      expect(spread?.positions).toHaveLength(expectation.count);
    }
  });
});
