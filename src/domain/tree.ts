import type { Element, Sephira, Suit } from "./types";

export const SEPHIROTH: ReadonlyArray<{
  id: Sephira;
  name: string;
  title: string;
  number: number;
}> = [
  { id: "kether", name: "Kether", title: "Crown", number: 1 },
  { id: "chokmah", name: "Chokmah", title: "Wisdom", number: 2 },
  { id: "binah", name: "Binah", title: "Understanding", number: 3 },
  { id: "chesed", name: "Chesed", title: "Mercy", number: 4 },
  { id: "geburah", name: "Geburah", title: "Severity", number: 5 },
  { id: "tiphareth", name: "Tiphareth", title: "Beauty", number: 6 },
  { id: "netzach", name: "Netzach", title: "Victory", number: 7 },
  { id: "hod", name: "Hod", title: "Splendour", number: 8 },
  { id: "yesod", name: "Yesod", title: "Foundation", number: 9 },
  { id: "malkuth", name: "Malkuth", title: "Kingdom", number: 10 },
];

export const SEPHIRA_BY_ID = Object.fromEntries(
  SEPHIROTH.map((sephira) => [sephira.id, sephira]),
) as Record<Sephira, (typeof SEPHIROTH)[number]>;

export const SUIT_ELEMENTS: Record<Suit, Element> = {
  Wands: "Fire",
  Cups: "Water",
  Swords: "Air",
  Disks: "Earth",
};

export const ELEMENT_GLYPHS: Record<Element, string> = {
  Fire: "🜂",
  Water: "🜄",
  Air: "🜁",
  Earth: "🜃",
};

export const ELEMENT_COLORS: Record<Element, string> = {
  Fire: "#c94a3a",
  Water: "#3d7ea6",
  Air: "#c9b46a",
  Earth: "#5d7f4e",
};
