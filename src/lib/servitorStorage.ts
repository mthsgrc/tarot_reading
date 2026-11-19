import {
  SERVITOR_MAX_RECORDS,
  addServitor,
  createServitor,
  deleteServitor,
  parseServitors,
  restoreServitor,
  retireServitor,
  serializeServitors,
  type Servitor,
  type ServitorDraft,
} from "../domain/chaos/servitor";
import { createId } from "./createId";

export const SERVITOR_STORAGE_KEY = "thoth-tarot:chaos-servitors:v1";

export type SaveServitorResult =
  | { status: "saved"; servitors: Servitor[] }
  | { status: "invalid" }
  | { status: "full" }
  | { status: "error" };

export function loadServitors(): Servitor[] {
  try {
    return parseServitors(window.localStorage.getItem(SERVITOR_STORAGE_KEY));
  } catch {
    return [];
  }
}

function writeServitors(servitors: readonly Servitor[]): boolean {
  try {
    window.localStorage.setItem(SERVITOR_STORAGE_KEY, serializeServitors(servitors));
    return true;
  } catch {
    return false;
  }
}

export function createStoredServitor(
  draft: ServitorDraft,
  now = new Date().toISOString(),
): SaveServitorResult {
  const current = loadServitors();

  if (current.length >= SERVITOR_MAX_RECORDS) {
    return { status: "full" };
  }

  const servitor = createServitor(draft, createId("servitor"), now);
  if (!servitor) {
    return { status: "invalid" };
  }

  const next = addServitor(current, servitor);
  return writeServitors(next)
    ? { status: "saved", servitors: next }
    : { status: "error" };
}

export function retireStoredServitor(
  id: string,
  retiredAt = new Date().toISOString(),
): Servitor[] | null {
  const next = retireServitor(loadServitors(), id, retiredAt);
  return writeServitors(next) ? next : null;
}

export function restoreStoredServitor(id: string): Servitor[] | null {
  const next = restoreServitor(loadServitors(), id);
  return writeServitors(next) ? next : null;
}

export function deleteStoredServitor(id: string): Servitor[] | null {
  const next = deleteServitor(loadServitors(), id);
  return writeServitors(next) ? next : null;
}
