import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ALL_CARDS } from "../data/cards";
import { SPREADS } from "../data/spreads";
import { drawCards, seededRandom } from "../domain/deck";
import { buildShareParams } from "../domain/reading/share";
import {
  JOURNAL_STORAGE_KEY,
  clearJournal,
  deleteJournalEntry,
  loadJournal,
  saveJournalEntry,
} from "./journalStorage";

function triadSpread() {
  const spread = SPREADS.find((item) => item.id === "thelema-triad");
  if (!spread) {
    throw new Error("Missing thelema-triad spread");
  }
  return spread;
}

const SPREAD = triadSpread();

const DRAWN = drawCards(SPREAD, { shadow: true }, ALL_CARDS, seededRandom(7));

function paramsFor(question = "What should I notice?") {
  return buildShareParams({
    spread: SPREAD,
    drawn: DRAWN,
    question,
    shadow: true,
  });
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("journal storage", () => {
  it("saves and reloads a reading", () => {
    const params = paramsFor();

    expect(saveJournalEntry(params)).toBe(true);

    const entries = loadJournal();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.params).toBe(params.toString());
  });

  it("replaces a repeat save instead of duplicating it", () => {
    saveJournalEntry(paramsFor("First"));
    saveJournalEntry(paramsFor("Second"));
    saveJournalEntry(paramsFor("First"));

    expect(loadJournal()).toHaveLength(2);
    expect(loadJournal()[0]?.params).toBe(paramsFor("First").toString());
  });

  it("ignores corrupt stored data", () => {
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, "{not json");

    expect(loadJournal()).toEqual([]);
  });

  it("deletes one reading and clears the journal", () => {
    saveJournalEntry(paramsFor("First"));
    saveJournalEntry(paramsFor("Second"));

    const remaining = deleteJournalEntry(loadJournal()[0]!.id);
    expect(remaining).toHaveLength(1);
    expect(loadJournal()).toHaveLength(1);

    expect(clearJournal()).toBe(true);
    expect(loadJournal()).toEqual([]);
  });

  it("reports when browser storage rejects a write", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    expect(saveJournalEntry(paramsFor())).toBe(false);
    expect(deleteJournalEntry("anything")).toBeNull();
    expect(clearJournal()).toBe(false);
  });
});
