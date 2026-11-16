export type Element = "Fire" | "Water" | "Air" | "Earth";

export type Suit = "Wands" | "Cups" | "Swords" | "Disks";

export type CourtRank = "Knight" | "Queen" | "Prince" | "Princess";

export type NumberRank =
  "Ace" | "Two" | "Three" | "Four" | "Five" | "Six" | "Seven" | "Eight" | "Nine" | "Ten";

export type MinorRank = NumberRank | CourtRank;

export type Sephira =
  | "kether"
  | "chokmah"
  | "binah"
  | "chesed"
  | "geburah"
  | "tiphareth"
  | "netzach"
  | "hod"
  | "yesod"
  | "malkuth";

export type Orientation = "upright" | "shadow";

export interface TreePath {
  /** Path number 11–32 on the Tree of Life. */
  number: number;
  from: Sephira;
  to: Sephira;
}

interface BaseCard {
  id: string;
  name: string;
  element: Element;
  keywords: readonly string[];
  essence: string;
  upright: string;
  shadow: string;
  symbolism: readonly string[];
  sourceUrl: string;
}

export interface MajorCard extends BaseCard {
  kind: "major";
  number: number;
  hebrewLetter: string;
  hebrewLetterChar: string;
  gdTitle: string;
  zodiac?: string;
  planet?: string;
  path: TreePath;
}

export interface MinorCard extends BaseCard {
  kind: "minor";
  suit: Suit;
  rank: NumberRank;
  number: number;
  sephira: Sephira;
  decan?: string;
  lordTitle: string;
}

export interface CourtCard extends BaseCard {
  kind: "court";
  suit: Suit;
  rank: CourtRank;
  /** Elemental composition, e.g. "Fiery part of Fire". */
  courtElement: string;
  zodiacRange?: string;
}

export type TarotCard = MajorCard | MinorCard | CourtCard;

export interface SpreadPosition {
  id: string;
  label: string;
  hint: string;
}

export type SpreadLayout = "row" | "cross" | "tree" | "hexagram" | "lovers";

export interface Spread {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  layout: SpreadLayout;
  positions: readonly SpreadPosition[];
}

export interface DrawnCard {
  card: TarotCard;
  position: SpreadPosition;
  orientation: Orientation;
  revealed: boolean;
}
