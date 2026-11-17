import type { DrawnCard } from "../types";

export function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Returns the first sentence, including its terminal punctuation. */
export function firstSentence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^.*?[.!?](?=\s|$)/);
  return (match?.[0] ?? trimmed).trim();
}

export function joinWithAnd(items: readonly string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function describeCard(drawn: DrawnCard, includeUpright = false): string {
  const suffix =
    drawn.orientation === "shadow" ? " in shadow" : includeUpright ? " upright" : "";
  return `${drawn.card.name}${suffix}`;
}

export function hashString(value: string): number {
  let hash = 2_166_136_261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }

  return hash >>> 0;
}

export function readingSeed(spread: { id: string }, drawn: readonly DrawnCard[]): string {
  const cards = drawn
    .map(
      (drawnCard) =>
        `${drawnCard.position.id}:${drawnCard.card.id}:${drawnCard.orientation}`,
    )
    .join("|");

  return `${spread.id}|${cards}`;
}

/** Stable phrase selection: the same draw always receives the same variant. */
export function pickVariant<T>(items: readonly T[], seed: string, salt: string): T {
  if (items.length === 0) {
    throw new Error("Cannot pick from an empty variant list.");
  }

  return items[hashString(`${seed}|${salt}`) % items.length] as T;
}
