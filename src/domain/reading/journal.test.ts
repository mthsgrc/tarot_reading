import { describe, expect, it } from "vitest";
import { ALL_CARDS } from "../../data/cards";
import { SPREADS } from "../../data/spreads";
import { drawCards, seededRandom } from "../deck";
import {
  JOURNAL_FILE_VERSION,
  JOURNAL_MAX_ENTRIES,
  parseJournal,
  removeJournalEntry,
  serializeJournal,
  upsertJournalEntry,
  type JournalEntry,
} from "./journal";
import { buildShareParams } from "./share";

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

function entryFor(
  params: URLSearchParams,
  savedAt = "2026-11-17T12:00:00.000Z",
): JournalEntry {
  const id = params.toString();
  return { id, savedAt, params: id };
}

function fileWith(entries: unknown, version = JOURNAL_FILE_VERSION) {
  return JSON.stringify({ version, entries });
}

describe("reading journal data", () => {
  it("round-trips a saved reading through serialization", () => {
    const entry = entryFor(paramsFor());

    expect(parseJournal(serializeJournal([entry]))).toEqual([entry]);
  });

  it("treats missing or malformed storage as empty", () => {
    expect(parseJournal(null)).toEqual([]);
    expect(parseJournal("")).toEqual([]);
    expect(parseJournal("not json")).toEqual([]);
    expect(parseJournal("null")).toEqual([]);
    expect(parseJournal(JSON.stringify({ version: 1 }))).toEqual([]);
    expect(parseJournal(fileWith([], 2))).toEqual([]);
    expect(parseJournal(fileWith("nope"))).toEqual([]);
  });

  it("drops entries with invalid timestamps, ids, or readings", () => {
    const params = paramsFor();
    const valid = entryFor(params);

    const parsed = parseJournal(
      fileWith([
        valid,
        { ...valid, savedAt: "not a date" },
        { ...valid, id: "different" },
        { ...valid, params: "v=1&spread=unknown&cards=nope.u" },
        { id: 7, savedAt: valid.savedAt, params: valid.params },
        null,
      ]),
    );

    expect(parsed).toEqual([valid]);
  });

  it("keeps the first copy of a duplicated entry", () => {
    const params = paramsFor();
    const first = entryFor(params, "2026-11-17T12:00:00.000Z");
    const later = entryFor(params, "2026-11-18T12:00:00.000Z");

    expect(parseJournal(fileWith([first, later]))).toEqual([first]);
  });

  it("caps the journal at the newest entries", () => {
    let entries: JournalEntry[] = [];

    for (let index = 0; index < JOURNAL_MAX_ENTRIES + 5; index += 1) {
      entries = upsertJournalEntry(
        entries,
        paramsFor(`Question ${index}`),
        new Date(Date.UTC(2026, 10, 17, 12, 0, index)).toISOString(),
      );
    }

    const parsed = parseJournal(serializeJournal(entries));

    expect(parsed).toHaveLength(JOURNAL_MAX_ENTRIES);
    expect(parsed[0]?.params).toBe(
      paramsFor(`Question ${JOURNAL_MAX_ENTRIES + 4}`).toString(),
    );
  });

  it("replaces an earlier save and moves it to the front", () => {
    const first = paramsFor("First question");
    const second = paramsFor("Second question");

    let entries = upsertJournalEntry([], first, "2026-11-17T10:00:00.000Z");
    entries = upsertJournalEntry(entries, second, "2026-11-17T11:00:00.000Z");
    entries = upsertJournalEntry(entries, first, "2026-11-17T12:00:00.000Z");

    expect(entries.map((entry) => entry.params)).toEqual([
      first.toString(),
      second.toString(),
    ]);
    expect(entries[0]?.savedAt).toBe("2026-11-17T12:00:00.000Z");
  });

  it("refuses to save an unreadable reading", () => {
    const invalid = new URLSearchParams("v=1&spread=unknown&cards=nope.u");
    const entries = [entryFor(paramsFor())];

    expect(upsertJournalEntry(entries, invalid, "2026-11-17T12:00:00.000Z")).toEqual(
      entries,
    );
  });

  it("removes one entry without touching the rest", () => {
    const first = entryFor(paramsFor("First question"));
    const second = entryFor(paramsFor("Second question"));

    expect(removeJournalEntry([first, second], first.id)).toEqual([second]);
  });
});
