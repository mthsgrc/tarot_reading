/**
 * One-sentence introductions for every spread position. These are the grammar
 * of a reading: they tell the engine how to voice a card in that station.
 */
export const POSITION_INTROS: Record<string, string> = {
  thelema:
    "The Will is the direction that belongs to you, not the one imposed from outside.",
  agape: "Love is the warmth and motion that makes the Will live.",
  gnosis: "Gnosis is what becomes known when will and love are actually lived.",
  past: "The past is what has already been woven into the situation.",
  present: "The present is the living centre of the question.",
  future: "The future is the direction the current is taking if nothing changes.",
  crown: "The Crown is what you consciously intend or believe you are doing.",
  abyss: "The Abyss is the obstacle, contradiction, or lesson in the way.",
  root: "The Root is the hidden foundation generating the situation.",
  star: "The Star is the guiding influence trying to reach you.",
  aeon: "The Aeon is the larger movement of the cycle.",
  kether: "Kether is the source, the impulse before it has a name.",
  chokmah: "Chokmah is the first flash of creative force.",
  binah: "Binah is the form that receives and shapes the force.",
  chesed: "Chesed is expansion, generosity, and the law that builds.",
  geburah: "Geburah is restriction, testing, and the courage to cut away.",
  tiphareth: "Tiphareth is the heart, the solar centre, and the harmonized self.",
  netzach: "Netzach is desire, emotion, and the vitality that keeps moving.",
  hod: "Hod is intellect, language, and the architecture of thought.",
  yesod: "Yesod is the subconscious, the astral image, and the root of manifestation.",
  malkuth:
    "Malkuth is the body, the world, and the place where the reading becomes real.",
  sun: "The Sun is the conscious self and the Will that organizes the Work.",
  moon: "The Moon is the unconscious, memory, and the tides beneath the will.",
  mercury: "Mercury is the mind, communication, and the power to translate.",
  venus: "Venus is love, attraction, and the desire that draws the Work forward.",
  mars: "Mars is action, conflict, and the heat that breaks old forms.",
  jupiter: "Jupiter is expansion, fortune, and the generosity that makes room.",
  saturn: "Saturn is limit, time, and the structure that gives the Work its shape.",
  you: "You are your position, desire, and contribution to the bond.",
  other: "The Other is the energy you meet, read as a dynamic rather than a verdict.",
  bond: "The Bond is what actually exists between you, independent of either fantasy.",
  challenge: "The Challenge is the friction that must be faced rather than avoided.",
  potential: "The Potential is what the bond can become when both Wills are honoured.",
};

export interface TreeTriad {
  id: string;
  name: string;
  positions: readonly string[];
}

export const TREE_TRIADS: readonly TreeTriad[] = [
  {
    id: "supernal",
    name: "supernal triangle",
    positions: ["kether", "chokmah", "binah"],
  },
  {
    id: "ethical",
    name: "ethical triangle",
    positions: ["chesed", "geburah", "tiphareth"],
  },
  {
    id: "astral",
    name: "astral triangle",
    positions: ["netzach", "hod", "yesod"],
  },
  { id: "malkuth", name: "Malkuth", positions: ["malkuth"] },
];

export const ELEMENTS = ["Fire", "Water", "Air", "Earth"] as const;

export const HEXAGRAM_POSITION_IDS = new Set([
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
]);
