import { describe, expect, it } from "vitest";
import { RECORD_TEXT_MAX } from "./record";
import {
  WORKING_ACTION_MAX,
  WORKING_CLOSING_MAX,
  WORKING_INTENTION_MAX,
  WORKING_PREPARATION_MAX,
  WORKING_REFLECTION_MAX,
  WORKING_TITLE_MAX,
  composeWorkingPractice,
  hasWorkingErrors,
  normalizeWorkingDraft,
  validateWorkingDraft,
  workingToRecordDraft,
  type WorkingDraft,
} from "./working";

function draft(overrides: Partial<WorkingDraft> = {}): WorkingDraft {
  return {
    title: "A working for the next step",
    date: "2026-11-19",
    intention: "I want to notice the next useful step.",
    preparation: "Put the phone away and clear the desk.",
    action: "Sit still for five minutes and return to the phrase.",
    closing: "Stand up, drink water, and write one sentence.",
    reflection: "I noticed the phrase kept changing.",
    ...overrides,
  };
}

describe("working drafts", () => {
  it("normalizes the title, date, and multiline text", () => {
    expect(
      normalizeWorkingDraft({
        title: "  A   working ",
        date: " 2026-11-19 ",
        intention: "  Notice the next step.  ",
        preparation: " Clear\r\nthe desk. ",
        action: " Sit still.\nReturn. ",
        closing: " Stand up. ",
        reflection: "  Nothing yet. ",
      }),
    ).toEqual({
      title: "A working",
      date: "2026-11-19",
      intention: "Notice the next step.",
      preparation: "Clear\nthe desk.",
      action: "Sit still.\nReturn.",
      closing: "Stand up.",
      reflection: "Nothing yet.",
    });
  });

  it("requires a title, date, intention, action, and closing", () => {
    const errors = validateWorkingDraft(
      draft({ title: "", date: "", intention: "", action: "", closing: "" }),
    );

    expect(hasWorkingErrors(errors)).toBe(true);
    expect(errors.title).toMatch(/title/i);
    expect(errors.date).toMatch(/date/i);
    expect(errors.intention).toMatch(/intention/i);
    expect(errors.action).toMatch(/what you will do/i);
    expect(errors.closing).toMatch(/close/i);
  });

  it("validates the date and length limits", () => {
    expect(validateWorkingDraft(draft({ date: "2026-02-30" })).date).toMatch(
      /valid date/i,
    );
    expect(
      validateWorkingDraft(draft({ title: "x".repeat(WORKING_TITLE_MAX + 1) })).title,
    ).toMatch(/characters or fewer/i);
    expect(
      validateWorkingDraft(draft({ reflection: "x".repeat(WORKING_REFLECTION_MAX + 1) }))
        .reflection,
    ).toMatch(/characters or fewer/i);
  });
});

describe("composeWorkingPractice", () => {
  it("writes labelled sections in sequence", () => {
    expect(composeWorkingPractice(draft())).toBe(
      [
        "Intention:\nI want to notice the next useful step.",
        "Preparation:\nPut the phone away and clear the desk.",
        "Action:\nSit still for five minutes and return to the phrase.",
        "Closing:\nStand up, drink water, and write one sentence.",
      ].join("\n\n"),
    );
  });

  it("omits an empty preparation section", () => {
    expect(composeWorkingPractice(draft({ preparation: " " }))).not.toContain(
      "Preparation:",
    );
  });

  it("keeps the longest allowed draft within one record entry", () => {
    const longest = draft({
      title: "x".repeat(WORKING_TITLE_MAX),
      intention: "i".repeat(WORKING_INTENTION_MAX),
      preparation: "p".repeat(WORKING_PREPARATION_MAX),
      action: "a".repeat(WORKING_ACTION_MAX),
      closing: "c".repeat(WORKING_CLOSING_MAX),
      reflection: "r".repeat(WORKING_REFLECTION_MAX),
    });

    expect(composeWorkingPractice(longest).length).toBeLessThanOrEqual(RECORD_TEXT_MAX);
    expect(workingToRecordDraft(longest).result.length).toBeLessThanOrEqual(
      RECORD_TEXT_MAX,
    );
  });
});

describe("workingToRecordDraft", () => {
  it("maps a working to a Magical Record entry", () => {
    expect(workingToRecordDraft(draft())).toEqual({
      title: "A working for the next step",
      kind: "working",
      date: "2026-11-19",
      practice: composeWorkingPractice(draft()),
      result: "I noticed the phrase kept changing.",
    });
  });
});
