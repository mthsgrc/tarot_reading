import { CARD_BY_ID } from "../../data/cards";
import { SPREAD_BY_ID } from "../../data/spreads";
import type { DrawnCard, Orientation, Spread } from "../types";
import type { ReadingDepth, ReadingLens } from "./types";

/** Bump when the encoded shape changes in a way that cannot be read backwards. */
const SHARE_VERSION = "1";
export const MAX_QUESTION_LENGTH = 500;
const SHARE_LENSES = new Set<string>(["general", "work", "love", "inner"]);
const SHARE_DEPTHS = new Set<string>(["brief", "standard", "deep"]);

/** Keeps the builder and the reader on the same question limit. */
export function normalizeQuestion(question: string): string {
  return question.trim().slice(0, MAX_QUESTION_LENGTH);
}

export interface ReadingShareInput {
  spread: Spread;
  drawn: readonly DrawnCard[];
  question: string;
  shadow: boolean;
  /** Omitted when the reading should infer its lens from the question. */
  lens?: ReadingLens;
  depth?: ReadingDepth;
}

export interface SharedReading {
  spread: Spread;
  drawn: DrawnCard[];
  question: string;
  shadow: boolean;
  lens?: ReadingLens;
  depth: ReadingDepth;
}

/**
 * Encodes the draw itself rather than a random seed, so a link keeps working
 * after the deck order or shuffle changes. The reading is reproduced from the
 * cards, not regenerated.
 */
export function buildShareParams(input: ReadingShareInput): URLSearchParams {
  const params = new URLSearchParams();
  params.set("v", SHARE_VERSION);
  params.set("spread", input.spread.id);
  params.set(
    "cards",
    input.drawn
      .map(
        ({ card, orientation }) => `${card.id}.${orientation === "shadow" ? "s" : "u"}`,
      )
      .join(","),
  );

  const question = normalizeQuestion(input.question);
  if (question) {
    params.set("q", question);
  }

  if (input.lens) {
    params.set("lens", input.lens);
  }

  if (input.depth && input.depth !== "standard") {
    params.set("depth", input.depth);
  }

  if (input.shadow) {
    params.set("shadow", "1");
  }

  return params;
}

export function buildShareUrl(href: string, input: ReadingShareInput): string {
  const url = new URL(href);
  // The reading page is the index route, so the share link targets `#/?…`.
  url.hash = `#/?${buildShareParams(input).toString()}`;
  return url.toString();
}

/** True when a URL looks like it was meant to carry a shared reading. */
export function hasShareParams(params: URLSearchParams): boolean {
  return params.has("v") || params.has("spread") || params.has("cards");
}

export function readSharedReading(params: URLSearchParams): SharedReading | null {
  if (params.get("v") !== SHARE_VERSION) {
    return null;
  }

  const spread = SPREAD_BY_ID.get(params.get("spread") ?? "");
  if (!spread) {
    return null;
  }

  const question = params.get("q") ?? "";
  if (question.length > MAX_QUESTION_LENGTH) {
    return null;
  }

  const encodedLens = params.get("lens");
  if (encodedLens !== null && !SHARE_LENSES.has(encodedLens)) {
    return null;
  }

  const encodedDepth = params.get("depth") ?? "standard";
  if (!SHARE_DEPTHS.has(encodedDepth)) {
    return null;
  }

  const encoded = params.get("cards");
  if (!encoded) {
    return null;
  }

  const entries = encoded.split(",");
  if (entries.length !== spread.positions.length) {
    return null;
  }

  const seen = new Set<string>();
  const drawn: DrawnCard[] = [];

  for (const [index, entry] of entries.entries()) {
    const [cardId, marker, extra] = entry.split(".");
    if (!cardId || extra !== undefined) {
      return null;
    }
    if (marker !== "u" && marker !== "s") {
      return null;
    }
    if (seen.has(cardId)) {
      return null;
    }

    const card = CARD_BY_ID.get(cardId);
    const position = spread.positions[index];
    if (!card || !position) {
      return null;
    }

    seen.add(cardId);
    drawn.push({
      card,
      position,
      orientation: (marker === "s" ? "shadow" : "upright") satisfies Orientation,
      revealed: true,
    });
  }

  return {
    spread,
    drawn,
    question,
    shadow: params.get("shadow") === "1",
    lens: encodedLens === null ? undefined : (encodedLens as ReadingLens),
    depth: encodedDepth as ReadingDepth,
  };
}
