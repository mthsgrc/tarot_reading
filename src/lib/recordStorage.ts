import {
  RECORD_MAX_ENTRIES,
  addRecordEntry,
  createRecordEntry,
  deleteRecordEntry,
  parseRecordEntries,
  serializeRecordEntries,
  type MagicalRecordEntry,
  type RecordDraft,
} from "../domain/chaos/record";
import { createId } from "./createId";

export const RECORD_STORAGE_KEY = "thoth-tarot:chaos-record:v1";

export type SaveRecordResult =
  | { status: "saved"; entries: MagicalRecordEntry[]; entry: MagicalRecordEntry }
  | { status: "invalid" }
  | { status: "full" }
  | { status: "error" };

export function loadRecordEntries(): MagicalRecordEntry[] {
  try {
    return parseRecordEntries(window.localStorage.getItem(RECORD_STORAGE_KEY));
  } catch {
    return [];
  }
}

function writeRecordEntries(entries: readonly MagicalRecordEntry[]): boolean {
  try {
    window.localStorage.setItem(RECORD_STORAGE_KEY, serializeRecordEntries(entries));
    return true;
  } catch {
    return false;
  }
}

export function addStoredRecord(
  draft: RecordDraft,
  now = new Date().toISOString(),
): SaveRecordResult {
  const current = loadRecordEntries();

  if (current.length >= RECORD_MAX_ENTRIES) {
    return { status: "full" };
  }

  const entry = createRecordEntry(draft, createId("record"), now);
  if (!entry) {
    return { status: "invalid" };
  }

  const next = addRecordEntry(current, entry);
  return writeRecordEntries(next)
    ? { status: "saved", entries: next, entry }
    : { status: "error" };
}

export function deleteStoredRecord(id: string): MagicalRecordEntry[] | null {
  const next = deleteRecordEntry(loadRecordEntries(), id);
  return writeRecordEntries(next) ? next : null;
}
