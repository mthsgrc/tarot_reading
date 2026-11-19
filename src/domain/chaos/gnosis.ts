/** Available attention spans, in minutes. Kept small and predictable. */
export const GNOSIS_MINUTES = [3, 5, 10, 20] as const;
export const DEFAULT_GNOSIS_MINUTES = 5;

export type GnosisMinutes = (typeof GNOSIS_MINUTES)[number];

/** Whole seconds in a chosen span. */
export function gnosisSeconds(minutes: GnosisMinutes): number {
  return minutes * 60;
}

/** Formats whole seconds as MM:SS, clamped at zero. */
export function formatClock(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
