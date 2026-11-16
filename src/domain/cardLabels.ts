import type { TarotCard } from "./types";

/** A short, human-readable classification used in the library and card pages. */
export function cardTypeLabel(card: TarotCard): string {
  if (card.kind === "major") {
    return `Major Arcana · Atu ${card.number}`;
  }

  if (card.kind === "court") {
    return `Court card · ${card.suit}`;
  }

  return `${card.suit} · ${card.rank}`;
}
