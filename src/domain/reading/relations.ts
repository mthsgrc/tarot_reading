import type { DrawnCard, Suit, Spread, TarotCard } from "../types";
import { describeElementRelation } from "./language";
import { TREE_TRIADS } from "./positions";
import { describeCard, joinWithAnd } from "./text";
import type { Insight } from "./types";

function findCard(
  drawn: readonly DrawnCard[],
  positionId: string,
): DrawnCard | undefined {
  return drawn.find((drawnCard) => drawnCard.position.id === positionId);
}

function suitOf(card: TarotCard): Suit | undefined {
  return card.kind === "major" ? undefined : card.suit;
}

export function describeCardPair(
  first: DrawnCard,
  second: DrawnCard,
): ReturnType<typeof describeElementRelation> {
  const firstSuit = suitOf(first.card);
  const secondSuit = suitOf(second.card);

  if (firstSuit && firstSuit === secondSuit) {
    return {
      kind: "same",
      line: `Both are ${firstSuit}: the same ${first.card.element} current is operating in two places.`,
      advice: "Read them as one impulse expressed twice, not as simple confirmation.",
    };
  }

  return describeElementRelation(first.card.element, second.card.element);
}

function pairLead(first: DrawnCard, second: DrawnCard): string {
  return `${describeCard(first)} (${first.card.element}) in ${first.position.label} meets ${describeCard(second)} (${second.card.element}) in ${second.position.label}.`;
}

function pairInsight(
  spreadId: string,
  title: string,
  first: DrawnCard,
  second: DrawnCard,
  weight: number,
  context: string,
): Insight {
  const relation = describeCardPair(first, second);

  return {
    id: `relation-${spreadId}-${first.position.id}-${second.position.id}`,
    kind: "relation",
    title,
    weight,
    body: [pairLead(first, second), relation.line, context, relation.advice]
      .filter(Boolean)
      .join(" "),
  };
}

function thelemaTriadInsights(drawn: readonly DrawnCard[]): Insight[] {
  const will = findCard(drawn, "thelema");
  const love = findCard(drawn, "agape");
  const gnosis = findCard(drawn, "gnosis");

  const elements = [will, love, gnosis]
    .filter((drawnCard): drawnCard is DrawnCard => Boolean(drawnCard))
    .map((drawnCard) => drawnCard.card.element);

  if (elements.length === 3 && new Set(elements).size === 1) {
    const element = elements[0];

    return [
      {
        id: "relation-thelema-triad-one-current",
        kind: "relation",
        title: `${element} in three forms`,
        weight: 92,
        body: `All three cards are ${element}. Will, love, and knowledge are not separate currents here; they are one current becoming conscious in three ways. The work is not to choose between them, but to notice where you have been treating one as the price of another.`,
      },
    ];
  }

  if (!will || !love) return [];

  const insights = [
    pairInsight(
      "thelema-triad",
      "Will and love",
      will,
      love,
      78,
      "In this spread, Gnosis is what the meeting of these two has to hold.",
    ),
  ];

  if (gnosis) {
    if (
      gnosis.card.element === will.card.element &&
      will.card.element !== love.card.element
    ) {
      insights.push({
        id: "relation-thelema-triad-gnosis-will",
        kind: "relation",
        title: "Gnosis confirms the Will",
        weight: 56,
        body: `${gnosis.card.name} speaks the same ${gnosis.card.element} language as the Will. What becomes known arrives as a confirmation of direction, not as a change of subject. The Agapé is the different note: let it widen the direction rather than test it.`,
      });
    } else if (
      gnosis.card.element === love.card.element &&
      love.card.element !== will.card.element
    ) {
      insights.push({
        id: "relation-thelema-triad-gnosis-love",
        kind: "relation",
        title: "Gnosis is carried by love",
        weight: 56,
        body: `${gnosis.card.name} speaks the same ${gnosis.card.element} language as the Agapé. What becomes known is carried by desire and recognition rather than by effort. The Will is the different note: do not let the warmth blur the direction.`,
      });
    } else if (
      gnosis.card.element !== will.card.element &&
      gnosis.card.element !== love.card.element
    ) {
      const pairPhrase =
        will.card.element === love.card.element
          ? `both ${will.card.element}`
          : `${will.card.element} and ${love.card.element}`;

      insights.push({
        id: "relation-thelema-triad-gnosis-third",
        kind: "relation",
        title: "A third register",
        weight: 52,
        body: `${gnosis.card.name} is ${gnosis.card.element}, while the Will and the Agapé are ${pairPhrase}. Gnosis is not a compromise between them; it arrives in a register of its own. The union may be less like agreement and more like a new capacity.`,
      });
    }
  }

  return insights;
}

function timelineInsights(drawn: readonly DrawnCard[]): Insight[] {
  const past = findCard(drawn, "past");
  const present = findCard(drawn, "present");
  const future = findCard(drawn, "future");

  if (past && present && future) {
    const elements = [past.card.element, present.card.element, future.card.element];

    if (new Set(elements).size === 1) {
      return [
        {
          id: "relation-past-present-future-one-weather",
          kind: "relation",
          title: "One weather, three times",
          weight: 88,
          body: `All three cards are ${elements[0]}. The timeline does not change register; it deepens one ${elements[0].toLowerCase()} theme across past, present, and direction. The question is less “what changes?” than “what has not yet been fully met?”`,
        },
      ];
    }
  }

  const insights: Insight[] = [];

  if (past && present) {
    insights.push(
      pairInsight(
        "past-present-future",
        "From root to present",
        past,
        present,
        58,
        "The past is not gone; it is the soil the present is growing from.",
      ),
    );
  }

  if (present && future) {
    insights.push(
      pairInsight(
        "past-present-future",
        "The direction of the current",
        present,
        future,
        66,
        "The future card shows where the present is tending, not a fixed event.",
      ),
    );
  }

  return insights;
}

function crossInsights(drawn: readonly DrawnCard[]): Insight[] {
  const crown = findCard(drawn, "crown");
  const abyss = findCard(drawn, "abyss");
  const root = findCard(drawn, "root");
  const star = findCard(drawn, "star");

  const insights: Insight[] = [];

  if (crown && root) {
    insights.push(
      pairInsight(
        "thelemic-cross",
        "Crown and Root",
        crown,
        root,
        84,
        "The Crown is what you think you are doing; the Root is what is actually generating the situation. Where they differ, the difference is the reading.",
      ),
    );
  }

  if (abyss && star) {
    insights.push(
      pairInsight(
        "thelemic-cross",
        "Obstacle and guide",
        abyss,
        star,
        70,
        "The Abyss names what blocks the Crown; the Star names what is trying to reach you past the block. Read them as a pair, not as a problem and a rescue.",
      ),
    );
  }

  return insights;
}

function treeInsights(drawn: readonly DrawnCard[]): Insight[] {
  const kether = findCard(drawn, "kether");
  const malkuth = findCard(drawn, "malkuth");
  const insights: Insight[] = [];

  if (kether && malkuth) {
    insights.push(
      pairInsight(
        "tree-of-life",
        "Source and ground",
        kether,
        malkuth,
        86,
        "Read the Tree from Kether downward, then return to Malkuth: the source and the place where it lands are the two ends of one current.",
      ),
    );
  }

  const triads = TREE_TRIADS.map((triad) => {
    const cards = drawn.filter((drawnCard) =>
      triad.positions.includes(drawnCard.position.id),
    );
    const majors = cards.filter((drawnCard) => drawnCard.card.kind === "major").length;
    const shadows = cards.filter(
      (drawnCard) => drawnCard.orientation === "shadow",
    ).length;
    const courts = cards.filter((drawnCard) => drawnCard.card.kind === "court").length;

    return { triad, cards, score: majors * 2 + shadows * 2 + courts };
  })
    .filter((group) => group.cards.length > 0 && group.score > 0)
    .sort((left, right) => right.score - left.score);

  const strongest = triads[0];

  if (strongest) {
    const names = strongest.cards.map(
      (drawnCard) => `${drawnCard.position.label}: ${describeCard(drawnCard)}`,
    );
    const majors = strongest.cards.filter(
      (drawnCard) => drawnCard.card.kind === "major",
    ).length;
    const shadows = strongest.cards.filter(
      (drawnCard) => drawnCard.orientation === "shadow",
    ).length;

    const details = [
      majors > 0
        ? `${majors} ${majors === 1 ? "is a major" : "are majors"}, giving that station archetypal weight`
        : "",
      shadows > 0
        ? `${shadows} ${shadows === 1 ? "is" : "are"} in shadow, so the block is located here rather than everywhere`
        : "",
    ].filter(Boolean);

    insights.push({
      id: `relation-tree-of-life-${strongest.triad.id}`,
      kind: "relation",
      title: `The ${strongest.triad.name} carries the weight`,
      weight: 74,
      body: `The ${strongest.triad.name} holds ${joinWithAnd(names)}. ${
        details.length > 0 ? `${details.join("; ")}.` : ""
      } Read this part of the Tree first: it is where the reading is most concentrated.`,
    });
  }

  return insights;
}

function hexagramInsights(drawn: readonly DrawnCard[]): Insight[] {
  const sun = findCard(drawn, "sun");
  if (!sun) return [];

  const others = drawn.filter((drawnCard) => drawnCard.position.id !== "sun");
  const insights: Insight[] = [];

  if (sun.orientation === "shadow") {
    insights.push({
      id: "relation-great-work-shadowed-centre",
      kind: "relation",
      title: "A shadowed centre",
      weight: 90,
      body: `The centre card, ${sun.card.name}, appears in shadow. The organizing will is blocked, overextended, or borrowed from someone else. The other planets are still moving, but they are orbiting a centre that has not yet claimed itself. Begin by asking what you actually want, not what you think you should want.`,
    });
  }

  const same = others.filter(
    (drawnCard) => drawnCard.card.element === sun.card.element,
  ).length;
  const complement = others.filter(
    (drawnCard) =>
      describeElementRelation(sun.card.element, drawnCard.card.element).kind ===
      "complement",
  ).length;
  const tension = others.filter(
    (drawnCard) =>
      describeElementRelation(sun.card.element, drawnCard.card.element).kind ===
      "tension",
  ).length;

  const balanceLine =
    tension >= 2
      ? "The centre is not wrong, but it is being asked to hold difference rather than impose unity."
      : same >= 3
        ? "The centre has support. The risk is a closed circle that agrees with itself."
        : "The Work is to let the centre receive from the edges, not merely radiate toward them.";

  insights.push({
    id: "relation-great-work-centre-field",
    kind: "relation",
    title: "The centre and the field",
    weight: 76,
    body: `${sun.card.name} (${sun.card.element}) is the centre. Of the ${others.length} forces around it, ${same} share its element, ${complement} ${complement === 1 ? "feeds" : "feed"} it, and ${tension} ${tension === 1 ? "is" : "are"} in tension with it. ${balanceLine}`,
  });

  return insights;
}

function loversInsights(drawn: readonly DrawnCard[]): Insight[] {
  const you = findCard(drawn, "you");
  const other = findCard(drawn, "other");
  const bond = findCard(drawn, "bond");
  const challenge = findCard(drawn, "challenge");

  const insights: Insight[] = [];

  if (you && other) {
    insights.push(
      pairInsight(
        "lovers-cross",
        "You and the Other",
        you,
        other,
        88,
        "This describes the dynamic between two positions, not the private mind of another person. The Other is read as energy you meet, not as a verdict on who they are.",
      ),
    );
  }

  if (bond && challenge) {
    insights.push(
      pairInsight(
        "lovers-cross",
        "The Bond and the Challenge",
        bond,
        challenge,
        70,
        "The Bond is the actual weather between you; the Challenge is what that weather has to hold. A challenge is not proof that the bond is wrong.",
      ),
    );
  }

  return insights;
}

/** Card-to-card and position-to-position observations for each spread. */
export function buildRelationInsights(
  spread: Spread,
  drawn: readonly DrawnCard[],
): Insight[] {
  switch (spread.id) {
    case "thelema-triad":
      return thelemaTriadInsights(drawn);
    case "past-present-future":
      return timelineInsights(drawn);
    case "thelemic-cross":
      return crossInsights(drawn);
    case "tree-of-life":
      return treeInsights(drawn);
    case "great-work-hexagram":
      return hexagramInsights(drawn);
    case "lovers-cross":
      return loversInsights(drawn);
    default:
      return [];
  }
}
