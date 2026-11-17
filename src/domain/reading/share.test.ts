import { describe, expect, it } from "vitest";
import { ALL_CARDS } from "../../data/cards";
import { SPREADS } from "../../data/spreads";
import { drawCards, seededRandom } from "../deck";
import {
  MAX_QUESTION_LENGTH,
  buildShareParams,
  buildShareUrl,
  hasShareParams,
  readSharedReading,
} from "./share";

function drawFor(spreadId: string, shadow = true) {
  const spread = SPREADS.find((item) => item.id === spreadId);
  if (!spread) {
    throw new Error(`Unknown spread ${spreadId}`);
  }

  return {
    spread,
    drawn: drawCards(spread, { shadow }, ALL_CARDS, seededRandom(7)),
  };
}

function validParams() {
  const { spread, drawn } = drawFor("thelema-triad");
  return buildShareParams({
    spread,
    drawn,
    question: "What should I notice?",
    shadow: true,
  });
}

describe("reading share links", () => {
  it("round-trips every spread", () => {
    for (const spread of SPREADS) {
      const drawn = drawCards(spread, { shadow: true }, ALL_CARDS, seededRandom(7));
      const params = buildShareParams({
        spread,
        drawn,
        question: "What is actually being asked?",
        shadow: true,
      });
      const shared = readSharedReading(params);

      expect(shared, spread.id).not.toBeNull();
      expect(shared?.spread.id).toBe(spread.id);
      expect(shared?.question).toBe("What is actually being asked?");
      expect(shared?.shadow).toBe(true);
      expect(
        shared?.drawn.map((item) => [item.card.id, item.orientation, item.position.id]),
      ).toEqual(drawn.map((item) => [item.card.id, item.orientation, item.position.id]));
      expect(shared?.drawn.every((item) => item.revealed)).toBe(true);
    }
  });

  it("round-trips a question with punctuation and non-ASCII characters", () => {
    const { spread, drawn } = drawFor("thelema-triad");
    const question = 'What does "success" mean — & why #now? 🌙';

    const shared = readSharedReading(
      buildShareParams({ spread, drawn, question, shadow: false }),
    );

    expect(shared?.question).toBe(question);
  });

  it("keeps an overlong question within the shared limit", () => {
    const { spread, drawn } = drawFor("thelema-triad");
    const params = buildShareParams({
      spread,
      drawn,
      question: `  ${"x".repeat(MAX_QUESTION_LENGTH + 50)}  `,
      shadow: false,
    });

    expect(params.get("q")).toHaveLength(MAX_QUESTION_LENGTH);
    expect(readSharedReading(params)).not.toBeNull();
  });

  it("round-trips an explicit lens and depth", () => {
    const { spread, drawn } = drawFor("thelema-triad");
    const shared = readSharedReading(
      buildShareParams({
        spread,
        drawn,
        question: "What does my career need?",
        shadow: false,
        lens: "work",
        depth: "deep",
      }),
    );

    expect(shared?.lens).toBe("work");
    expect(shared?.depth).toBe("deep");
  });

  it("keeps an explicit general lens and defaults legacy links", () => {
    const { spread, drawn } = drawFor("thelema-triad");
    const explicit = buildShareParams({
      spread,
      drawn,
      question: "What should I notice?",
      shadow: false,
      lens: "general",
      depth: "standard",
    });

    expect(explicit.get("lens")).toBe("general");
    expect(explicit.has("depth")).toBe(false);
    expect(readSharedReading(explicit)?.lens).toBe("general");
    expect(readSharedReading(explicit)?.depth).toBe("standard");

    const legacy = readSharedReading(validParams());
    expect(legacy?.lens).toBeUndefined();
    expect(legacy?.depth).toBe("standard");
  });

  it("omits an empty question and a disabled shadow flag", () => {
    const { spread, drawn } = drawFor("thelema-triad", false);
    const params = buildShareParams({
      spread,
      drawn,
      question: "   ",
      shadow: false,
    });

    expect(params.has("q")).toBe(false);
    expect(params.has("shadow")).toBe(false);
    expect(params.has("lens")).toBe(false);
    expect(params.has("depth")).toBe(false);
  });

  it("builds an absolute URL under the current base path", () => {
    const { spread, drawn } = drawFor("thelema-triad");
    const url = buildShareUrl("https://example.com/tarot_reading/", {
      spread,
      drawn,
      question: "What now?",
      shadow: false,
    });

    expect(url.startsWith("https://example.com/tarot_reading/#/?")).toBe(true);

    const params = new URLSearchParams(url.slice(url.indexOf("?") + 1));
    expect(params.get("v")).toBe("1");
    expect(params.get("spread")).toBe("thelema-triad");
    expect(params.get("q")).toBe("What now?");
    expect(readSharedReading(params)?.drawn).toHaveLength(3);
  });

  it("detects links that look like shared readings", () => {
    expect(hasShareParams(new URLSearchParams("v=1"))).toBe(true);
    expect(hasShareParams(new URLSearchParams("spread=thelema-triad"))).toBe(true);
    expect(hasShareParams(new URLSearchParams("cards=major-00-fool.u"))).toBe(true);
    expect(hasShareParams(new URLSearchParams("q=hello"))).toBe(false);
    expect(hasShareParams(new URLSearchParams())).toBe(false);
  });

  const invalidCases: Array<[string, (params: URLSearchParams) => void]> = [
    ["a missing version", (params) => params.delete("v")],
    ["an unknown version", (params) => params.set("v", "2")],
    ["an unknown spread", (params) => params.set("spread", "nope")],
    ["a missing card list", (params) => params.delete("cards")],
    [
      "the wrong number of cards",
      (params) => params.set("cards", "major-00-fool.u,cups-two.u"),
    ],
    [
      "a duplicate card",
      (params) => params.set("cards", "major-00-fool.u,major-00-fool.u,major-17-star.u"),
    ],
    [
      "an unknown card",
      (params) => params.set("cards", "nope.u,cups-two.u,major-17-star.u"),
    ],
    [
      "an unknown orientation",
      (params) => params.set("cards", "major-00-fool.x,cups-two.u,major-17-star.u"),
    ],
    [
      "an entry with extra segments",
      (params) => params.set("cards", "major-00-fool.u.extra,cups-two.u,major-17-star.u"),
    ],
    ["an overlong question", (params) => params.set("q", "x".repeat(501))],
    ["an unknown lens", (params) => params.set("lens", "money")],
    ["an unknown depth", (params) => params.set("depth", "maximal")],
  ];

  it.each(invalidCases)("rejects %s", (_label, mutate) => {
    const params = validParams();
    mutate(params);

    expect(readSharedReading(params)).toBeNull();
  });
});
