import type { Element, NumberRank, Sephira } from "../domain/types";

export const SEPHIRA_THEMES: Record<Sephira, string> = {
  kether: "Pure being, the point before form, the crown of the Tree.",
  chokmah: "Dynamic wisdom, the first flash of creative force.",
  binah: "Understanding, form, the womb that receives and shapes.",
  chesed: "Mercy, expansion, generosity, the law that builds.",
  geburah: "Severity, restriction, discipline, the necessary cutting.",
  tiphareth: "Beauty, harmony, the solar heart and the harmonized self.",
  netzach: "Victory, desire, emotion, art, and the vitality that persists.",
  hod: "Splendour, intellect, language, and the architecture of thought.",
  yesod: "Foundation, imagination, the subconscious root of manifestation.",
  malkuth: "Kingdom, the body, the earth, and the place where it becomes real.",
};

export const NUMBER_NOTES: ReadonlyArray<{
  rank: NumberRank;
  note: string;
}> = [
  { rank: "Ace", note: "The root or seed of the element." },
  { rank: "Two", note: "Polarity, choice, the first relationship." },
  { rank: "Three", note: "The first stable form; birth and growth." },
  { rank: "Four", note: "Stability, structure, and the risk of stagnation." },
  { rank: "Five", note: "Disruption, conflict, and necessary change." },
  { rank: "Six", note: "Harmony, balance, and the heart of the cycle." },
  { rank: "Seven", note: "Desire, testing, and the strain of manifestation." },
  { rank: "Eight", note: "Movement, skill, and the acceleration of the current." },
  { rank: "Nine", note: "Culmination, fullness, and the last stage before the end." },
  { rank: "Ten", note: "Completion, the return to the world, the end of the cycle." },
];

export const NUMBER_NOTE_BY_RANK = Object.fromEntries(
  NUMBER_NOTES.map(({ rank, note }) => [rank, note]),
) as Record<NumberRank, string>;

export const ELEMENT_PRACTICE: ReadonlyArray<{
  element: Element;
  suit: string;
  theme: string;
  question: string;
}> = [
  {
    element: "Fire",
    suit: "Wands",
    theme: "Will, creativity, initiative, courage.",
    question: "What wants to begin or burn?",
  },
  {
    element: "Water",
    suit: "Cups",
    theme: "Love, feeling, memory, receptivity.",
    question: "What is moving beneath the surface?",
  },
  {
    element: "Air",
    suit: "Swords",
    theme: "Mind, language, analysis, conflict.",
    question: "What needs to be named clearly?",
  },
  {
    element: "Earth",
    suit: "Disks",
    theme: "Body, work, resources, manifestation.",
    question: "What must be built or tended?",
  },
];

export const ELEMENT_PRACTICE_BY_ELEMENT = Object.fromEntries(
  ELEMENT_PRACTICE.map((item) => [item.element, item]),
) as Record<Element, (typeof ELEMENT_PRACTICE)[number]>;
