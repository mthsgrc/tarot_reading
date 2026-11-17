import {
  parseJournal,
  removeJournalEntry,
  serializeJournal,
  upsertJournalEntry,
  type JournalEntry,
} from "../domain/reading/journal";

export const JOURNAL_STORAGE_KEY = "thoth-tarot:journal:v1";

export type JournalSaveStatus = "saved" | "invalid" | "error";

export function loadJournal(): JournalEntry[] {
  try {
    return parseJournal(window.localStorage.getItem(JOURNAL_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function saveJournalEntry(params: URLSearchParams): JournalSaveStatus {
  try {
    const entries = upsertJournalEntry(loadJournal(), params, new Date().toISOString());
    if (!entries) {
      return "invalid";
    }

    window.localStorage.setItem(JOURNAL_STORAGE_KEY, serializeJournal(entries));
    return "saved";
  } catch {
    return "error";
  }
}

/** Returns the remaining entries, or null when browser storage rejects the write. */
export function deleteJournalEntry(id: string): JournalEntry[] | null {
  try {
    const entries = removeJournalEntry(loadJournal(), id);
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, serializeJournal(entries));
    return entries;
  } catch {
    return null;
  }
}

export function clearJournal(): boolean {
  try {
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, serializeJournal([]));
    return true;
  } catch {
    return false;
  }
}
