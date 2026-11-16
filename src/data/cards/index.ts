import type { TarotCard } from "../../domain/types";
import { CUPS_CARDS } from "./cups";
import { DISKS_CARDS } from "./disks";
import { MAJOR_CARDS } from "./majors";
import { SWORDS_CARDS } from "./swords";
import { WANDS_CARDS } from "./wands";

export { MAJOR_CARDS, WANDS_CARDS, CUPS_CARDS, SWORDS_CARDS, DISKS_CARDS };

export const ALL_CARDS: readonly TarotCard[] = [
  ...MAJOR_CARDS,
  ...WANDS_CARDS,
  ...CUPS_CARDS,
  ...SWORDS_CARDS,
  ...DISKS_CARDS,
];

export const CARD_BY_ID: ReadonlyMap<string, TarotCard> = new Map(
  ALL_CARDS.map((card) => [card.id, card]),
);
