/**
 * The Working Composer turns a working into a record entry with an intention,
 * an action, a closing, and an optional reflection.
 */
import { isValidDateInput } from "./date";
import type { RecordDraft } from "./record";

export const WORKING_TITLE_MAX = 120;
export const WORKING_INTENTION_MAX = 400;
export const WORKING_PREPARATION_MAX = 400;
export const WORKING_ACTION_MAX = 600;
export const WORKING_CLOSING_MAX = 400;
export const WORKING_REFLECTION_MAX = 1000;

export interface WorkingDraft {
  title: string;
  date: string;
  intention: string;
  preparation: string;
  action: string;
  closing: string;
  reflection: string;
}

export interface WorkingErrors {
  title?: string;
  date?: string;
  intention?: string;
  preparation?: string;
  action?: string;
  closing?: string;
  reflection?: string;
}

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function cleanText(value: string): string {
  return value.replace(/\r\n?/g, "\n").trim();
}

export function normalizeWorkingDraft(draft: WorkingDraft): WorkingDraft {
  return {
    title: collapse(draft.title),
    date: draft.date.trim(),
    intention: cleanText(draft.intention),
    preparation: cleanText(draft.preparation),
    action: cleanText(draft.action),
    closing: cleanText(draft.closing),
    reflection: cleanText(draft.reflection),
  };
}

export function validateWorkingDraft(draft: WorkingDraft): WorkingErrors {
  const normalized = normalizeWorkingDraft(draft);
  const errors: WorkingErrors = {};

  if (!normalized.title) {
    errors.title = "Give the working a title.";
  } else if (normalized.title.length > WORKING_TITLE_MAX) {
    errors.title = `Keep the title to ${WORKING_TITLE_MAX} characters or fewer.`;
  }

  if (!normalized.date) {
    errors.date = "Choose the date of the working.";
  } else if (!isValidDateInput(normalized.date)) {
    errors.date = "Use a valid date.";
  }

  if (!normalized.intention) {
    errors.intention = "Write the intention.";
  } else if (normalized.intention.length > WORKING_INTENTION_MAX) {
    errors.intention = `Keep the intention to ${WORKING_INTENTION_MAX} characters or fewer.`;
  }

  if (normalized.preparation.length > WORKING_PREPARATION_MAX) {
    errors.preparation = `Keep the preparation to ${WORKING_PREPARATION_MAX} characters or fewer.`;
  }

  if (!normalized.action) {
    errors.action = "Write what you will do.";
  } else if (normalized.action.length > WORKING_ACTION_MAX) {
    errors.action = `Keep the action to ${WORKING_ACTION_MAX} characters or fewer.`;
  }

  if (!normalized.closing) {
    errors.closing = "Write how you will close and return.";
  } else if (normalized.closing.length > WORKING_CLOSING_MAX) {
    errors.closing = `Keep the closing to ${WORKING_CLOSING_MAX} characters or fewer.`;
  }

  if (normalized.reflection.length > WORKING_REFLECTION_MAX) {
    errors.reflection = `Keep the reflection to ${WORKING_REFLECTION_MAX} characters or fewer.`;
  }

  return errors;
}

export function hasWorkingErrors(errors: WorkingErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Formats the working as the plain text stored in the Magical Record. */
export function composeWorkingPractice(draft: WorkingDraft): string {
  const normalized = normalizeWorkingDraft(draft);
  const sections: Array<[string, string]> = [
    ["Intention", normalized.intention],
    ["Preparation", normalized.preparation],
    ["Action", normalized.action],
    ["Closing", normalized.closing],
  ];

  return sections
    .filter(([, text]) => text)
    .map(([label, text]) => `${label}:\n${text}`)
    .join("\n\n");
}

export function workingToRecordDraft(draft: WorkingDraft): RecordDraft {
  const normalized = normalizeWorkingDraft(draft);

  return {
    title: normalized.title,
    kind: "working",
    date: normalized.date,
    practice: composeWorkingPractice(normalized),
    result: normalized.reflection,
  };
}
