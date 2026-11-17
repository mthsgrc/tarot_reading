import type {
  CourtRank,
  DrawnCard,
  Element,
  NumberRank,
  Sephira,
  Spread,
  Suit,
} from "../types";

export type ReadingLens = "general" | "work" | "love" | "inner";

export type LensSource = "explicit" | "inferred" | "default";

export interface ReadingInput {
  spread: Spread;
  drawn: readonly DrawnCard[];
  question?: string;
  lens?: ReadingLens;
}

export interface NumberGroup {
  rank: NumberRank;
  number: number;
  cards: DrawnCard[];
}

export interface CourtRankGroup {
  rank: CourtRank;
  cards: DrawnCard[];
}

export interface SephiraTouch {
  sephira: Sephira;
  cards: DrawnCard[];
}

export type ResonanceKind = "sephira-match" | "path-touch" | "planet-match";

export interface Resonance {
  kind: ResonanceKind;
  drawn: DrawnCard;
  stationId: string;
  stationLabel: string;
  detail: string;
}

export interface ReadingFacts {
  total: number;
  elements: Record<Element, number>;
  suits: Record<Suit, number>;
  kinds: { major: number; minor: number; court: number };
  orientations: { upright: number; shadow: number };
  majors: DrawnCard[];
  minors: DrawnCard[];
  courts: DrawnCard[];
  shadows: DrawnCard[];
  dominantElement?: Element;
  missingElements: Element[];
  repeatedNumbers: NumberGroup[];
  repeatedCourtRanks: CourtRankGroup[];
  sephiraTouches: SephiraTouch[];
  resonances: Resonance[];
  majorRatio: number;
  courtRatio: number;
  shadowRatio: number;
  lens: ReadingLens;
  lensSource: LensSource;
  question?: string;
}

export type InsightKind =
  | "element"
  | "major"
  | "court"
  | "number"
  | "shadow"
  | "resonance"
  | "relation"
  | "balance";

export interface Insight {
  id: string;
  kind: InsightKind;
  title: string;
  body: string;
  weight: number;
}

export interface PositionInsight {
  drawn: DrawnCard;
  body: string;
}

export interface ReadingInterpretation {
  headline: string;
  overview: string[];
  notices: Insight[];
  positions: PositionInsight[];
  movement: string[];
  action: string;
  working: ReadingFacts;
}
