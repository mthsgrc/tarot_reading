import { readSharedReading } from "./share";

/**
 * Journal entries reuse the versioned share format, so a saved reading is
 * validated by the same rules as an incoming link and can be reopened without
 * a second serialization format.
 */
export const JOURNAL_FILE_VERSION = 1;
export const JOURNAL_MAX_ENTRIES = 50;
const MAX_PARAMS_LENGTH = 4096;

interface JournalFile {
  version: number;
  entries: JournalEntry[];
}

export interface JournalEntry {
  /** Stable identity: the encoded share parameters. */
  id: string;
  /** ISO timestamp of the most recent save. */
  savedAt: string;
  /** Versioned share parameters that recreate the draw. */
  params: string;
}

function isJournalEntry(value: unknown): value is JournalEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const { id, savedAt, params } = value as Record<string, unknown>;
  if (
    typeof id !== "string" ||
    typeof savedAt !== "string" ||
    typeof params !== "string"
  ) {
    return false;
  }

  if (id !== params || params.length > MAX_PARAMS_LENGTH) {
    return false;
  }

  if (savedAt.length > 40 || Number.isNaN(Date.parse(savedAt))) {
    return false;
  }

  return readSharedReading(new URLSearchParams(params)) !== null;
}

export function parseJournal(raw: string | null): JournalEntry[] {
  if (!raw) {
    return [];
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const { version, entries } = data as Partial<JournalFile>;
  if (version !== JOURNAL_FILE_VERSION || !Array.isArray(entries)) {
    return [];
  }

  const result: JournalEntry[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (!isJournalEntry(entry) || seen.has(entry.id)) {
      continue;
    }

    seen.add(entry.id);
    result.push({ id: entry.id, savedAt: entry.savedAt, params: entry.params });

    if (result.length === JOURNAL_MAX_ENTRIES) {
      break;
    }
  }

  return result;
}

export function serializeJournal(entries: readonly JournalEntry[]): string {
  const file: JournalFile = {
    version: JOURNAL_FILE_VERSION,
    entries: entries.slice(0, JOURNAL_MAX_ENTRIES),
  };

  return JSON.stringify(file);
}

/** Adds a reading to the front, replacing an earlier save of the same draw. */
export function upsertJournalEntry(
  entries: readonly JournalEntry[],
  params: URLSearchParams,
  savedAt: string,
): JournalEntry[] {
  if (!readSharedReading(params)) {
    return [...entries];
  }

  const id = params.toString();
  const entry: JournalEntry = { id, savedAt, params: id };

  return [entry, ...entries.filter((item) => item.id !== id)].slice(
    0,
    JOURNAL_MAX_ENTRIES,
  );
}

export function removeJournalEntry(
  entries: readonly JournalEntry[],
  id: string,
): JournalEntry[] {
  return entries.filter((entry) => entry.id !== id);
}
