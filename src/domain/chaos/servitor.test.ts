import { describe, expect, it } from "vitest";
import {
  SERVITOR_FILE_VERSION,
  SERVITOR_MAX_RECORDS,
  SERVITOR_NAME_MAX,
  addServitor,
  createServitor,
  deleteServitor,
  hasServitorErrors,
  isReviewDue,
  isValidReviewDate,
  normalizeServitorDraft,
  parseServitors,
  restoreServitor,
  retireServitor,
  serializeServitors,
  validateServitorDraft,
  type Servitor,
  type ServitorDraft,
} from "./servitor";

const CREATED_AT = "2026-11-19T12:00:00.000Z";

function draft(overrides: Partial<ServitorDraft> = {}): ServitorDraft {
  return {
    name: "The Doorkeeper",
    task: "I notice the next small step and take it.",
    form: "A brass key with no lock.",
    reviewOn: "2026-12-01",
    ...overrides,
  };
}

function servitor(index: number): Servitor {
  return createServitor(draft({ name: `Servitor ${index}` }), `id-${index}`, CREATED_AT)!;
}

describe("servitor drafts", () => {
  it("normalizes whitespace without changing empty fields", () => {
    expect(
      normalizeServitorDraft({
        name: "  The   Doorkeeper ",
        task: "Notice\n the next step ",
        form: " ",
        reviewOn: " 2026-12-01 ",
      }),
    ).toEqual({
      name: "The Doorkeeper",
      task: "Notice the next step",
      form: "",
      reviewOn: "2026-12-01",
    });
  });

  it("requires a name and a task", () => {
    const errors = validateServitorDraft(draft({ name: " ", task: "" }));

    expect(hasServitorErrors(errors)).toBe(true);
    expect(errors.name).toMatch(/name/i);
    expect(errors.task).toMatch(/task/i);
  });

  it("validates text length and review dates", () => {
    expect(
      validateServitorDraft(draft({ name: "x".repeat(SERVITOR_NAME_MAX + 1) })).name,
    ).toMatch(/characters or fewer/i);
    expect(validateServitorDraft(draft({ reviewOn: "2026-02-30" })).reviewOn).toMatch(
      /valid date/i,
    );
    expect(validateServitorDraft(draft({ reviewOn: "" })).reviewOn).toBeUndefined();
  });

  it("accepts real leap days and rejects missing ones", () => {
    expect(isValidReviewDate("2024-02-29")).toBe(true);
    expect(isValidReviewDate("2026-02-29")).toBe(false);
    expect(isValidReviewDate("not-a-date")).toBe(false);
  });
});

describe("createServitor", () => {
  it("builds a normalized record", () => {
    const created = createServitor(
      draft({ name: "  The Doorkeeper  " }),
      "servitor-1",
      CREATED_AT,
    );

    expect(created).toEqual({
      id: "servitor-1",
      name: "The Doorkeeper",
      task: "I notice the next small step and take it.",
      form: "A brass key with no lock.",
      reviewOn: "2026-12-01",
      createdAt: CREATED_AT,
      retiredAt: null,
    });
  });

  it("refuses invalid drafts, ids, and timestamps", () => {
    expect(createServitor(draft({ task: "" }), "id", CREATED_AT)).toBeNull();
    expect(createServitor(draft(), "", CREATED_AT)).toBeNull();
    expect(createServitor(draft(), "id", "not-a-date")).toBeNull();
  });
});

describe("servitor storage shape", () => {
  it("round-trips a record file", () => {
    const records = [servitor(1), servitor(2)];

    expect(parseServitors(serializeServitors(records))).toEqual(records);
  });

  it("ignores corrupt files and wrong versions", () => {
    expect(parseServitors(null)).toEqual([]);
    expect(parseServitors("{")).toEqual([]);
    expect(parseServitors(JSON.stringify({ version: 2, entries: [] }))).toEqual([]);
    expect(parseServitors(JSON.stringify({ version: SERVITOR_FILE_VERSION }))).toEqual(
      [],
    );
  });

  it("drops invalid and duplicate entries", () => {
    const valid = servitor(1);
    const raw = JSON.stringify({
      version: SERVITOR_FILE_VERSION,
      entries: [
        valid,
        valid,
        { ...valid, id: "bad-name", name: "" },
        { ...valid, id: "bad-date", reviewOn: "2026-02-30" },
        { ...valid, id: "bad-retired", retiredAt: "yesterday" },
      ],
    });

    expect(parseServitors(raw)).toEqual([valid]);
  });

  it("caps a hand-edited file at the record limit", () => {
    const entries = Array.from({ length: SERVITOR_MAX_RECORDS + 5 }, (_, index) =>
      servitor(index),
    );
    const raw = JSON.stringify({ version: SERVITOR_FILE_VERSION, entries });

    expect(parseServitors(raw)).toHaveLength(SERVITOR_MAX_RECORDS);
  });

  it("adds new records at the front and replaces a duplicate id", () => {
    const first = servitor(1);
    const next = servitor(2);

    expect(addServitor([first], next).map((item) => item.id)).toEqual([
      next.id,
      first.id,
    ]);
    expect(
      addServitor([first, next], { ...first, name: "Renamed" }).map((item) => item.name),
    ).toEqual(["Renamed", next.name]);
  });

  it("retires, restores, and deletes records", () => {
    const first = servitor(1);
    const retired = retireServitor([first], first.id, "2026-11-20T12:00:00.000Z");
    expect(retired[0]?.retiredAt).toBe("2026-11-20T12:00:00.000Z");

    expect(restoreServitor(retired, first.id)[0]?.retiredAt).toBeNull();
    expect(deleteServitor([first], first.id)).toEqual([]);
  });

  it("ignores an invalid retirement timestamp", () => {
    const first = servitor(1);
    const next = retireServitor([first], first.id, "not-a-date");

    expect(next).not.toBe(first);
    expect(next[0]?.retiredAt).toBeNull();
  });
});

describe("review dates", () => {
  it("marks records due on or after their review date", () => {
    expect(isReviewDue("2026-11-19", "2026-11-19")).toBe(true);
    expect(isReviewDue("2026-11-18", "2026-11-19")).toBe(true);
    expect(isReviewDue("2026-11-20", "2026-11-19")).toBe(false);
    expect(isReviewDue("", "2026-11-19")).toBe(false);
  });
});
