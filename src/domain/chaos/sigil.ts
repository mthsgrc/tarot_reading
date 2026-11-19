/**
 * A sigil is generated from the surviving consonants of a written statement.
 * The same statement always produces the same glyph; nothing is random at
 * render time. `Math.random` is not used here.
 */
export const SIGIL_STATEMENT_MAX = 180;
export const SIGIL_MIN_LETTERS = 2;

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

export interface Sigil {
  /** Normalized statement used to derive the letters. */
  statement: string;
  /** Unique consonants left after removing vowels and repeats. */
  letters: string;
  /** Main and mirrored SVG paths on a 100 by 100 canvas. */
  paths: [string, string];
  seed: number;
}

export function normalizeSigilStatement(input: string): string {
  return input.replace(/\s+/g, " ").trim().slice(0, SIGIL_STATEMENT_MAX).trim();
}

/**
 * Austin Osman Spare's common method: remove vowels, then repeated letters.
 * Punctuation, digits, and whitespace do not contribute to the glyph.
 */
export function sigilLetters(statement: string): string {
  const seen = new Set<string>();
  let letters = "";

  for (const character of normalizeSigilStatement(statement).toUpperCase()) {
    if (character < "A" || character > "Z") {
      continue;
    }

    if (VOWELS.has(character) || seen.has(character)) {
      continue;
    }

    seen.add(character);
    letters += character;
  }

  return letters;
}

/** FNV-1a keeps the geometry stable without a library or a stored seed. */
function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;

  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function pointAt(angle: number, radius: number): [number, number] {
  return [round(50 + Math.cos(angle) * radius), round(50 + Math.sin(angle) * radius)];
}

function pathFrom(points: readonly [number, number][], mirror = false): string {
  return points
    .map(([x, y], index) => {
      const pointX = mirror ? round(100 - x) : x;
      return `${index === 0 ? "M" : "L"}${pointX} ${y}`;
    })
    .join(" ");
}

/**
 * Builds a mirrored, continuous line from the charge letters. Letter codes
 * change the angle and radius, so the glyph carries the order of the letters
 * rather than a decorative hash.
 */
export function buildSigil(statement: string): Sigil | null {
  const normalized = normalizeSigilStatement(statement);
  const letters = sigilLetters(normalized);

  if (letters.length < SIGIL_MIN_LETTERS) {
    return null;
  }

  const seed = hashString(letters);
  const random = mulberry32(seed);
  const points: Array<[number, number]> = [];
  let angle = random() * Math.PI * 2;

  points.push(pointAt(angle, 27 + random() * 10));

  for (let index = 0; index < letters.length; index += 1) {
    const code = letters.charCodeAt(index);
    angle += 0.55 + ((code % 11) / 11) * 1.1;
    const radius = 12 + ((code * 17 + index * 29) % 32);
    points.push(pointAt(angle, radius));
  }

  return {
    statement: normalized,
    letters,
    paths: [pathFrom(points), pathFrom(points, true)],
    seed,
  };
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** A standalone file for the downloadable copy. */
export function sigilSvgMarkup(sigil: Sigil): string {
  const paths = sigil.paths
    .map(
      (path) =>
        `<path d="${path}" fill="none" stroke="#111111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join("");

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512" role="img">',
    "<title>Sigil</title>",
    `<desc>Charge letters: ${escapeXml(sigil.letters.split("").join(" "))}</desc>`,
    '<rect width="100" height="100" fill="#ffffff"/>',
    '<circle cx="50" cy="50" r="46" fill="none" stroke="#111111" stroke-width="0.7" opacity="0.3"/>',
    paths,
    '<circle cx="50" cy="50" r="1.8" fill="#111111"/>',
    "</svg>",
  ].join("");
}
