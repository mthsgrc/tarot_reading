import { NUMBER_NOTE_BY_RANK, SEPHIRA_THEMES } from "../../data/tradition";
import { SEPHIRA_BY_ID, SUIT_ELEMENTS } from "../tree";
import type { DrawnCard, Element, Suit } from "../types";
import { ELEMENT_VOICE } from "./language";
import { ELEMENTS } from "./positions";
import { describeCard, joinWithAnd } from "./text";
import type { Insight, InsightKind, ReadingFacts } from "./types";

const OUTCOME_POSITIONS = new Set(["future", "aeon", "potential", "gnosis", "malkuth"]);

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function elementInsight(facts: ReadingFacts): Insight | undefined {
  const element = facts.dominantElement;
  if (!element) return undefined;

  const count = facts.elements[element];
  const voice = ELEMENT_VOICE[element];
  const suits = (Object.keys(facts.suits) as Suit[]).filter(
    (suit) => SUIT_ELEMENTS[suit] === element && facts.suits[suit] > 0,
  );
  const suitLine =
    suits.length === 1
      ? ` ${facts.suits[suits[0]!]} of them ${facts.suits[suits[0]!] === 1 ? "comes" : "come"} through ${suits[0]}.`
      : "";
  const totalLine =
    count === facts.total
      ? ` Every card is ${element}, so the reading is unusually single-minded. The risk is ${voice.excess}.`
      : "";

  return {
    id: `element-${element}`,
    kind: "element",
    title: `${element} leads`,
    weight: 58 + count * 4,
    body: `${count} of ${facts.total} cards carry ${element}, the element of ${voice.noun}.${suitLine}${totalLine} The reading leans toward its gift: ${voice.gift}. ${voice.question}`,
  };
}

function missingElementInsights(facts: ReadingFacts): Insight[] {
  return facts.missingElements.map((element) => {
    const voice = ELEMENT_VOICE[element];

    return {
      id: `missing-${element}`,
      kind: "element",
      title: `No ${element}`,
      weight: 24,
      body: `No ${element} appears in the spread. The reading is not speaking directly in the register of ${voice.noun}. That does not make ${element.toLowerCase()} irrelevant; it means the question may need to be asked in its own terms. ${voice.question}`,
    };
  });
}

function majorInsight(facts: ReadingFacts): Insight | undefined {
  const majors = facts.kinds.major;

  if (majors >= 2 && facts.majorRatio >= 0.4) {
    return {
      id: "major-weight",
      kind: "major",
      title: "Archetypal weight",
      weight: majors >= 3 ? 74 : 58,
      body: `${majors} of ${facts.total} cards are from the Major Arcana. The question carries more than a tactical weight: it is touching a direction, a stage of life, or a pattern larger than the immediate choice. Read the majors as the theme, and the minors as where that theme becomes concrete.`,
    };
  }

  if (majors === 0 && facts.total >= 3) {
    return {
      id: "major-grounded",
      kind: "major",
      title: "Close to the ground",
      weight: 22,
      body: "Every card is from the minor arcana. The reading stays close to daily choices, people, and circumstances. That is not a lesser reading; it is a practical one. The archetypal layer is working through ordinary things.",
    };
  }

  return undefined;
}

function courtInsight(facts: ReadingFacts): Insight | undefined {
  if (facts.courts.length < 2) return undefined;

  const repeated = facts.repeatedCourtRanks.filter((group) => group.cards.length >= 2);
  const repeatLine =
    repeated.length > 0
      ? ` The ${repeated[0]!.rank} appears more than once, so the same mode of authority or service is being asked for in two places.`
      : "";

  return {
    id: "court-people",
    kind: "court",
    title: "People and roles",
    weight: 52 + facts.courts.length * 5,
    body: `${facts.courts.length} of ${facts.total} cards are court cards. Court cards often describe people, roles, or modes of behaviour rather than events. Ask who is actually present in the situation, including the role you are playing.${repeatLine}`,
  };
}

function numberInsights(facts: ReadingFacts): Insight[] {
  return facts.repeatedNumbers.map((group) => {
    const names = group.cards.map((drawnCard) => describeCard(drawnCard));

    return {
      id: `number-${group.number}`,
      kind: "number",
      title: `The number ${group.rank} repeats`,
      weight: 56 + group.cards.length * 3,
      body: `The ${group.rank} appears in ${joinWithAnd(names)}. ${NUMBER_NOTE_BY_RANK[group.rank]} The same lesson is being presented at two levels; read the cards together rather than as separate messages.`,
    };
  });
}

function shadowInsight(facts: ReadingFacts): Insight | undefined {
  if (facts.shadows.length === 0) return undefined;

  if (facts.shadows.length === facts.total) {
    return {
      id: "shadow-everywhere",
      kind: "shadow",
      title: "Every card is in shadow",
      weight: 94,
      body: "The whole spread is inverted. That is not a curse and not a verdict. It suggests that the conscious story has become too small for the situation, and that the material is pressing up from below. Read each card as a current that is blocked, excessive, or asking to be met rather than solved.",
    };
  }

  const outcomeShadow = facts.shadows.find((drawnCard) =>
    OUTCOME_POSITIONS.has(drawnCard.position.id),
  );

  if (outcomeShadow) {
    return {
      id: `shadow-outcome-${outcomeShadow.position.id}`,
      kind: "shadow",
      title: "Shadow at the outcome",
      weight: 70,
      body: `${outcomeShadow.card.name} in ${outcomeShadow.position.label} is in shadow. The outcome is not fixed; the shadow shows the cost of repeating the present pattern. Ask what you would have to stop doing for this outcome to change.`,
    };
  }

  if (facts.shadows.length >= 2 || facts.shadowRatio >= 0.5) {
    const positions = facts.shadows.map((drawnCard) => drawnCard.position.label);

    return {
      id: "shadow-cluster",
      kind: "shadow",
      title: "The shadow is concentrated",
      weight: 76,
      body: `${facts.shadows.length} of ${facts.total} cards are in shadow, in ${joinWithAnd(positions)}. Shadow is not punishment; it shows where a current is blocked, excessive, or inverted. The block has a location, and therefore a place to begin.`,
    };
  }

  const first = facts.shadows[0]!;

  return {
    id: `shadow-single-${first.position.id}`,
    kind: "shadow",
    title: "One card in shadow",
    weight: 30,
    body: `${first.card.name} in ${first.position.label} is in shadow. Read it as a current that is out of balance rather than as a bad sign: something is either blocked, overdone, or asking for honest attention.`,
  };
}

function sharedSephiraInsight(facts: ReadingFacts): Insight | undefined {
  const touch = facts.sephiraTouches[0];
  if (!touch || touch.cards.length < 2) return undefined;

  const name = SEPHIRA_BY_ID[touch.sephira].name;
  const names = touch.cards.map((drawnCard) => describeCard(drawnCard));
  const theme = SEPHIRA_THEMES[touch.sephira];

  return {
    id: `sephira-${touch.sephira}`,
    kind: "resonance",
    title: `${name} is the hinge`,
    weight: touch.cards.length >= 3 ? 86 : 64,
    body: `${touch.cards.length} cards touch ${name}: ${joinWithAnd(names)}. ${theme} When one station receives several cards, the reading is rooted there. The question is less about which card wins than about what ${name} is asking to become conscious.`,
  };
}

function resonanceInsight(facts: ReadingFacts): Insight | undefined {
  if (facts.resonances.length === 0) return undefined;

  const lines = facts.resonances.map(
    (resonance) =>
      `${resonance.drawn.card.name} in ${resonance.stationLabel} — ${resonance.detail}`,
  );
  const hasSephira = facts.resonances.some(
    (resonance) => resonance.kind === "sephira-match" || resonance.kind === "path-touch",
  );

  return {
    id: "resonance-map",
    kind: "resonance",
    title: "The map agrees",
    weight: hasSephira ? 80 : 68,
    body: `${lines.join(" ")} These are not extra meanings bolted on from outside; they show where the card and the station reinforce one another. The reading is unusually literal here.`,
  };
}

function keywordInsight(
  facts: ReadingFacts,
  drawn: readonly DrawnCard[],
): Insight | undefined {
  if (facts.total < 3) return undefined;

  const counts = new Map<string, { names: string[]; cards: number }>();

  drawn.forEach((drawnCard) => {
    const seen = new Set<string>();

    drawnCard.card.keywords.forEach((keyword) => {
      const normalized = keyword.toLowerCase();
      if (seen.has(normalized)) return;
      seen.add(normalized);

      const entry = counts.get(normalized) ?? { names: [], cards: 0 };
      entry.names.push(drawnCard.card.name);
      entry.cards += 1;
      counts.set(normalized, entry);
    });
  });

  const repeated = [...counts.entries()]
    .filter(([, entry]) => entry.cards >= 2)
    .sort(
      ([leftWord, left], [rightWord, right]) =>
        right.cards - left.cards || leftWord.localeCompare(rightWord),
    );

  const strongest = repeated[0];
  if (!strongest) return undefined;

  const [word, entry] = strongest;

  return {
    id: `keyword-${word}`,
    kind: "relation",
    title: `The word “${word}” repeats`,
    weight: 34 + entry.cards * 3,
    body: `“${capitalize(word)}” appears in ${joinWithAnd(entry.names)}. When a word recurs, it is less a prediction than a request to notice the same theme in different clothing.`,
  };
}

function fallbackInsight(): Insight {
  return {
    id: "balanced-fallback",
    kind: "balance",
    title: "A balanced draw",
    weight: 10,
    body: "No single element, suit, number, or rank dominates. A balanced reading is allowed to be balanced; it does not need a dramatic pattern. Read each position in turn, and notice which one you want to argue with.",
  };
}

function selectionLimit(total: number): number {
  if (total <= 3) return 4;
  if (total <= 5) return 5;
  return 6;
}

/** Sort by weight, keep the strongest, and avoid a wall of near-identical notices. */
export function selectInsights(insights: readonly Insight[], total: number): Insight[] {
  const limit = selectionLimit(total);
  const sorted = [...insights].sort(
    (left, right) => right.weight - left.weight || left.id.localeCompare(right.id),
  );
  const picked: Insight[] = [];
  const kindCounts = new Map<InsightKind, number>();
  const seen = new Set<string>();

  for (const insight of sorted) {
    if (picked.length >= limit) break;
    if (seen.has(insight.id)) continue;

    const kindCount = kindCounts.get(insight.kind) ?? 0;
    if (kindCount >= 2) continue;

    picked.push(insight);
    seen.add(insight.id);
    kindCounts.set(insight.kind, kindCount + 1);
  }

  if (picked.length === 0) return [fallbackInsight()];

  return picked;
}

/** Observations that belong to the draw as a whole, before card-to-card relations. */
export function buildFactInsights(
  facts: ReadingFacts,
  drawn: readonly DrawnCard[],
): Insight[] {
  const insights = [
    elementInsight(facts),
    majorInsight(facts),
    courtInsight(facts),
    shadowInsight(facts),
    sharedSephiraInsight(facts),
    resonanceInsight(facts),
    keywordInsight(facts, drawn),
    ...missingElementInsights(facts),
    ...numberInsights(facts),
  ].filter((insight): insight is Insight => Boolean(insight));

  return insights;
}

/**
 * Keep the array order stable for tests and export the element list used by
 * the reading UI without duplicating it there.
 */
/** A small helper for the overview: “2 Air, 1 Water”, strongest first. */
export function describeElementCounts(facts: ReadingFacts): string[] {
  return ELEMENTS.filter((element: Element) => facts.elements[element] > 0)
    .sort(
      (left, right) =>
        facts.elements[right] - facts.elements[left] ||
        ELEMENTS.indexOf(left) - ELEMENTS.indexOf(right),
    )
    .map((element) => `${facts.elements[element]} ${element}`);
}
