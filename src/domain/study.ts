import { ALL_CARDS } from "../data/cards";
import { shuffle, type RandomSource } from "./deck";
import { ELEMENTS } from "./reading/positions";
import { SEPHIRA_BY_ID, SEPHIROTH } from "./tree";
import type { CourtCard, MajorCard, Sephira, TarotCard } from "./types";

export type StudyTopic =
  "element" | "hebrew-letter" | "tree-path" | "gd-title" | "sephira" | "court-element";

export interface StudyQuestion {
  /** Stable for a card and topic, so React can key the question. */
  id: string;
  topic: StudyTopic;
  card: TarotCard;
  prompt: string;
  answer: string;
  options: string[];
  explanation: string;
}

const MAJOR_CARDS = ALL_CARDS.filter((card): card is MajorCard => card.kind === "major");
const COURT_CARDS = ALL_CARDS.filter((card): card is CourtCard => card.kind === "court");

function sephiraLabel(id: Sephira): string {
  const sephira = SEPHIRA_BY_ID[id];
  return `${sephira.name} — ${sephira.title}`;
}

function pathLabel(card: MajorCard): string {
  const from = SEPHIRA_BY_ID[card.path.from].name;
  const to = SEPHIRA_BY_ID[card.path.to].name;
  return `${card.path.number} · ${from} → ${to}`;
}

const HEBREW_LETTERS = MAJOR_CARDS.map((card) => card.hebrewLetter);
const GOLDEN_DAWN_TITLES = MAJOR_CARDS.map((card) => card.gdTitle);
const TREE_PATHS = MAJOR_CARDS.map(pathLabel);
const SEPHIRA_LABELS = SEPHIROTH.map((sephira) => sephiraLabel(sephira.id));
const COURT_ELEMENTS = [...new Set(COURT_CARDS.map((card) => card.courtElement))];

const TOPICS_BY_KIND: Record<TarotCard["kind"], readonly StudyTopic[]> = {
  major: ["element", "hebrew-letter", "tree-path", "gd-title"],
  minor: ["element", "sephira"],
  court: ["element", "court-element"],
};

interface QuestionContent {
  prompt: string;
  answer: string;
  pool: readonly string[];
  explanation: string;
}

function contentFor(topic: StudyTopic, card: TarotCard): QuestionContent {
  switch (topic) {
    case "element":
      return {
        prompt: `Which element belongs to ${card.name}?`,
        answer: card.element,
        pool: ELEMENTS,
        explanation: `${card.name} is attributed to ${card.element}.`,
      };

    case "hebrew-letter": {
      if (card.kind !== "major") break;

      return {
        prompt: `Which Hebrew letter is attributed to ${card.name}?`,
        answer: card.hebrewLetter,
        pool: HEBREW_LETTERS,
        explanation: `${card.name} carries ${card.hebrewLetter} (${card.hebrewLetterChar}).`,
      };
    }

    case "tree-path": {
      if (card.kind !== "major") break;

      return {
        prompt: `Which path on the Tree of Life carries ${card.name}?`,
        answer: pathLabel(card),
        pool: TREE_PATHS,
        explanation: `${card.name} travels path ${card.path.number}, joining ${
          SEPHIRA_BY_ID[card.path.from].name
        } and ${SEPHIRA_BY_ID[card.path.to].name}.`,
      };
    }

    case "gd-title": {
      if (card.kind !== "major") break;

      return {
        prompt: `Which Golden Dawn title belongs to ${card.name}?`,
        answer: card.gdTitle,
        pool: GOLDEN_DAWN_TITLES,
        explanation: `Its Golden Dawn title is “${card.gdTitle}.”`,
      };
    }

    case "sephira": {
      if (card.kind !== "minor") break;

      return {
        prompt: `Which Sephira does ${card.name} sit in?`,
        answer: sephiraLabel(card.sephira),
        pool: SEPHIRA_LABELS,
        explanation: `${card.name} sits in ${sephiraLabel(card.sephira)}.`,
      };
    }

    case "court-element": {
      if (card.kind !== "court") break;

      return {
        prompt: `What is the elemental nature of ${card.name}?`,
        answer: card.courtElement,
        pool: COURT_ELEMENTS,
        explanation: `${card.name} is ${card.courtElement}.`,
      };
    }
  }

  throw new Error(`Study topic "${topic}" does not apply to a ${card.kind} card.`);
}

function pick<T>(values: readonly T[], random: RandomSource): T {
  const index = Math.min(values.length - 1, Math.floor(random() * values.length));
  return values[index]!;
}

function buildOptions(
  answer: string,
  pool: readonly string[],
  random: RandomSource,
): string[] {
  const distractors = shuffle(
    pool.filter((value) => value !== answer),
    random,
  ).slice(0, 3);

  return shuffle([answer, ...distractors], random);
}

export function createStudyQuestion(random: RandomSource = Math.random): StudyQuestion {
  const card = pick(ALL_CARDS, random);
  const topic = pick(TOPICS_BY_KIND[card.kind], random);
  const content = contentFor(topic, card);

  return {
    id: `${topic}:${card.id}`,
    topic,
    card,
    prompt: content.prompt,
    answer: content.answer,
    options: buildOptions(content.answer, content.pool, random),
    explanation: content.explanation,
  };
}
