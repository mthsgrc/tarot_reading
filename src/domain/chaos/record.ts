/**
 * The magical record is a local log of workings and observations. It is shared
 * by the record page and, later, the Working Composer.
 */
import { isValidDateInput } from "./date";

export const RECORD_FILE_VERSION = 1;
export const RECORD_MAX_ENTRIES = 100;
export const RECORD_TITLE_MAX = 120;
export const RECORD_TEXT_MAX = 2000;

export const RECORD_KINDS = [
  { id: "note", label: "Note" },
  { id: "sigil", label: "Sigil" },
  { id: "gnosis", label: "Gnosis" },
  { id: "cut-up", label: "Cut-up" },
  { id: "servitor", label: "Servitor" },
  { id: "paradigm", label: "Paradigm" },
  { id: "working", label: "Working" },
] as const;

export type RecordKind = (typeof RECORD_KINDS)[number]["id"];

export interface RecordDraft {
  title: string;
  kind: RecordKind;
  date: string;
  /** What was done. */
  practice: string;
  /** What was noticed afterwards. Optional. */
  result: string;
}

export interface RecordErrors {
  title?: string;
  kind?: string;
  date?: string;
  practice?: string;
  result?: string;
}

export interface MagicalRecordEntry extends RecordDraft {
  id: string;
  createdAt: string;
}

interface RecordFile {
  version: number;
  entries: MagicalRecordEntry[];
}

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function cleanText(value: string): string {
  return value.replace(/\r\n?/g, "\n").trim();
}

export function isRecordKind(value: unknown): value is RecordKind {
  return RECORD_KINDS.some((kind) => kind.id === value);
}

export function recordKindLabel(kind: RecordKind): string {
  return RECORD_KINDS.find((option) => option.id === kind)!.label;
}

export function normalizeRecordDraft(draft: RecordDraft): RecordDraft {
  return {
    title: collapse(draft.title),
    kind: draft.kind,
    date: draft.date.trim(),
    practice: cleanText(draft.practice),
    result: cleanText(draft.result),
  };
}

export function validateRecordDraft(draft: RecordDraft): RecordErrors {
  const normalized = normalizeRecordDraft(draft);
  const errors: RecordErrors = {};

  if (!normalized.title) {
    errors.title = "Give the entry a title.";
  } else if (normalized.title.length > RECORD_TITLE_MAX) {
    errors.title = `Keep the title to ${RECORD_TITLE_MAX} characters or fewer.`;
  }

  if (!isRecordKind(normalized.kind)) {
    errors.kind = "Choose a kind of entry.";
  }

  if (!normalized.date) {
    errors.date = "Choose the date of the working.";
  } else if (!isValidDateInput(normalized.date)) {
    errors.date = "Use a valid date.";
  }

  if (!normalized.practice) {
    errors.practice = "Write what you did.";
  } else if (normalized.practice.length > RECORD_TEXT_MAX) {
    errors.practice = `Keep this field to ${RECORD_TEXT_MAX} characters or fewer.`;
  }

  if (normalized.result.length > RECORD_TEXT_MAX) {
    errors.result = `Keep this field to ${RECORD_TEXT_MAX} characters or fewer.`;
  }

  return errors;
}

export function hasRecordErrors(errors: RecordErrors): boolean {
  return Object.keys(errors).length > 0;
}

function isValidTimestamp(value: string): boolean {
  return value.length <= 40 && !Number.isNaN(Date.parse(value));
}

export function createRecordEntry(
  draft: RecordDraft,
  id: string,
  createdAt: string,
): MagicalRecordEntry | null {
  const normalized = normalizeRecordDraft(draft);

  if (
    hasRecordErrors(validateRecordDraft(normalized)) ||
    !id.trim() ||
    id.length > 100 ||
    !isValidTimestamp(createdAt)
  ) {
    return null;
  }

  return {
    id: id.trim(),
    ...normalized,
    createdAt,
  };
}

function isRecordEntry(value: unknown): value is MagicalRecordEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const { id, title, kind, date, practice, result, createdAt } = value as Record<
    string,
    unknown
  >;

  return Boolean(
    typeof id === "string" &&
    id.trim() &&
    id.length <= 100 &&
    typeof title === "string" &&
    title.trim() &&
    title.length <= RECORD_TITLE_MAX &&
    isRecordKind(kind) &&
    typeof date === "string" &&
    isValidDateInput(date) &&
    typeof practice === "string" &&
    practice.trim() &&
    practice.length <= RECORD_TEXT_MAX &&
    typeof result === "string" &&
    result.length <= RECORD_TEXT_MAX &&
    typeof createdAt === "string" &&
    isValidTimestamp(createdAt),
  );
}

export function parseRecordEntries(raw: string | null): MagicalRecordEntry[] {
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

  const { version, entries } = data as Partial<RecordFile>;
  if (version !== RECORD_FILE_VERSION || !Array.isArray(entries)) {
    return [];
  }

  const result: MagicalRecordEntry[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (!isRecordEntry(entry) || seen.has(entry.id)) {
      continue;
    }

    seen.add(entry.id);
    result.push({
      id: entry.id,
      title: entry.title,
      kind: entry.kind,
      date: entry.date,
      practice: entry.practice,
      result: entry.result,
      createdAt: entry.createdAt,
    });

    if (result.length === RECORD_MAX_ENTRIES) {
      break;
    }
  }

  return result;
}

export function serializeRecordEntries(entries: readonly MagicalRecordEntry[]): string {
  const file: RecordFile = {
    version: RECORD_FILE_VERSION,
    entries: entries.slice(0, RECORD_MAX_ENTRIES),
  };

  return JSON.stringify(file);
}

export function addRecordEntry(
  entries: readonly MagicalRecordEntry[],
  entry: MagicalRecordEntry,
): MagicalRecordEntry[] {
  return [entry, ...entries.filter((item) => item.id !== entry.id)].slice(
    0,
    RECORD_MAX_ENTRIES,
  );
}

export function deleteRecordEntry(
  entries: readonly MagicalRecordEntry[],
  id: string,
): MagicalRecordEntry[] {
  return entries.filter((entry) => entry.id !== id);
}

/** Diary order: the working date first, then the moment it was written. */
export function sortRecordEntries(
  entries: readonly MagicalRecordEntry[],
): MagicalRecordEntry[] {
  return [...entries].sort(
    (first, second) =>
      second.date.localeCompare(first.date) ||
      second.createdAt.localeCompare(first.createdAt),
  );
}
