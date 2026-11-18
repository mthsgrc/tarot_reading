import { describe, expect, it } from "vitest";
import { ALL_CARDS, CARD_BY_ID } from "../../data/cards";
import { SPREADS, SPREAD_BY_ID } from "../../data/spreads";
import type { DrawnCard, Orientation, Spread, TarotCard } from "../types";
import { formatReading } from "./format";
import { buildFacts } from "./facts";
import { interpretReading } from "./interpret";
import type { ReadingInput } from "./types";

function card(id: string): TarotCard {
  const found = CARD_BY_ID.get(id);
  if (!found) throw new Error(`Unknown card: ${id}`);
  return found;
}

function spread(id: string): Spread {
  const found = SPREAD_BY_ID.get(id);
  if (!found) throw new Error(`Unknown spread: ${id}`);
  return found;
}

function drawFor(
  spreadId: string,
  cardIds: readonly string[],
  orientations: readonly Orientation[] = [],
): { spread: Spread; drawn: DrawnCard[] } {
  const selected = spread(spreadId);

  if (cardIds.length !== selected.positions.length) {
    throw new Error(
      `${spreadId} needs ${selected.positions.length} cards, got ${cardIds.length}`,
    );
  }

  return {
    spread: selected,
    drawn: selected.positions.map((position, index) => ({
      card: card(cardIds[index]!),
      position,
      orientation: orientations[index] ?? "upright",
      revealed: true,
    })),
  };
}

function inputFor(
  spreadId: string,
  cardIds: readonly string[],
  options: {
    orientations?: readonly Orientation[];
    question?: string;
    lens?: ReadingInput["lens"];
    depth?: ReadingInput["depth"];
  } = {},
): ReadingInput {
  const { drawn } = drawFor(spreadId, cardIds, options.orientations);
  return {
    spread: spread(spreadId),
    drawn,
    question: options.question,
    lens: options.lens,
    depth: options.depth,
  };
}

const THELEMA_EXAMPLE = ["major-00-fool", "cups-two", "major-17-star"];

describe("reading facts", () => {
  it("counts the worked Thelema Triad example", () => {
    const { drawn } = drawFor("thelema-triad", THELEMA_EXAMPLE);
    const facts = buildFacts({ drawn });

    expect(facts.total).toBe(3);
    expect(facts.elements).toEqual({ Fire: 0, Water: 1, Air: 2, Earth: 0 });
    expect(facts.suits).toEqual({ Wands: 0, Cups: 1, Swords: 0, Disks: 0 });
    expect(facts.kinds).toEqual({ major: 2, minor: 1, court: 0 });
    expect(facts.orientations).toEqual({ upright: 3, shadow: 0 });
    expect(facts.dominantElement).toBe("Air");
    expect(facts.missingElements).toEqual([]);
    expect(facts.majorRatio).toBeCloseTo(2 / 3);
  });

  it("finds Chokmah as the shared station", () => {
    const { drawn } = drawFor("thelema-triad", THELEMA_EXAMPLE);
    const facts = buildFacts({ drawn });
    const chokmah = facts.sephiraTouches.find((touch) => touch.sephira === "chokmah");

    expect(chokmah?.cards).toHaveLength(3);
    expect(chokmah?.cards.map((drawnCard) => drawnCard.card.name)).toEqual([
      "The Fool",
      "Two of Cups",
      "The Star",
    ]);
  });

  it("infers a lens from the question and lets an explicit lens win", () => {
    const { drawn } = drawFor("thelema-triad", THELEMA_EXAMPLE);

    expect(buildFacts({ drawn, question: "What does my career need?" }).lens).toBe(
      "work",
    );
    expect(buildFacts({ drawn, question: "What is moving in love?" }).lens).toBe("love");
    expect(
      buildFacts({ drawn, question: "What does my career need?", lens: "inner" }).lens,
    ).toBe("inner");
  });

  it("does not mistake the auxiliary verb will for the inner lens", () => {
    const { drawn } = drawFor("thelema-triad", THELEMA_EXAMPLE);

    expect(buildFacts({ drawn, question: "Will they come back?" }).lens).toBe("general");
    expect(buildFacts({ drawn, question: "Will my friends come back?" }).lens).toBe(
      "love",
    );
    expect(buildFacts({ drawn, question: "What is my True Will?" }).lens).toBe("inner");
    expect(buildFacts({ drawn, question: "What is my will asking of me?" }).lens).toBe(
      "inner",
    );
    expect(buildFacts({ drawn, question: "How do I approach my inner work?" }).lens).toBe(
      "inner",
    );
  });

  it("matches plural keywords against the singular lens table", () => {
    const { drawn } = drawFor("thelema-triad", THELEMA_EXAMPLE);

    expect(buildFacts({ drawn, question: "What do my relationships need?" }).lens).toBe(
      "love",
    );
    expect(buildFacts({ drawn, question: "Which projects should I finish?" }).lens).toBe(
      "work",
    );
    expect(buildFacts({ drawn, question: "How do my studies fit?" }).lens).toBe("work");
  });

  it("detects a minor sitting in its own Sephira and a major touching its path", () => {
    const { drawn } = drawFor("tree-of-life", [
      "major-00-fool",
      "cups-two",
      "major-02-priestess",
      "major-03-empress",
      "major-04-emperor",
      "major-06-lovers",
      "major-09-hermit",
      "major-10-fortune",
      "major-13-death",
      "major-21-universe",
    ]);
    const facts = buildFacts({ drawn });

    expect(facts.resonances).toContainEqual(
      expect.objectContaining({
        kind: "sephira-match",
        stationId: "chokmah",
      }),
    );
    expect(facts.resonances).toContainEqual(
      expect.objectContaining({
        kind: "path-touch",
        stationId: "kether",
      }),
    );
  });

  it("detects a planetary resonance in the Great Work", () => {
    const { drawn } = drawFor("great-work-hexagram", [
      "major-19-sun",
      "major-18-moon",
      "major-01-magus",
      "major-03-empress",
      "major-16-tower",
      "major-10-fortune",
      "major-21-universe",
    ]);
    const facts = buildFacts({ drawn });

    expect(facts.resonances).toContainEqual(
      expect.objectContaining({
        kind: "planet-match",
        stationId: "mercury",
      }),
    );
  });

  it("groups repeated numbers and a shadow cluster", () => {
    const { drawn } = drawFor(
      "thelemic-cross",
      ["wands-five", "swords-five", "major-00-fool", "cups-two", "major-17-star"],
      ["upright", "shadow", "shadow", "upright", "upright"],
    );
    const facts = buildFacts({ drawn });

    expect(facts.repeatedNumbers).toHaveLength(1);
    expect(facts.repeatedNumbers[0]?.rank).toBe("Five");
    expect(facts.shadows).toHaveLength(2);
    expect(facts.shadowRatio).toBeCloseTo(2 / 5);
  });
});

describe("reading interpretation", () => {
  it("builds the worked Thelema Triad reading", () => {
    const input = inputFor("thelema-triad", THELEMA_EXAMPLE, {
      question: "What is my True Will?",
    });
    const result = interpretReading(input);

    expect(result.headline).toMatch(/Air and Water/);
    expect(result.headline).toMatch(/Chokmah/);
    expect(result.overview.join(" ")).toMatch(/2 majors/);
    expect(result.notices.some((notice) => /Chokmah/.test(notice.title))).toBe(true);
    expect(result.positions).toHaveLength(3);
    expect(result.movement.join(" ")).toMatch(/Gnosis/);
    expect(result.action.length).toBeGreaterThan(20);
    expect(result.working.sephiraTouches[0]?.sephira).toBe("chokmah");
  });

  it("honours an explicit lens and depth", () => {
    const input = inputFor("thelema-triad", THELEMA_EXAMPLE, {
      question: "What does my career need?",
      lens: "work",
      depth: "brief",
    });
    const result = interpretReading(input);

    expect(result.working.lens).toBe("work");
    expect(result.working.lensSource).toBe("explicit");
    expect(result.depth).toBe("brief");
  });

  it("surfaces more patterns at deeper settings", () => {
    const base = inputFor("tree-of-life", [
      "major-00-fool",
      "cups-two",
      "major-02-priestess",
      "major-03-empress",
      "major-04-emperor",
      "major-06-lovers",
      "major-09-hermit",
      "major-10-fortune",
      "major-13-death",
      "major-21-universe",
    ]);
    const brief = interpretReading({ ...base, depth: "brief" });
    const standard = interpretReading({ ...base, depth: "standard" });
    const deep = interpretReading({ ...base, depth: "deep" });

    expect(brief.notices.length).toBeLessThan(standard.notices.length);
    expect(deep.notices.length).toBeGreaterThan(standard.notices.length);
  });

  it("is deterministic for the same draw and question", () => {
    const input = inputFor("tree-of-life", [
      "major-00-fool",
      "cups-two",
      "major-02-priestess",
      "major-03-empress",
      "major-04-emperor",
      "major-06-lovers",
      "major-09-hermit",
      "major-10-fortune",
      "major-13-death",
      "major-21-universe",
    ]);

    expect(interpretReading(input)).toEqual(interpretReading(input));
  });

  it("uses the Lovers guardrail for the Other position", () => {
    const input = inputFor("lovers-cross", [
      "cups-two",
      "swords-five",
      "major-06-lovers",
      "major-15-devil",
      "major-17-star",
    ]);
    const result = interpretReading(input);
    const other = result.positions.find(
      (position) => position.drawn.position.id === "other",
    );

    expect(other?.body).toMatch(/not a claim about another person's private thoughts/i);
    expect(result.movement.join(" ")).toMatch(/private mind/i);
  });

  it.each(SPREADS.map((spread) => [spread.id, spread] as const))(
    "produces a complete interpretation for %s",
    (_spreadId, selectedSpread) => {
      const drawn = selectedSpread.positions.map((position, index) => ({
        card: ALL_CARDS[(index + selectedSpread.positions.length) % ALL_CARDS.length]!,
        position,
        orientation: (index % 3 === 0 ? "shadow" : "upright") as Orientation,
        revealed: true,
      }));
      const result = interpretReading({
        spread: selectedSpread,
        drawn,
        question: "What should I notice about this situation?",
      });
      const allText = [
        result.headline,
        ...result.overview,
        ...result.notices.map((notice) => `${notice.title} ${notice.body}`),
        ...result.positions.map((position) => position.body),
        ...result.movement,
        result.action,
      ].join(" ");

      expect(result.headline.length).toBeGreaterThan(0);
      expect(result.overview.length).toBeGreaterThan(0);
      expect(result.notices.length).toBeGreaterThan(0);
      expect(result.positions).toHaveLength(selectedSpread.positions.length);
      expect(result.movement.length).toBeGreaterThan(0);
      expect(result.action.length).toBeGreaterThan(0);
      expect(allText).not.toMatch(/undefined|NaN|\[object Object\]/);
    },
  );

  it("never leaves a card's paragraph unresolved", () => {
    const basePosition = spread("thelema-triad").positions[0]!;
    const singleCardSpread: Spread = {
      id: "card-smoke",
      name: "Single card",
      subtitle: "Smoke test",
      description: "",
      layout: "row",
      positions: [basePosition],
    };

    for (const drawnCard of ALL_CARDS) {
      for (const orientation of ["upright", "shadow"] as const) {
        const result = interpretReading({
          spread: singleCardSpread,
          drawn: [
            {
              card: drawnCard,
              position: basePosition,
              orientation,
              revealed: true,
            },
          ],
        });

        expect(result.positions[0]?.body).toContain(drawnCard.name);
        expect(result.positions[0]?.body).not.toMatch(/undefined|NaN/);
        expect(result.action.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("reading formatting", () => {
  it("exports the full reading as plain text", () => {
    const input = inputFor("thelema-triad", THELEMA_EXAMPLE, {
      question: "What is my True Will?",
    });
    const result = interpretReading(input);
    const text = formatReading(result, input);

    expect(text).toContain("Thoth Tarot — Thelema Triad");
    expect(text).toContain("Question: What is my True Will?");
    expect(text).toContain("Lens: Inner work");
    expect(text).toContain("Depth: Standard");
    expect(text).toContain(result.headline);
    expect(text).toContain("What stands out");
    expect(text).toContain("The cards in their positions");
    expect(text).toContain("How the spread moves");
    expect(text).toContain("How this reading was built");
    expect(text).toContain("Shared Sephira: Chokmah");
    expect(text).toContain("One action");
    expect(text).toContain(result.action);
    expect(text).toContain("A reading for reflection, not prediction.");
  });

  it("keeps a brief export short", () => {
    const input = inputFor("thelema-triad", THELEMA_EXAMPLE, {
      question: "What is my True Will?",
      depth: "brief",
    });
    const result = interpretReading(input);
    const text = formatReading(result, input);

    expect(text).toContain("Depth: Brief");
    expect(text).toContain("What stands out");
    expect(text).toContain("One action");
    expect(text).not.toContain("The cards in their positions");
    expect(text).not.toContain("How the spread moves");
  });
});
