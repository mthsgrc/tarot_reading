import { describe, expect, it } from "vitest";
import { seededRandom } from "./deck";
import { createStudyQuestion, type StudyTopic } from "./study";
import { SEPHIRA_BY_ID } from "./tree";

const TOPICS: readonly StudyTopic[] = [
  "element",
  "hebrew-letter",
  "tree-path",
  "gd-title",
  "sephira",
  "court-element",
];

describe("createStudyQuestion", () => {
  it("builds four unique options that include the answer", () => {
    const random = seededRandom(2026);

    for (let index = 0; index < 400; index += 1) {
      const question = createStudyQuestion(random);

      expect(question.options).toHaveLength(4);
      expect(new Set(question.options).size).toBe(4);
      expect(question.options).toContain(question.answer);
      expect(question.prompt).toContain(question.card.name);
      expect(question.explanation.length).toBeGreaterThan(0);
    }
  });

  it("matches each answer to the card and topic", () => {
    const random = seededRandom(99);

    for (let index = 0; index < 400; index += 1) {
      const question = createStudyQuestion(random);

      switch (question.topic) {
        case "element":
          expect(question.answer).toBe(question.card.element);
          break;

        case "hebrew-letter": {
          expect(question.card.kind).toBe("major");
          if (question.card.kind !== "major") break;
          expect(question.answer).toBe(question.card.hebrewLetter);
          break;
        }

        case "tree-path": {
          expect(question.card.kind).toBe("major");
          if (question.card.kind !== "major") break;
          expect(question.answer).toContain(String(question.card.path.number));
          expect(question.answer).toContain(SEPHIRA_BY_ID[question.card.path.from].name);
          expect(question.answer).toContain(SEPHIRA_BY_ID[question.card.path.to].name);
          break;
        }

        case "gd-title": {
          expect(question.card.kind).toBe("major");
          if (question.card.kind !== "major") break;
          expect(question.answer).toBe(question.card.gdTitle);
          break;
        }

        case "sephira": {
          expect(question.card.kind).toBe("minor");
          if (question.card.kind !== "minor") break;
          const sephira = SEPHIRA_BY_ID[question.card.sephira];
          expect(question.answer).toBe(`${sephira.name} — ${sephira.title}`);
          break;
        }

        case "court-element": {
          expect(question.card.kind).toBe("court");
          if (question.card.kind !== "court") break;
          expect(question.answer).toBe(question.card.courtElement);
          break;
        }
      }
    }
  });

  it("reaches every topic across a run", () => {
    const random = seededRandom(7);
    const seen = new Set<StudyTopic>();

    for (let index = 0; index < 600; index += 1) {
      seen.add(createStudyQuestion(random).topic);
    }

    expect([...seen].sort()).toEqual([...TOPICS].sort());
  });

  it("is deterministic for a given seed", () => {
    const first = seededRandom(42);
    const second = seededRandom(42);

    for (let index = 0; index < 50; index += 1) {
      const a = createStudyQuestion(first);
      const b = createStudyQuestion(second);

      expect(a.id).toBe(b.id);
      expect(a.answer).toBe(b.answer);
      expect(a.options).toEqual(b.options);
    }
  });
});
