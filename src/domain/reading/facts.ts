import { SEPHIRA_BY_ID, SEPHIROTH } from "../tree";
import type {
  CourtRank,
  DrawnCard,
  Element,
  NumberRank,
  Sephira,
  Suit,
  TarotCard,
} from "../types";
import { ELEMENTS, HEXAGRAM_POSITION_IDS } from "./positions";
import type {
  CourtRankGroup,
  LensSource,
  NumberGroup,
  ReadingFacts,
  ReadingInput,
  ReadingLens,
  Resonance,
  SephiraTouch,
} from "./types";

const SEPHIRA_IDS = new Set<Sephira>(SEPHIROTH.map((sephira) => sephira.id));

const LENS_KEYWORDS: ReadonlyArray<{
  lens: ReadingLens;
  words: readonly string[];
  phrases?: readonly string[];
}> = [
  {
    lens: "work",
    words: [
      "work",
      "job",
      "career",
      "project",
      "business",
      "money",
      "finance",
      "study",
      "exam",
      "interview",
      "boss",
      "colleague",
      "company",
      "promotion",
      "client",
      "office",
    ],
  },
  {
    lens: "love",
    words: [
      "love",
      "relationship",
      "partner",
      "marriage",
      "dating",
      "date",
      "romance",
      "romantic",
      "friend",
      "family",
      "bond",
      "breakup",
      "ex",
      "connection",
      "heart",
    ],
  },
  {
    lens: "inner",
    // "will" is deliberately absent: it is usually an auxiliary verb ("Will they…?").
    // Possessive phrases carry the stronger signal and outrank single-word matches.
    words: [
      "purpose",
      "path",
      "direction",
      "healing",
      "shadow",
      "self",
      "change",
      "grow",
      "growth",
      "practice",
      "inner",
      "spiritual",
      "truth",
    ],
    phrases: [
      "true will",
      "my will",
      "own will",
      "inner work",
      "inner life",
      "great work",
    ],
  },
];

const PHRASE_WEIGHT = 2;

/** Adds common singular forms so plural keywords still match the table. */
function singularForms(token: string): readonly string[] {
  if (token.endsWith("ies") && token.length > 3) {
    return [token, `${token.slice(0, -3)}y`];
  }

  if (token.endsWith("es") && token.length > 2) {
    return [token, token.slice(0, -1), token.slice(0, -2)];
  }

  if (token.endsWith("s") && token.length > 1) {
    return [token, token.slice(0, -1)];
  }

  return [token];
}

function countPhrase(tokens: readonly string[], phrase: string): number {
  const phraseWords = phrase.split(" ");

  for (let index = 0; index <= tokens.length - phraseWords.length; index += 1) {
    if (phraseWords.every((word, offset) => tokens[index + offset] === word)) {
      return 1;
    }
  }

  return 0;
}

export function inferLens(question = ""): ReadingLens {
  const tokens: readonly string[] = question.toLowerCase().match(/[a-z']+/g) ?? [];
  const wordForms = new Set(tokens.flatMap((token) => singularForms(token)));
  let best: { lens: ReadingLens; score: number } = { lens: "general", score: 0 };

  for (const { lens, words: keywords, phrases = [] } of LENS_KEYWORDS) {
    const wordScore = keywords.reduce(
      (total, keyword) => total + (wordForms.has(keyword) ? 1 : 0),
      0,
    );
    const phraseScore = phrases.reduce(
      (total, phrase) => total + countPhrase(tokens, phrase) * PHRASE_WEIGHT,
      0,
    );
    const score = wordScore + phraseScore;

    if (score > best.score) {
      best = { lens, score };
    }
  }

  return best.score > 0 ? best.lens : "general";
}

function findDominantElement(
  counts: Record<Element, number>,
  total: number,
): Element | undefined {
  if (total === 0) return undefined;

  const sorted = ELEMENTS.map((element) => ({
    element,
    count: counts[element],
  })).sort(
    (left, right) =>
      right.count - left.count ||
      ELEMENTS.indexOf(left.element) - ELEMENTS.indexOf(right.element),
  );

  const first = sorted[0];
  const second = sorted[1];

  if (!first || !second) return undefined;
  if (first.count < 2 || first.count === second.count) return undefined;
  if (first.count / total < 0.34) return undefined;

  return first.element;
}

function touchedSephira(card: TarotCard): Sephira[] {
  if (card.kind === "minor") return [card.sephira];
  if (card.kind === "major") return [card.path.from, card.path.to];
  return [];
}

function buildSephiraTouches(drawn: readonly DrawnCard[]): SephiraTouch[] {
  const bySephira = new Map<Sephira, DrawnCard[]>();

  for (const drawnCard of drawn) {
    for (const sephira of new Set(touchedSephira(drawnCard.card))) {
      const cards = bySephira.get(sephira) ?? [];
      if (!cards.includes(drawnCard)) cards.push(drawnCard);
      bySephira.set(sephira, cards);
    }
  }

  return [...bySephira.entries()]
    .filter(([, cards]) => cards.length >= 2)
    .map(([sephira, cards]) => ({ sephira, cards }))
    .sort((left, right) => {
      if (right.cards.length !== left.cards.length) {
        return right.cards.length - left.cards.length;
      }

      return SEPHIRA_BY_ID[left.sephira].number - SEPHIRA_BY_ID[right.sephira].number;
    });
}

export function getCardPlanet(card: TarotCard): string | undefined {
  if (card.kind === "major") {
    return card.planet?.split(" ")[0]?.toLowerCase();
  }

  if (card.kind === "minor") {
    return card.decan?.split(" ")[0]?.toLowerCase();
  }

  return undefined;
}

function buildResonances(drawn: readonly DrawnCard[]): Resonance[] {
  const resonances: Resonance[] = [];

  for (const drawnCard of drawn) {
    const stationId = drawnCard.position.id;

    if (SEPHIRA_IDS.has(stationId as Sephira)) {
      const sephira = stationId as Sephira;

      if (drawnCard.card.kind === "minor" && drawnCard.card.sephira === sephira) {
        resonances.push({
          kind: "sephira-match",
          drawn: drawnCard,
          stationId,
          stationLabel: drawnCard.position.label,
          detail: "The card and the station coincide.",
        });
      }

      if (
        drawnCard.card.kind === "major" &&
        (drawnCard.card.path.from === sephira || drawnCard.card.path.to === sephira)
      ) {
        const from = SEPHIRA_BY_ID[drawnCard.card.path.from].name;
        const to = SEPHIRA_BY_ID[drawnCard.card.path.to].name;

        resonances.push({
          kind: "path-touch",
          drawn: drawnCard,
          stationId,
          stationLabel: drawnCard.position.label,
          detail: `The path of this card runs from ${from} to ${to}.`,
        });
      }
    }

    if (HEXAGRAM_POSITION_IDS.has(stationId)) {
      const planet = getCardPlanet(drawnCard.card);

      if (planet === stationId) {
        resonances.push({
          kind: "planet-match",
          drawn: drawnCard,
          stationId,
          stationLabel: drawnCard.position.label,
          detail: `The card carries ${planet.charAt(0).toUpperCase()}${planet.slice(1)}.`,
        });
      }
    }
  }

  return resonances;
}

export function buildFacts(
  input: Pick<ReadingInput, "drawn" | "question" | "lens">,
): ReadingFacts {
  const { drawn, lens: explicitLens } = input;
  const question = input.question?.trim() || undefined;
  const total = drawn.length;
  const elements: Record<Element, number> = { Fire: 0, Water: 0, Air: 0, Earth: 0 };
  const suits: Record<Suit, number> = { Wands: 0, Cups: 0, Swords: 0, Disks: 0 };
  const kinds = { major: 0, minor: 0, court: 0 };
  const orientations = { upright: 0, shadow: 0 };
  const numberGroups = new Map<number, { rank: NumberRank; cards: DrawnCard[] }>();
  const courtGroups = new Map<CourtRank, DrawnCard[]>();

  for (const drawnCard of drawn) {
    const { card } = drawnCard;

    elements[card.element] += 1;
    kinds[card.kind] += 1;
    orientations[drawnCard.orientation] += 1;

    if (card.kind === "minor" || card.kind === "court") {
      suits[card.suit] += 1;
    }

    if (card.kind === "minor") {
      const group = numberGroups.get(card.number) ?? { rank: card.rank, cards: [] };
      group.cards.push(drawnCard);
      numberGroups.set(card.number, group);
    }

    if (card.kind === "court") {
      const cards = courtGroups.get(card.rank) ?? [];
      cards.push(drawnCard);
      courtGroups.set(card.rank, cards);
    }
  }

  const repeatedNumbers: NumberGroup[] = [...numberGroups.entries()]
    .filter(([, group]) => group.cards.length >= 2)
    .map(([number, group]) => ({ number, rank: group.rank, cards: group.cards }))
    .sort((left, right) => left.number - right.number);

  const repeatedCourtRanks: CourtRankGroup[] = [...courtGroups.entries()]
    .filter(([, cards]) => cards.length >= 2)
    .map(([rank, cards]) => ({ rank, cards }))
    .sort((left, right) => left.rank.localeCompare(right.rank));

  const inferredLens = inferLens(question);
  const lens = explicitLens ?? inferredLens;
  const lensSource: LensSource = explicitLens
    ? "explicit"
    : inferredLens === "general"
      ? "default"
      : "inferred";

  return {
    total,
    elements,
    suits,
    kinds,
    orientations,
    majors: drawn.filter((drawnCard) => drawnCard.card.kind === "major"),
    minors: drawn.filter((drawnCard) => drawnCard.card.kind === "minor"),
    courts: drawn.filter((drawnCard) => drawnCard.card.kind === "court"),
    shadows: drawn.filter((drawnCard) => drawnCard.orientation === "shadow"),
    dominantElement: findDominantElement(elements, total),
    missingElements:
      total >= 5 ? ELEMENTS.filter((element) => elements[element] === 0) : [],
    repeatedNumbers,
    repeatedCourtRanks,
    sephiraTouches: buildSephiraTouches(drawn),
    resonances: buildResonances(drawn),
    majorRatio: total > 0 ? kinds.major / total : 0,
    courtRatio: total > 0 ? kinds.court / total : 0,
    shadowRatio: total > 0 ? orientations.shadow / total : 0,
    lens,
    lensSource,
    question,
  };
}
