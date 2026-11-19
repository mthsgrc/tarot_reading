import {
  addParadigmExperiment,
  completeParadigmExperiment,
  createParadigmExperiment,
  deleteParadigmExperiment,
  getOpenParadigm,
  parseParadigms,
  serializeParadigms,
  type ParadigmDuration,
  type ParadigmExperiment,
} from "../domain/chaos/paradigm";
import { createId } from "./createId";

export const PARADIGM_STORAGE_KEY = "thoth-tarot:chaos-paradigms:v1";

export type StartParadigmResult =
  | { status: "saved"; experiments: ParadigmExperiment[] }
  | { status: "open" }
  | { status: "invalid" }
  | { status: "error" };

export function loadParadigms(): ParadigmExperiment[] {
  try {
    return parseParadigms(window.localStorage.getItem(PARADIGM_STORAGE_KEY));
  } catch {
    return [];
  }
}

function writeParadigms(experiments: readonly ParadigmExperiment[]): boolean {
  try {
    window.localStorage.setItem(PARADIGM_STORAGE_KEY, serializeParadigms(experiments));
    return true;
  } catch {
    return false;
  }
}

export function startStoredParadigm(
  belief: string,
  duration: ParadigmDuration,
  now = new Date().toISOString(),
): StartParadigmResult {
  const current = loadParadigms();

  if (getOpenParadigm(current)) {
    return { status: "open" };
  }

  const experiment = createParadigmExperiment(
    belief,
    duration,
    createId("paradigm"),
    now,
  );
  if (!experiment) {
    return { status: "invalid" };
  }

  const next = addParadigmExperiment(current, experiment);
  return writeParadigms(next)
    ? { status: "saved", experiments: next }
    : { status: "error" };
}

export function completeStoredParadigm(
  id: string,
  reflection: string,
  completedAt = new Date().toISOString(),
): ParadigmExperiment[] | null {
  const next = completeParadigmExperiment(loadParadigms(), id, reflection, completedAt);

  if (!next) {
    return null;
  }

  return writeParadigms(next) ? next : null;
}

export function deleteStoredParadigm(id: string): ParadigmExperiment[] | null {
  const next = deleteParadigmExperiment(loadParadigms(), id);
  return writeParadigms(next) ? next : null;
}
