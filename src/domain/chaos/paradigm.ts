/**
 * A paradigm experiment is a temporary, provisional belief held for a set
 * span. The record is a creative and reflective device, not a truth claim.
 */
export const PARADIGM_FILE_VERSION = 1;
export const PARADIGM_MAX_RECORDS = 30;
export const PARADIGM_BELIEF_MAX = 180;
export const PARADIGM_REFLECTION_MAX = 800;

export const PARADIGM_DURATIONS = [
  { id: "hour", label: "One hour", hours: 1 },
  { id: "day", label: "One day", hours: 24 },
  { id: "week", label: "One week", hours: 168 },
] as const;

export type ParadigmDuration = (typeof PARADIGM_DURATIONS)[number]["id"];

export const PARADIGM_PROMPTS = [
  "There is no rush. The next useful step is enough.",
  "I can be wrong and still be safe.",
  "I notice what is actually here before I explain it.",
  "Other people are doing their best with what they have.",
  "The day is an experiment, not a verdict.",
] as const;

export interface ParadigmExperiment {
  id: string;
  belief: string;
  duration: ParadigmDuration;
  startedAt: string;
  endsAt: string;
  /** Null while the experiment is open. */
  completedAt: string | null;
  reflection: string;
}

interface ParadigmFile {
  version: number;
  entries: ParadigmExperiment[];
}

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeParadigmBelief(value: string): string {
  return collapse(value);
}

export function normalizeParadigmReflection(value: string): string {
  return value.replace(/\r\n?/g, "\n").trim();
}

function isValidTimestamp(value: string): boolean {
  return value.length <= 40 && !Number.isNaN(Date.parse(value));
}

function isDuration(value: unknown): value is ParadigmDuration {
  return PARADIGM_DURATIONS.some((duration) => duration.id === value);
}

export function paradigmDuration(duration: ParadigmDuration) {
  return PARADIGM_DURATIONS.find((option) => option.id === duration)!;
}

export function createParadigmExperiment(
  belief: string,
  duration: ParadigmDuration,
  id: string,
  startedAt: string,
): ParadigmExperiment | null {
  const normalized = normalizeParadigmBelief(belief);

  if (
    !normalized ||
    normalized.length > PARADIGM_BELIEF_MAX ||
    !isDuration(duration) ||
    !id.trim() ||
    id.length > 100 ||
    !isValidTimestamp(startedAt)
  ) {
    return null;
  }

  const hours = paradigmDuration(duration).hours;
  const endsAt = new Date(Date.parse(startedAt) + hours * 60 * 60 * 1000).toISOString();

  return {
    id: id.trim(),
    belief: normalized,
    duration,
    startedAt,
    endsAt,
    completedAt: null,
    reflection: "",
  };
}

export function isParadigmReady(endsAt: string, now: string): boolean {
  const end = Date.parse(endsAt);
  const current = Date.parse(now);
  return !Number.isNaN(end) && !Number.isNaN(current) && end <= current;
}

export function getOpenParadigm(
  experiments: readonly ParadigmExperiment[],
): ParadigmExperiment | null {
  return experiments.find((experiment) => experiment.completedAt === null) ?? null;
}

export function completeParadigmExperiment(
  experiments: readonly ParadigmExperiment[],
  id: string,
  reflection: string,
  completedAt: string,
): ParadigmExperiment[] | null {
  const normalized = normalizeParadigmReflection(reflection);

  if (!normalized || normalized.length > PARADIGM_REFLECTION_MAX) {
    return null;
  }

  if (!isValidTimestamp(completedAt)) {
    return null;
  }

  const target = experiments.find(
    (experiment) => experiment.id === id && experiment.completedAt === null,
  );
  if (!target) {
    return null;
  }

  return experiments.map((experiment) =>
    experiment.id === id
      ? { ...experiment, completedAt, reflection: normalized }
      : experiment,
  );
}

export function addParadigmExperiment(
  experiments: readonly ParadigmExperiment[],
  experiment: ParadigmExperiment,
): ParadigmExperiment[] {
  return [experiment, ...experiments.filter((item) => item.id !== experiment.id)].slice(
    0,
    PARADIGM_MAX_RECORDS,
  );
}

export function deleteParadigmExperiment(
  experiments: readonly ParadigmExperiment[],
  id: string,
): ParadigmExperiment[] {
  return experiments.filter((experiment) => experiment.id !== id);
}

function isParadigmExperiment(value: unknown): value is ParadigmExperiment {
  if (!value || typeof value !== "object") {
    return false;
  }

  const { id, belief, duration, startedAt, endsAt, completedAt, reflection } =
    value as Record<string, unknown>;

  if (
    typeof id !== "string" ||
    !id.trim() ||
    id.length > 100 ||
    typeof belief !== "string" ||
    !belief.trim() ||
    belief.length > PARADIGM_BELIEF_MAX ||
    !isDuration(duration) ||
    typeof startedAt !== "string" ||
    !isValidTimestamp(startedAt) ||
    typeof endsAt !== "string" ||
    !isValidTimestamp(endsAt) ||
    typeof reflection !== "string" ||
    reflection.length > PARADIGM_REFLECTION_MAX
  ) {
    return false;
  }

  if (Date.parse(endsAt) <= Date.parse(startedAt)) {
    return false;
  }

  if (completedAt !== null) {
    if (typeof completedAt !== "string" || !isValidTimestamp(completedAt)) {
      return false;
    }

    if (!reflection.trim()) {
      return false;
    }
  }

  return true;
}

export function parseParadigms(raw: string | null): ParadigmExperiment[] {
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

  const { version, entries } = data as Partial<ParadigmFile>;
  if (version !== PARADIGM_FILE_VERSION || !Array.isArray(entries)) {
    return [];
  }

  const result: ParadigmExperiment[] = [];
  const seen = new Set<string>();
  let hasOpen = false;

  for (const entry of entries) {
    if (!isParadigmExperiment(entry) || seen.has(entry.id)) {
      continue;
    }

    if (entry.completedAt === null) {
      if (hasOpen) {
        continue;
      }
      hasOpen = true;
    }

    seen.add(entry.id);
    result.push({
      id: entry.id,
      belief: entry.belief,
      duration: entry.duration,
      startedAt: entry.startedAt,
      endsAt: entry.endsAt,
      completedAt: entry.completedAt,
      reflection: entry.reflection,
    });

    if (result.length === PARADIGM_MAX_RECORDS) {
      break;
    }
  }

  return result;
}

export function serializeParadigms(experiments: readonly ParadigmExperiment[]): string {
  const file: ParadigmFile = {
    version: PARADIGM_FILE_VERSION,
    entries: experiments.slice(0, PARADIGM_MAX_RECORDS),
  };

  return JSON.stringify(file);
}
