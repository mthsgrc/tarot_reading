import { describe, expect, it } from "vitest";
import {
  RECORD_FILE_VERSION,
  RECORD_KINDS,
  RECORD_MAX_ENTRIES,
  RECORD_TEXT_MAX,
  RECORD_TITLE_MAX,
  addRecordEntry,
  createRecordEntry,
  deleteRecordEntry,
  hasRecordErrors,
  isRecordKind,
  normalizeRecordDraft,
  parseRecordEntries,
  recordKindLabel,
  serializeRecordEntries,
  sortRecordEntries,
  validateRecordDraft,
  type MagicalRecordEntry,
  type RecordDraft,
} from "./record";

const CREATED_AT = "2026-11-19T12:00:00.000Z";

function draft(overrides: Partial<RecordDraft> = {}): RecordDraft {
  return {
    title: "A sigil for the next step",
    kind: "sigil",
    date: "2026-11-19",
    practice: "Drew the sigil and sat with it for five minutes.",
    result: "I noticed I was less rushed afterwards.",
    ...overrides,
  };
}

function entry(index: number, overrides: Partial<RecordDraft> = {}): MagicalRecordEntry {
  return createRecordEntry(
    draft({ title: `Entry ${index}`, ...overrides }),
    `id-${index}`,
    CREATED_AT,
  )!;
}

describe("record drafts", () => {
  it("normalizes the title and preserves text line breaks", () => {
    expect(
      normalizeRecordDraft({
        title: "  A   sigil ",
        kind: "sigil",
        date: " 2026-11-19 ",
        practice: "  Drew it.\r\nSat with it.  ",
        result: " Nothing\tchanged. ",
      }),
    ).toEqual({
      title: "A sigil",
      kind: "sigil",
      date: "2026-11-19",
      practice: "Drew it.\nSat with it.",
      result: "Nothing\tchanged.",
    });
  });

  it("requires a title, a valid date, and a practice", () => {
    const missing = validateRecordDraft(draft({ title: "", date: "", practice: "" }));

    expect(hasRecordErrors(missing)).toBe(true);
    expect(missing.title).toMatch(/title/i);
    expect(missing.date).toMatch(/date/i);
    expect(missing.practice).toMatch(/what you did/i);
    expect(validateRecordDraft(draft({ date: "2026-02-30" })).date).toMatch(
      /valid date/i,
    );
  });

  it("enforces title and text limits", () => {
    expect(
      validateRecordDraft(draft({ title: "x".repeat(RECORD_TITLE_MAX + 1) })).title,
    ).toMatch(/characters or fewer/i);
    expect(
      validateRecordDraft(draft({ result: "x".repeat(RECORD_TEXT_MAX + 1) })).result,
    ).toMatch(/characters or fewer/i);
  });

  it("knows the available kinds", () => {
    expect(isRecordKind("working")).toBe(true);
    expect(isRecordKind("ritual")).toBe(false);
    expect(recordKindLabel("cut-up")).toBe("Cut-up");
    expect(RECORD_KINDS.map((kind) => kind.id)).toContain("note");
  });
});

describe("createRecordEntry", () => {
  it("builds a normalized entry", () => {
    const created = createRecordEntry(
      draft({ title: "  A sigil  ", practice: "  Drew it.  " }),
      "record-1",
      CREATED_AT,
    );

    expect(created).toEqual({
      id: "record-1",
      title: "A sigil",
      kind: "sigil",
      date: "2026-11-19",
      practice: "Drew it.",
      result: "I noticed I was less rushed afterwards.",
      createdAt: CREATED_AT,
    });
  });

  it("refuses invalid drafts, ids, and timestamps", () => {
    expect(createRecordEntry(draft({ title: "" }), "id", CREATED_AT)).toBeNull();
    expect(createRecordEntry(draft(), "", CREATED_AT)).toBeNull();
    expect(createRecordEntry(draft(), "id", "not-a-date")).toBeNull();
  });
});

describe("record storage shape", () => {
  it("round-trips entries", () => {
    const entries = [entry(1), entry(2)];

    expect(parseRecordEntries(serializeRecordEntries(entries))).toEqual(entries);
  });

  it("ignores corrupt files and wrong versions", () => {
    expect(parseRecordEntries(null)).toEqual([]);
    expect(parseRecordEntries("{")).toEqual([]);
    expect(parseRecordEntries(JSON.stringify({ version: 2, entries: [] }))).toEqual([]);
    expect(parseRecordEntries(JSON.stringify({ version: RECORD_FILE_VERSION }))).toEqual(
      [],
    );
  });

  it("drops invalid and duplicate entries", () => {
    const valid = entry(1);
    const raw = JSON.stringify({
      version: RECORD_FILE_VERSION,
      entries: [
        valid,
        valid,
        { ...valid, id: "bad-title", title: "" },
        { ...valid, id: "bad-kind", kind: "ritual" },
        { ...valid, id: "bad-date", date: "2026-02-30" },
        { ...valid, id: "bad-practice", practice: " " },
        { ...valid, id: "bad-created", createdAt: "yesterday" },
      ],
    });

    expect(parseRecordEntries(raw)).toEqual([valid]);
  });

  it("caps a hand-edited file at the record limit", () => {
    const entries = Array.from({ length: RECORD_MAX_ENTRIES + 5 }, (_, index) =>
      entry(index),
    );
    const raw = JSON.stringify({ version: RECORD_FILE_VERSION, entries });

    expect(parseRecordEntries(raw)).toHaveLength(RECORD_MAX_ENTRIES);
  });

  it("adds new entries at the front and replaces a duplicate id", () => {
    const first = entry(1);
    const second = entry(2);

    expect(addRecordEntry([first], second).map((item) => item.id)).toEqual([
      second.id,
      first.id,
    ]);
    expect(
      addRecordEntry([first, second], { ...first, title: "Renamed" }).map(
        (item) => item.title,
      ),
    ).toEqual(["Renamed", second.title]);
  });

  it("deletes entries", () => {
    const first = entry(1);
    const second = entry(2);

    expect(deleteRecordEntry([first, second], first.id)).toEqual([second]);
  });
});

describe("record ordering", () => {
  it("sorts by working date, then by when the entry was written", () => {
    const first = createRecordEntry(
      draft({ title: "First" }),
      "first",
      "2026-11-19T10:00:00.000Z",
    )!;
    const second = createRecordEntry(
      draft({ title: "Second", date: "2026-11-20" }),
      "second",
      "2026-11-19T09:00:00.000Z",
    )!;
    const third = createRecordEntry(
      draft({ title: "Third" }),
      "third",
      "2026-11-19T11:00:00.000Z",
    )!;

    expect(sortRecordEntries([first, second, third]).map((item) => item.title)).toEqual([
      "Second",
      "Third",
      "First",
    ]);
    expect([first, second, third].map((item) => item.title)).toEqual([
      "First",
      "Second",
      "Third",
    ]);
  });
});
