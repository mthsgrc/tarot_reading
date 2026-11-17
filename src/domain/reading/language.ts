import type { Element } from "../types";
import type { ReadingLens } from "./types";

export interface ElementVoice {
  /** What the element is about, in a phrase. */
  noun: string;
  /** The gift of a balanced expression. */
  gift: string;
  /** A question the element asks. */
  question: string;
  /** How the element looks when it is blocked or excessive. */
  excess: string;
  /** One grounded practice for the element. */
  practice: string;
}

export const ELEMENT_VOICE: Record<Element, ElementVoice> = {
  Fire: {
    noun: "will, initiative, and creative heat",
    gift: "courage",
    question: "What wants to begin?",
    excess: "burnout, or force without a vessel",
    practice: "give the fire a vessel: one concrete action, and one limit.",
  },
  Water: {
    noun: "feeling, memory, and connection",
    gift: "empathy",
    question: "What is moving beneath the surface?",
    excess: "flooding, merging, or feeling without a boundary",
    practice: "name the feeling before it becomes a decision.",
  },
  Air: {
    noun: "thought, language, and perspective",
    gift: "clarity",
    question: "What needs to be named clearly?",
    excess: "analysis that never touches the ground",
    practice: "write the question down; the mind needs a page, not another loop.",
  },
  Earth: {
    noun: "body, work, resources, and time",
    gift: "patience",
    question: "What must be built or tended?",
    excess: "inertia, or holding on after the season has changed",
    practice: "tend the practical thing in front of you.",
  },
};

export const LENS_LABELS: Record<ReadingLens, string> = {
  general: "Open question",
  work: "Will and work",
  love: "Love and relationship",
  inner: "Inner work",
};

export const LENS_FRAMES: Record<ReadingLens, string> = {
  general:
    "No single frame is imposed, so read the cards where they land and let the question stay open.",
  work: "The reading is heard through work: effort, exchange, and the shape of your will in the world.",
  love: "The reading is heard through relationship: desire, recognition, and the space between two people.",
  inner:
    "The reading is heard through inner work: what is becoming conscious, and what is being asked of you.",
};

export interface ElementRelation {
  kind: "same" | "complement" | "tension" | "different";
  line: string;
  advice: string;
}

const COMPLEMENTS = new Set(["Air|Fire", "Fire|Air", "Earth|Water", "Water|Earth"]);
const TENSIONS = new Set(["Fire|Water", "Water|Fire", "Air|Earth", "Earth|Air"]);

function elementPair(first: Element, second: Element): string {
  return `${first}|${second}`;
}

export function describeElementRelation(
  first: Element,
  second: Element,
): ElementRelation {
  if (first === second) {
    return {
      kind: "same",
      line: `Both are ${first}: the same current is operating in two places.`,
      advice: "Read them as one impulse expressed twice, not as simple confirmation.",
    };
  }

  const pair = elementPair(first, second);

  if (COMPLEMENTS.has(pair)) {
    if (first === "Fire" || second === "Fire") {
      return {
        kind: "complement",
        line: "Air feeds Fire: vision and will are made for each other.",
        advice:
          "Let the idea give the impulse a direction, and let the impulse keep it alive.",
      };
    }

    return {
      kind: "complement",
      line: "Water and Earth make fertile ground: feeling and form can support each other.",
      advice: "Let one give shape to the other rather than choosing between them.",
    };
  }

  if (TENSIONS.has(pair)) {
    if (first === "Fire" || second === "Fire") {
      return {
        kind: "tension",
        line: "Fire and Water meet as steam: will and feeling are both real, but they do not move at the same speed.",
        advice: "Name the tension instead of resolving it too quickly.",
      };
    }

    return {
      kind: "tension",
      line: "Air and Earth meet as plan and ground: the idea and the material conditions are not yet speaking the same language.",
      advice:
        "Translate the plan into one physical step before asking the world to agree.",
    };
  }

  if (first === "Fire" || second === "Fire") {
    return {
      kind: "different",
      line: "Fire and Earth move at different speeds: the spark wants to rise, while the ground wants to hold.",
      advice: "Give the fire a body without asking it to become heavy.",
    };
  }

  return {
    kind: "different",
    line: "Water and Air make mist: feeling and thought are close, but neither is fully clear yet.",
    advice: "Let the feeling inform the thought, and the thought give the feeling words.",
  };
}
