import { SEPHIRA_BY_ID } from "../tree";
import type { DrawnCard, Spread } from "../types";
import {
  ELEMENT_VOICE,
  LENS_FRAMES,
  LENS_LABELS,
  describeElementRelation,
} from "./language";
import { describeElementCounts } from "./notices";
import { ELEMENTS, POSITION_INTROS, TREE_TRIADS } from "./positions";
import { describeCardPair } from "./relations";
import {
  describeCard,
  firstSentence,
  joinWithAnd,
  lowerFirst,
  pickVariant,
  readingSeed,
} from "./text";
import type { PositionInsight, ReadingFacts, ReadingLens } from "./types";

const OUTCOME_POSITIONS = new Set(["future", "aeon", "potential", "gnosis", "malkuth"]);

const RELATION_LABELS = {
  same: "shared",
  complement: "complementary",
  tension: "tense",
  different: "different",
} as const;

const LENS_TAILS: Record<ReadingLens, string> = {
  general: "",
  work: " Put it where work can see it: one conversation, one decision, one deadline.",
  love: " Say it to the person involved without asking them to solve it.",
  inner: " Treat it as a practice, not a test.",
};

const SPREAD_ACTIONS: Record<string, string> = {
  "thelema-triad":
    "Name one thing you want without negotiating it into something smaller, then listen for the response. Notice whether the answer feels like recognition or like performance.",
  "past-present-future":
    "Notice one habit from the past that is still setting the present's weather. Change one small action that belongs to that habit.",
  "thelemic-cross":
    "Name the difference between what you intend and what is actually driving the situation. Then address the Root rather than arguing with the Crown.",
  "tree-of-life":
    "Start with Malkuth: name one material condition that needs tending, and tend it before interpreting the higher stations.",
  "great-work-hexagram":
    "Choose the planet you have been avoiding and give it one deliberate act this week. Let the centre reorganize around that act rather than around worry.",
  "lovers-cross":
    "Say one true thing about the bond without asking the other person to resolve it. Notice whether the conversation becomes more honest or more careful.",
};

function findCard(
  drawn: readonly DrawnCard[],
  positionId: string,
): DrawnCard | undefined {
  return drawn.find((drawnCard) => drawnCard.position.id === positionId);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function buildHeadline(facts: ReadingFacts): string {
  const present = ELEMENTS.filter((element) => facts.elements[element] > 0).sort(
    (left, right) =>
      facts.elements[right] - facts.elements[left] ||
      ELEMENTS.indexOf(left) - ELEMENTS.indexOf(right),
  );
  const hinge = facts.sephiraTouches.find((touch) => touch.cards.length >= 3);
  const hingePhrase = hinge
    ? `, with ${SEPHIRA_BY_ID[hinge.sephira].name} as its hinge`
    : "";

  if (present.length === 0) return "A reading without a draw.";
  if (present.length === 1) return `A reading in ${present[0]}${hingePhrase}.`;
  if (present.length === 2) {
    return `A reading of ${present[0]} and ${present[1]}${hingePhrase}.`;
  }
  if (facts.dominantElement) {
    return `A reading in ${facts.dominantElement}${hingePhrase}.`;
  }

  if (facts.majorRatio >= 0.7) {
    return `A reading of archetypes${hingePhrase}.`;
  }

  return `A balanced reading${hingePhrase}.`;
}

export function buildOverview(facts: ReadingFacts): string[] {
  const paragraphs: string[] = [];
  const kindParts = [
    facts.kinds.major > 0
      ? `${facts.kinds.major} ${facts.kinds.major === 1 ? "major" : "majors"}`
      : "",
    facts.kinds.minor > 0
      ? `${facts.kinds.minor} ${facts.kinds.minor === 1 ? "minor" : "minors"}`
      : "",
    facts.kinds.court > 0
      ? `${facts.kinds.court} ${facts.kinds.court === 1 ? "court card" : "court cards"}`
      : "",
  ].filter(Boolean);

  const countLine =
    kindParts.length > 0
      ? `The draw holds ${joinWithAnd(kindParts)}.`
      : "The draw is empty.";
  const elementLine =
    facts.total > 0
      ? `Element balance: ${joinWithAnd(describeElementCounts(facts))}.`
      : "";

  paragraphs.push([countLine, elementLine].filter(Boolean).join(" "));

  const majorLine =
    facts.majorRatio >= 0.4 && facts.kinds.major >= 2
      ? "The majors give the reading archetypal weight: it is less about what to do tomorrow than about the direction the whole current is taking."
      : facts.kinds.major === 0 && facts.total >= 3
        ? "Every card is a minor, so the reading stays close to daily choices, people, and circumstances. The archetypal layer is working through ordinary things."
        : "Majors and minors are mixed, so the reading moves between archetype and circumstance rather than settling into one register.";

  const courtLine =
    facts.courts.length >= 2
      ? " The courts add a second layer: people, roles, and modes of behaviour are part of the pattern."
      : "";

  paragraphs.push(`${majorLine}${courtLine}`);

  if (facts.lens !== "general" && facts.lensSource !== "default") {
    const source =
      facts.lensSource === "inferred"
        ? "The wording of the question points toward"
        : "The reading is held through";

    paragraphs.push(
      `${source} ${LENS_LABELS[facts.lens].toLowerCase()}. ${LENS_FRAMES[facts.lens]}`,
    );
  }

  return paragraphs;
}

function resonanceLine(facts: ReadingFacts, drawn: DrawnCard): string {
  const resonances = facts.resonances.filter((resonance) => resonance.drawn === drawn);

  if (resonances.length === 0) return "";

  return resonances
    .map((resonance) => {
      if (resonance.kind === "sephira-match") {
        return `${resonance.detail} The card and the station coincide, so this is an unusually literal expression of ${resonance.stationLabel}.`;
      }

      if (resonance.kind === "path-touch") {
        return `${resonance.detail} The path and the station reinforce each other.`;
      }

      return `${resonance.detail} Here the planet's register is doubled.`;
    })
    .join(" ");
}

export function buildPositionInsights(
  spread: Spread,
  drawn: readonly DrawnCard[],
  facts: ReadingFacts,
): PositionInsight[] {
  const seed = readingSeed(spread, drawn);
  const connectors = [
    "Here the card is",
    "The card drawn here is",
    "What appears here is",
    "The current takes the form of",
  ];
  const uprightLeads = ["Upright", "In its upright expression", "Read directly"];
  const shadowLeads = ["In shadow", "In its shadow expression", "Turned inward"];

  return drawn.map((drawnCard) => {
    const intro = POSITION_INTROS[drawnCard.position.id] ?? drawnCard.position.hint;
    const connector = pickVariant(connectors, seed, `connector-${drawnCard.position.id}`);
    const lead =
      drawnCard.orientation === "shadow"
        ? pickVariant(shadowLeads, seed, `orientation-${drawnCard.position.id}`)
        : pickVariant(uprightLeads, seed, `orientation-${drawnCard.position.id}`);
    const counsel = firstSentence(
      drawnCard.orientation === "shadow" ? drawnCard.card.shadow : drawnCard.card.upright,
    );
    const essence = firstSentence(drawnCard.card.essence);
    const otherGuardrail =
      drawnCard.position.id === "other"
        ? " This describes the energy you meet, not a claim about another person's private thoughts."
        : "";

    const body = [
      intro,
      `${connector} ${describeCard(drawnCard)}.`,
      essence,
      `${lead}: ${lowerFirst(counsel)}`,
      resonanceLine(facts, drawnCard),
      otherGuardrail,
    ]
      .filter(Boolean)
      .join(" ");

    return { drawn: drawnCard, body };
  });
}

function thelemaMovement(drawn: readonly DrawnCard[]): string[] {
  const will = findCard(drawn, "thelema");
  const love = findCard(drawn, "agape");
  const gnosis = findCard(drawn, "gnosis");

  if (!will || !love || !gnosis) return [];

  const willLove = describeCardPair(will, love);
  const paragraphs = [
    `${will.card.name} in Thelema meets ${love.card.name} in Agapé. ${willLove.line} ${willLove.advice}`,
  ];

  const gnosisParts = [`${gnosis.card.name} in Gnosis is the third term.`];

  if (gnosis.card.element === will.card.element) {
    gnosisParts.push(
      "What becomes known confirms the direction of the Will rather than replacing it.",
    );
  } else if (gnosis.card.element === love.card.element) {
    gnosisParts.push(
      "What becomes known is carried by love; the knowledge arrives through recognition rather than through effort.",
    );
  } else {
    gnosisParts.push(
      "The union arrives in a register of its own. It is not a compromise between will and love, but a capacity neither one could produce alone.",
    );
  }

  if (gnosis.card.kind === "major") {
    gnosisParts.push(
      "A major in Gnosis says the knowledge is larger than a personal conclusion.",
    );
  } else if (gnosis.card.kind === "court") {
    gnosisParts.push(
      "A court in Gnosis says the knowledge may arrive through a person or a role.",
    );
  } else {
    gnosisParts.push(
      "A minor in Gnosis says the knowledge will look like an ordinary circumstance before it looks like revelation.",
    );
  }

  if (gnosis.orientation === "shadow") {
    gnosisParts.push(
      `In shadow, the union may be overclaimed or bypassed: ${lowerFirst(firstSentence(gnosis.card.shadow))}`,
    );
  }

  paragraphs.push(gnosisParts.join(" "));
  return paragraphs;
}

function timelineMovement(drawn: readonly DrawnCard[]): string[] {
  const past = findCard(drawn, "past");
  const present = findCard(drawn, "present");
  const future = findCard(drawn, "future");

  if (!past || !present || !future) return [];

  const paragraphs: string[] = [];
  const rootToPresent = describeCardPair(past, present);
  const presentToFuture = describeCardPair(present, future);

  paragraphs.push(
    `${past.card.name} gives way to ${present.card.name}. ${rootToPresent.line} ${rootToPresent.advice}`,
  );

  const futureParts = [
    `The current turns toward ${future.card.name}. ${presentToFuture.line}`,
  ];

  if (future.orientation === "shadow") {
    futureParts.push(
      `The future card is in shadow. Treat it as the cost of repeating the present pattern, not as a sentence: ${lowerFirst(firstSentence(future.card.shadow))}`,
    );
  } else if (future.card.kind === "major") {
    futureParts.push(
      "A major in the future says the direction is larger than personal effort. It asks for alignment more than control.",
    );
  } else if (future.card.kind === "court") {
    futureParts.push(
      "A court in the future puts a person or a role at the turning point. The outcome may arrive through a relationship rather than through a plan.",
    );
  } else {
    futureParts.push(
      "A minor in the future keeps the outcome concrete. Look for a circumstance, a task, or a small decision rather than a revelation.",
    );
  }

  paragraphs.push(futureParts.join(" "));
  return paragraphs;
}

function crossMovement(drawn: readonly DrawnCard[]): string[] {
  const crown = findCard(drawn, "crown");
  const abyss = findCard(drawn, "abyss");
  const root = findCard(drawn, "root");
  const star = findCard(drawn, "star");
  const aeon = findCard(drawn, "aeon");

  const paragraphs: string[] = [];

  if (crown && root) {
    const relation = describeCardPair(crown, root);
    paragraphs.push(
      `The Crown is ${crown.card.name}; the Root is ${root.card.name}. ${relation.line} ${relation.advice} Where the conscious intention and the hidden foundation agree, the work is to act cleanly. Where they differ, the difference is the reading.`,
    );
  }

  if (abyss && star) {
    const relation = describeCardPair(abyss, star);
    const abyssLine =
      abyss.orientation === "shadow"
        ? "The obstacle is already in shadow: the resistance is not a clean external wall but something you are also participating in."
        : abyss.card.kind === "major"
          ? "The obstacle is archetypal, not merely practical. It has the shape of a stage rather than a nuisance."
          : "The obstacle is concrete. It can be named, negotiated with, or crossed.";
    const starLine =
      star.card.kind === "major"
        ? "The Star is a major, so the guide is a principle rather than a promise."
        : star.card.kind === "court"
          ? "The Star is a court card, so the guide may arrive through a person or a role."
          : "The Star is a minor, so the guide is close to ordinary life.";

    paragraphs.push(
      `The Abyss is ${abyss.card.name}; the Star is ${star.card.name}. ${relation.line} ${abyssLine} ${starLine}`,
    );
  }

  if (aeon) {
    const parts = [
      `The Aeon places the outcome inside a larger cycle: ${aeon.card.name}.`,
    ];

    if (aeon.orientation === "shadow") {
      parts.push(
        "Its shadow does not cancel the movement, but it warns against mistaking the end of one arrangement for the end of the whole story.",
      );
    } else if (aeon.card.kind === "major") {
      parts.push(
        "A major here says the larger movement is already underway; the personal outcome is a local expression of it.",
      );
    } else {
      parts.push(
        "The outcome card is not the whole Aeon. It is how the larger movement becomes local, practical, and yours to meet.",
      );
    }

    paragraphs.push(parts.join(" "));
  }

  return paragraphs;
}

function treeMovement(drawn: readonly DrawnCard[]): string[] {
  const kether = findCard(drawn, "kether");
  const malkuth = findCard(drawn, "malkuth");
  const tiphareth = findCard(drawn, "tiphareth");
  const paragraphs: string[] = [];

  if (kether && malkuth) {
    const relation = describeCardPair(kether, malkuth);
    paragraphs.push(
      `Read from Kether downward and then return to Malkuth. The source is ${kether.card.name}; the place where it lands is ${malkuth.card.name}. ${relation.line} ${relation.advice}`,
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
    const names = strongest.cards.map((drawnCard) => drawnCard.card.name);
    const majors = strongest.cards.filter(
      (drawnCard) => drawnCard.card.kind === "major",
    ).length;
    const shadows = strongest.cards.filter(
      (drawnCard) => drawnCard.orientation === "shadow",
    ).length;
    const details = [
      majors > 0 ? `${majors} ${majors === 1 ? "major" : "majors"}` : "",
      shadows > 0 ? `${shadows} in shadow` : "",
    ].filter(Boolean);

    paragraphs.push(
      `The ${strongest.triad.name} carries the most weight: ${joinWithAnd(names)}${details.length > 0 ? ` (${joinWithAnd(details)})` : ""}. Read that part of the Tree first. It is where the reading is most concentrated, and where the rest of the Tree is being organized from.`,
    );
  }

  if (tiphareth) {
    paragraphs.push(
      `At Tiphareth, the heart of the Tree, the reading finds ${tiphareth.card.name}. This is the station of harmony and the harmonized self; it tells you what the whole current is trying to integrate, not merely what it is trying to achieve.`,
    );
  }

  if (malkuth) {
    const landing =
      malkuth.orientation === "shadow"
        ? "A shadow in Malkuth says the block is not only in your philosophy. It is in the material conditions, the body, or the daily arrangement that has not yet changed."
        : "Malkuth is where the reading becomes real. The highest station is only an idea until it reaches the body, the home, the work, and the day.";

    paragraphs.push(`In Malkuth, ${malkuth.card.name}. ${landing}`);
  }

  return paragraphs;
}

function hexagramMovement(drawn: readonly DrawnCard[]): string[] {
  const sun = findCard(drawn, "sun");
  if (!sun) return [];

  const paragraphs: string[] = [];
  const centreParts = [`The centre holds ${sun.card.name}.`];

  if (sun.orientation === "shadow") {
    centreParts.push(
      "In shadow, the organizing will is blocked, overextended, or borrowed. The other planets are still moving, but they orbit a centre that has not yet claimed itself.",
    );
  } else if (sun.card.kind === "major") {
    centreParts.push(
      "A major at the centre says the conscious self is carrying an archetype. The Work is to embody it rather than perform it.",
    );
  } else if (sun.card.kind === "court") {
    centreParts.push(
      "A court at the centre says a person or role is carrying the Work. Ask whether that role is chosen or merely assigned.",
    );
  } else {
    centreParts.push(
      "A minor at the centre keeps the Work concrete. The will is being tested in ordinary tasks, not on a mountaintop.",
    );
  }

  paragraphs.push(centreParts.join(" "));

  const moon = findCard(drawn, "moon");
  if (moon) {
    const relation = describeCardPair(sun, moon);
    paragraphs.push(
      `The Moon position holds ${moon.card.name}. The conscious centre and the unconscious tide are in a ${RELATION_LABELS[relation.kind]} relationship. ${relation.line} ${relation.advice}`,
    );
  }

  const others = drawn.filter(
    (drawnCard) => drawnCard.position.id !== "sun" && drawnCard.position.id !== "moon",
  );

  if (others.length > 0) {
    const ranked = others
      .map((drawnCard) => ({
        drawnCard,
        relation: describeElementRelation(sun.card.element, drawnCard.card.element),
      }))
      .sort((left, right) => {
        const order = { tension: 4, complement: 3, different: 2, same: 1 } as const;
        return order[right.relation.kind] - order[left.relation.kind];
      });

    const strongest = ranked[0];
    if (strongest) {
      paragraphs.push(
        `The most active outer relation is with ${strongest.drawnCard.card.name} in ${strongest.drawnCard.position.label}. ${strongest.relation.line} ${strongest.relation.advice}`,
      );
    }
  }

  return paragraphs;
}

function loversMovement(drawn: readonly DrawnCard[]): string[] {
  const you = findCard(drawn, "you");
  const other = findCard(drawn, "other");
  const bond = findCard(drawn, "bond");
  const challenge = findCard(drawn, "challenge");
  const potential = findCard(drawn, "potential");
  const paragraphs: string[] = [];

  if (you && other) {
    const relation = describeCardPair(you, other);
    paragraphs.push(
      `You are ${you.card.name}; the Other is ${other.card.name}. ${relation.line} This describes the dynamic between the positions, not the private mind of another person. ${relation.advice}`,
    );
  }

  if (bond && challenge) {
    const relation = describeCardPair(bond, challenge);
    const challengeLine =
      challenge.orientation === "shadow"
        ? "The Challenge is in shadow; the friction may be avoided, dramatized, or displaced rather than met."
        : "The Challenge is upright; the friction is available to be worked with rather than guessed at.";

    paragraphs.push(
      `The Bond is ${bond.card.name}; the Challenge is ${challenge.card.name}. ${relation.line} ${challengeLine} A challenge is not proof that the bond is wrong.`,
    );
  }

  if (potential) {
    const parts = [`The Potential is ${potential.card.name}.`];

    if (potential.orientation === "shadow") {
      parts.push(
        "In shadow, what could become possible may first feel like the loss of a familiar arrangement. That is not a reason to refuse it.",
      );
    } else if (potential.card.kind === "major") {
      parts.push(
        "A major in the Potential says the bond is being asked to become something larger than comfort. The potential is a direction, not a guarantee.",
      );
    } else {
      parts.push(
        "The potential describes what becomes possible when both Wills are honoured, not a future that arrives on its own.",
      );
    }

    paragraphs.push(parts.join(" "));
  }

  return paragraphs;
}

export function buildMovement(
  spread: Spread,
  drawn: readonly DrawnCard[],
  facts: ReadingFacts,
): string[] {
  switch (spread.id) {
    case "thelema-triad":
      return thelemaMovement(drawn);
    case "past-present-future":
      return timelineMovement(drawn);
    case "thelemic-cross":
      return crossMovement(drawn);
    case "tree-of-life":
      return treeMovement(drawn);
    case "great-work-hexagram":
      return hexagramMovement(drawn);
    case "lovers-cross":
      return loversMovement(drawn);
    default: {
      const relation = describeElementRelation(
        facts.dominantElement ?? "Air",
        facts.dominantElement ?? "Air",
      );
      return [`${capitalize(relation.line)} ${relation.advice}`];
    }
  }
}

export function buildAction(spread: Spread, facts: ReadingFacts): string {
  const tail = LENS_TAILS[facts.lens];
  const outcomeShadow = facts.shadows.find((drawnCard) =>
    OUTCOME_POSITIONS.has(drawnCard.position.id),
  );

  if (outcomeShadow) {
    return `Name the pattern you would be repeating, and interrupt it once this week in a way you can observe. The outcome is not fixed; the repetition is optional.${tail}`;
  }

  const shadowedSun = facts.shadows.find((drawnCard) => drawnCard.position.id === "sun");
  if (shadowedSun) {
    return `Start at the centre: name what you actually want without borrowing the answer from what is expected of you. Then choose one act that belongs to that want, not to the performance of it.${tail}`;
  }

  if (facts.shadowRatio >= 0.5) {
    return `Name the block without dramatizing it: say what you are avoiding, what you are overdoing, and what it costs. Then change one small action that feeds the pattern.${tail}`;
  }

  const hinge = facts.sephiraTouches.find((touch) => touch.cards.length >= 3);
  if (hinge) {
    const name = SEPHIRA_BY_ID[hinge.sephira].name;
    return `Return to ${name}. Ask which choice comes from that root rather than from immediate pressure, then take one step that a person rooted there would take.${tail}`;
  }

  if (facts.total >= 5 && facts.missingElements.length > 0) {
    const element = facts.missingElements[0]!;
    return `${capitalize(ELEMENT_VOICE[element].practice)}${tail}`;
  }

  const spreadAction = SPREAD_ACTIONS[spread.id];
  if (spreadAction) return `${spreadAction}${tail}`;

  if (facts.dominantElement) {
    return `${capitalize(ELEMENT_VOICE[facts.dominantElement].practice)}${tail}`;
  }

  return `Choose the position you resisted most, and write one honest sentence about what it asks of you. Then do the smallest version of it.${tail}`;
}
