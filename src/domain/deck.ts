import { ALL_CARDS, CARD_BY_ID } from "../data/cards";
import type { DrawnCard, Spread, TarotCard } from "./types";

/** Returns a random number in [0, 1). */
export type RandomSource = () => number;

export function cryptoRandom(): number {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] / 0x1_0000_0000;
}

/** Deterministic RNG for tests and reproducible debugging, not for readings. */
export function seededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 0x1_0000_0000;
  };
}

/** Fisher–Yates. The input is not mutated. */
export function shuffle<T>(
  items: readonly T[],
  random: RandomSource = cryptoRandom,
): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

export interface DrawOptions {
  /** When true, a card can be drawn in its shadow/inverted orientation. */
  shadow?: boolean;
}

/**
 * Draws one card per spread position without replacement.
 * The spread positions and drawn cards share the same order.
 */
export function drawCards(
  spread: Spread,
  options: DrawOptions = {},
  cards: readonly TarotCard[] = ALL_CARDS,
  random: RandomSource = cryptoRandom,
): DrawnCard[] {
  if (spread.positions.length > cards.length) {
    throw new Error(
      `Spread "${spread.id}" needs ${spread.positions.length} cards but only ${cards.length} are available.`,
    );
  }

  const shuffled = shuffle(cards, random);

  return spread.positions.map((position, index) => {
    const card = shuffled[index];
    if (!card) {
      throw new Error(`No card available for position "${position.id}".`);
    }

    return {
      card,
      position,
      orientation: options.shadow && random() < 0.5 ? "shadow" : "upright",
      revealed: false,
    };
  });
}

export function getCardById(id: string): TarotCard | undefined {
  return CARD_BY_ID.get(id);
}

export function cardImageBase(card: TarotCard): string {
  return `${import.meta.env.BASE_URL}images/cards/${card.id}`;
}

export function cardBackBase(): string {
  return `${import.meta.env.BASE_URL}images/back-cover`;
}
