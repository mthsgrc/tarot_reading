import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  RECORD_MAX_ENTRIES,
  createRecordEntry,
  serializeRecordEntries,
  type RecordDraft,
} from "../domain/chaos/record";
import {
  RECORD_STORAGE_KEY,
  addStoredRecord,
  deleteStoredRecord,
  loadRecordEntries,
} from "./recordStorage";

const CREATED_AT = "2026-11-19T12:00:00.000Z";

function draft(overrides: Partial<RecordDraft> = {}): RecordDraft {
  return {
    title: "A sigil for the next step",
    kind: "sigil",
    date: "2026-11-19",
    practice: "Drew the sigil and sat with it.",
    result: "I noticed I was less rushed.",
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("record storage", () => {
  it("adds a normalized entry and loads it back", () => {
    const result = addStoredRecord(draft({ title: "  A sigil  " }), CREATED_AT);

    expect(result.status).toBe("saved");
    if (result.status !== "saved") {
      return;
    }

    expect(result.entry.title).toBe("A sigil");
    expect(result.entries).toHaveLength(1);
    expect(loadRecordEntries()).toEqual(result.entries);
    expect(window.localStorage.getItem(RECORD_STORAGE_KEY)).toContain("A sigil");
  });

  it("refuses an invalid draft without writing", () => {
    expect(addStoredRecord(draft({ practice: " " }), CREATED_AT)).toEqual({
      status: "invalid",
    });
    expect(loadRecordEntries()).toEqual([]);
  });

  it("refuses to add beyond the entry cap", () => {
    const entries = Array.from({ length: RECORD_MAX_ENTRIES }, (_, index) =>
      createRecordEntry(draft({ title: `Entry ${index}` }), `id-${index}`, CREATED_AT)!,
    );
    window.localStorage.setItem(RECORD_STORAGE_KEY, serializeRecordEntries(entries));

    expect(addStoredRecord(draft({ title: "One more" }), CREATED_AT)).toEqual({
      status: "full",
    });
    expect(loadRecordEntries()).toHaveLength(RECORD_MAX_ENTRIES);
  });

  it("deletes an entry", () => {
    const first = addStoredRecord(draft({ title: "First" }), CREATED_AT);
    addStoredRecord(draft({ title: "Second" }), CREATED_AT);
    if (first.status !== "saved") {
      throw new Error("Could not create fixture");
    }

    const remaining = deleteStoredRecord(first.entry.id);

    expect(remaining).toHaveLength(1);
    expect(remaining?.[0]?.title).toBe("Second");
    expect(loadRecordEntries()).toHaveLength(1);
  });

  it("reports a storage failure without losing existing entries", () => {
    const first = addStoredRecord(draft({ title: "First" }), CREATED_AT);
    if (first.status !== "saved") {
      throw new Error("Could not create fixture");
    }

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    expect(addStoredRecord(draft({ title: "Second" }), CREATED_AT)).toEqual({
      status: "error",
    });
    expect(deleteStoredRecord(first.entry.id)).toBeNull();
    expect(loadRecordEntries()).toHaveLength(1);
  });

  it("loads an empty list when storage is corrupt", () => {
    window.localStorage.setItem(RECORD_STORAGE_KEY, "{not json");
    expect(loadRecordEntries()).toEqual([]);
  });
});
