/**
 * A servitor record is a named intention kept as a creative focus object.
 * Records are local to the browser; this module owns validation and shape only.
 */
import { isValidDateInput } from "./date";

export const SERVITOR_FILE_VERSION = 1;
export const SERVITOR_MAX_RECORDS = 50;
export const SERVITOR_NAME_MAX = 60;
export const SERVITOR_TASK_MAX = 200;
export const SERVITOR_FORM_MAX = 120;

export interface ServitorDraft {
  name: string;
  task: string;
  form: string;
  reviewOn: string;
}

export interface ServitorErrors {
  name?: string;
  task?: string;
  form?: string;
  reviewOn?: string;
}

export interface Servitor {
  id: string;
  name: string;
  task: string;
  form: string;
  /** Local date input value (YYYY-MM-DD), or an empty string. */
  reviewOn: string;
  createdAt: string;
  retiredAt: string | null;
}

interface ServitorFile {
  version: number;
  entries: Servitor[];
}

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeServitorDraft(draft: ServitorDraft): ServitorDraft {
  return {
    name: collapse(draft.name),
    task: collapse(draft.task),
    form: collapse(draft.form),
    reviewOn: draft.reviewOn.trim(),
  };
}

export const isValidReviewDate = isValidDateInput;

function isValidTimestamp(value: string): boolean {
  return value.length <= 40 && !Number.isNaN(Date.parse(value));
}

export function validateServitorDraft(draft: ServitorDraft): ServitorErrors {
  const normalized = normalizeServitorDraft(draft);
  const errors: ServitorErrors = {};

  if (!normalized.name) {
    errors.name = "Give the servitor a name.";
  } else if (normalized.name.length > SERVITOR_NAME_MAX) {
    errors.name = `Keep the name to ${SERVITOR_NAME_MAX} characters or fewer.`;
  }

  if (!normalized.task) {
    errors.task = "Describe one task.";
  } else if (normalized.task.length > SERVITOR_TASK_MAX) {
    errors.task = `Keep the task to ${SERVITOR_TASK_MAX} characters or fewer.`;
  }

  if (normalized.form.length > SERVITOR_FORM_MAX) {
    errors.form = `Keep the form to ${SERVITOR_FORM_MAX} characters or fewer.`;
  }

  if (normalized.reviewOn && !isValidReviewDate(normalized.reviewOn)) {
    errors.reviewOn = "Use a valid date, or leave the review date empty.";
  }

  return errors;
}

export function hasServitorErrors(errors: ServitorErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function createServitor(
  draft: ServitorDraft,
  id: string,
  createdAt: string,
): Servitor | null {
  const normalized = normalizeServitorDraft(draft);

  if (
    hasServitorErrors(validateServitorDraft(normalized)) ||
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
    retiredAt: null,
  };
}

function isServitor(value: unknown): value is Servitor {
  if (!value || typeof value !== "object") {
    return false;
  }

  const { id, name, task, form, reviewOn, createdAt, retiredAt } = value as Record<
    string,
    unknown
  >;

  if (
    typeof id !== "string" ||
    !id.trim() ||
    id.length > 100 ||
    typeof name !== "string" ||
    !name.trim() ||
    name.length > SERVITOR_NAME_MAX ||
    typeof task !== "string" ||
    !task.trim() ||
    task.length > SERVITOR_TASK_MAX ||
    typeof form !== "string" ||
    form.length > SERVITOR_FORM_MAX ||
    typeof reviewOn !== "string" ||
    typeof createdAt !== "string" ||
    !isValidTimestamp(createdAt)
  ) {
    return false;
  }

  if (reviewOn && !isValidReviewDate(reviewOn)) {
    return false;
  }

  if (
    retiredAt !== null &&
    (typeof retiredAt !== "string" || !isValidTimestamp(retiredAt))
  ) {
    return false;
  }

  return true;
}

export function parseServitors(raw: string | null): Servitor[] {
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

  const { version, entries } = data as Partial<ServitorFile>;
  if (version !== SERVITOR_FILE_VERSION || !Array.isArray(entries)) {
    return [];
  }

  const result: Servitor[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    if (!isServitor(entry) || seen.has(entry.id)) {
      continue;
    }

    seen.add(entry.id);
    result.push({
      id: entry.id,
      name: entry.name,
      task: entry.task,
      form: entry.form,
      reviewOn: entry.reviewOn,
      createdAt: entry.createdAt,
      retiredAt: entry.retiredAt,
    });

    if (result.length === SERVITOR_MAX_RECORDS) {
      break;
    }
  }

  return result;
}

export function serializeServitors(servitors: readonly Servitor[]): string {
  const file: ServitorFile = {
    version: SERVITOR_FILE_VERSION,
    entries: servitors.slice(0, SERVITOR_MAX_RECORDS),
  };

  return JSON.stringify(file);
}

export function addServitor(
  servitors: readonly Servitor[],
  servitor: Servitor,
): Servitor[] {
  return [servitor, ...servitors.filter((item) => item.id !== servitor.id)].slice(
    0,
    SERVITOR_MAX_RECORDS,
  );
}

export function retireServitor(
  servitors: readonly Servitor[],
  id: string,
  retiredAt: string,
): Servitor[] {
  if (!isValidTimestamp(retiredAt)) {
    return [...servitors];
  }

  return servitors.map((servitor) =>
    servitor.id === id ? { ...servitor, retiredAt } : servitor,
  );
}

export function restoreServitor(servitors: readonly Servitor[], id: string): Servitor[] {
  return servitors.map((servitor) =>
    servitor.id === id ? { ...servitor, retiredAt: null } : servitor,
  );
}

export function deleteServitor(servitors: readonly Servitor[], id: string): Servitor[] {
  return servitors.filter((servitor) => servitor.id !== id);
}

/** ISO date strings sort lexicographically, so a plain comparison is enough. */
export function isReviewDue(reviewOn: string, today: string): boolean {
  return Boolean(reviewOn) && reviewOn <= today;
}
