/**
 * A cut-up rearranges the reader's own lines or sentences into a new sequence.
 * The same text and cut index always produce the same arrangement.
 */
import { hashString, mulberry32, shuffle } from "./random";

export const CUT_UP_TEXT_MAX = 4000;
export const CUT_UP_MIN_UNITS = 2;

export type CutUpMode = "lines" | "sentences";

export interface CutUpModeOption {
  id: CutUpMode;
  label: string;
  hint: string;
}

export const CUT_UP_MODES: readonly CutUpModeOption[] = [
  {
    id: "lines",
    label: "Lines",
    hint: "Each non-empty line becomes one fragment.",
  },
  {
    id: "sentences",
    label: "Sentences",
    hint: "Full stops, question marks, exclamation marks, and line breaks split the text.",
  },
];

export interface CutUp {
  text: string;
  mode: CutUpMode;
  /** The shuffled fragments, in their new order. */
  fragments: string[];
  cutIndex: number;
}

export function normalizeCutUpText(input: string): string {
  return input.replace(/\r\n?/g, "\n").trim().slice(0, CUT_UP_TEXT_MAX).trim();
}

function cleanFragment(fragment: string): string {
  return fragment.replace(/\s+/g, " ").trim();
}

function splitSentences(text: string): string[] {
  return text.split("\n").flatMap((line) => {
    const matches = line.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) ?? [];
    return matches.map(cleanFragment).filter(Boolean);
  });
}

/** Splits normalized text into the smallest units the cut-up will rearrange. */
export function splitCutUp(text: string, mode: CutUpMode): string[] {
  const normalized = normalizeCutUpText(text);

  if (!normalized) {
    return [];
  }

  if (mode === "lines") {
    return normalized.split("\n").map(cleanFragment).filter(Boolean);
  }

  return splitSentences(normalized);
}

function sameOrder(first: readonly string[], second: readonly string[]): boolean {
  return (
    first.length === second.length &&
    first.every((fragment, index) => fragment === second[index])
  );
}

function rotateOne(fragments: readonly string[]): string[] {
  if (fragments.length < 2) {
    return [...fragments];
  }

  return [...fragments.slice(1), fragments[0]!];
}

export function buildCutUp(
  text: string,
  mode: CutUpMode,
  cutIndex: number,
  previousFragments?: readonly string[],
): CutUp | null {
  const normalized = normalizeCutUpText(text);
  const fragments = splitCutUp(normalized, mode);

  if (fragments.length < CUT_UP_MIN_UNITS) {
    return null;
  }

  const safeIndex = Number.isFinite(cutIndex) ? Math.max(0, Math.floor(cutIndex)) : 0;
  const seed = hashString(`${mode}\u0000${safeIndex}\u0000${normalized}`);
  let arranged = shuffle(fragments, mulberry32(seed));

  // A cut that returns the original order on the first pass feels broken,
  // especially with only two fragments. Rotate once to guarantee a new line.
  if (safeIndex === 0 && sameOrder(arranged, fragments)) {
    arranged = rotateOne(arranged);
  }

  // The page passes the previous result so another cut always moves.
  if (previousFragments && sameOrder(arranged, previousFragments)) {
    arranged = rotateOne(arranged);
  }

  return {
    text: normalized,
    mode,
    fragments: arranged,
    cutIndex: safeIndex,
  };
}
