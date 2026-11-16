import type { Spread } from "../domain/types";

export const SPREADS = [
  {
    id: "thelema-triad",
    name: "Thelema Triad",
    subtitle: "Will · Love · Union",
    description:
      "A threefold reading of True Will, the love that informs it, and the knowledge that comes from their union. Begin here when the question is about direction rather than prediction.",
    layout: "row",
    positions: [
      {
        id: "thelema",
        label: "Thelema",
        hint: "Your True Will: the direction that belongs to you, not the one imposed from outside.",
      },
      {
        id: "agape",
        label: "Agapé",
        hint: "The love, desire, or attraction that gives the Will its warmth and motion.",
      },
      {
        id: "gnosis",
        label: "Gnosis",
        hint: "The union of will and love: what becomes known through the act of living it.",
      },
    ],
  },
  {
    id: "past-present-future",
    name: "Past · Present · Future",
    subtitle: "The classic timeline",
    description:
      "The familiar three-card reading, reframed through the Tree of Life: what has shaped you, what is actually present, and what is forming at the edge of events.",
    layout: "row",
    positions: [
      {
        id: "past",
        label: "Past",
        hint: "The root: what has already been woven into the situation and still exerts pressure.",
      },
      {
        id: "present",
        label: "Present",
        hint: "The stem: the living centre of the question as it stands now.",
      },
      {
        id: "future",
        label: "Future",
        hint: "The flower: the direction the current is taking if nothing changes.",
      },
    ],
  },
  {
    id: "thelemic-cross",
    name: "Thelemic Cross",
    subtitle: "Situation · Obstacle · Foundation",
    description:
      "A five-card cross for a question with weight. It separates the conscious intention from the hidden foundation and places the outcome in the wider movement of the Aeon.",
    layout: "cross",
    positions: [
      {
        id: "crown",
        label: "The Crown",
        hint: "What you consciously intend or believe you are doing.",
      },
      {
        id: "abyss",
        label: "The Abyss",
        hint: "The obstacle, contradiction, or lesson that stands between you and the Crown.",
      },
      {
        id: "root",
        label: "The Root",
        hint: "The hidden foundation: the unconscious material that is generating the situation.",
      },
      {
        id: "star",
        label: "The Star",
        hint: "The guiding influence: what is trying to reach you from beyond the immediate problem.",
      },
      {
        id: "aeon",
        label: "The Aeon",
        hint: "The outcome as a movement of the larger cycle, not merely a personal wish.",
      },
    ],
  },
  {
    id: "tree-of-life",
    name: "Tree of Life",
    subtitle: "Ten Sephiroth",
    description:
      "A full Qabalistic reading across the ten Sephiroth. It is best used for deep study or a major life question; read from Kether downward, then return to Malkuth to see how the current lands.",
    layout: "tree",
    positions: [
      {
        id: "kether",
        label: "Kether",
        hint: "The Crown: the source, the impulse before it has a name.",
      },
      {
        id: "chokmah",
        label: "Chokmah",
        hint: "Wisdom: the first flash of creative force.",
      },
      {
        id: "binah",
        label: "Binah",
        hint: "Understanding: the form that receives and shapes the force.",
      },
      {
        id: "chesed",
        label: "Chesed",
        hint: "Mercy: expansion, generosity, and the law that builds.",
      },
      {
        id: "geburah",
        label: "Geburah",
        hint: "Severity: restriction, testing, and the courage to cut away.",
      },
      {
        id: "tiphareth",
        label: "Tiphareth",
        hint: "Beauty: the heart, the solar centre, and the harmonized self.",
      },
      {
        id: "netzach",
        label: "Netzach",
        hint: "Victory: desire, emotion, and the vitality that keeps moving.",
      },
      {
        id: "hod",
        label: "Hod",
        hint: "Splendour: intellect, language, and the architecture of thought.",
      },
      {
        id: "yesod",
        label: "Yesod",
        hint: "Foundation: the subconscious, the astral image, and the root of manifestation.",
      },
      {
        id: "malkuth",
        label: "Malkuth",
        hint: "Kingdom: the body, the world, and the place where the reading becomes real.",
      },
    ],
  },
  {
    id: "great-work-hexagram",
    name: "The Great Work",
    subtitle: "Seven planetary powers",
    description:
      "A Golden Dawn-style planetary hexagram: the Sun at the centre and the six other traditional planets around it. Use it for alchemical questions about integration, power, and the work of becoming whole.",
    layout: "hexagram",
    positions: [
      {
        id: "sun",
        label: "The Sun",
        hint: "The centre: the conscious self and the True Will that organizes the whole.",
      },
      {
        id: "moon",
        label: "The Moon",
        hint: "The unconscious, memory, and the tides that move beneath the will.",
      },
      {
        id: "mercury",
        label: "Mercury",
        hint: "The mind, communication, and the power to translate between worlds.",
      },
      {
        id: "venus",
        label: "Venus",
        hint: "Love, attraction, and the desire that draws the Work forward.",
      },
      {
        id: "mars",
        label: "Mars",
        hint: "Action, conflict, and the heat required to break old forms.",
      },
      {
        id: "jupiter",
        label: "Jupiter",
        hint: "Expansion, fortune, and the generosity that makes room for growth.",
      },
      {
        id: "saturn",
        label: "Saturn",
        hint: "Limit, time, and the structure that gives the Work its shape.",
      },
    ],
  },
  {
    id: "lovers-cross",
    name: "Lovers' Cross",
    subtitle: "Love under Will",
    description:
      "A five-card relationship spread that treats love as a meeting of two Wills, not merely two personalities. It can be used for romance, friendship, or any intimate partnership.",
    layout: "lovers",
    positions: [
      {
        id: "you",
        label: "You",
        hint: "Your position, desire, and contribution to the bond.",
      },
      {
        id: "other",
        label: "The Other",
        hint: "The other person's position, desire, and contribution.",
      },
      {
        id: "bond",
        label: "The Bond",
        hint: "What actually exists between you, independent of either fantasy.",
      },
      {
        id: "challenge",
        label: "The Challenge",
        hint: "The friction that must be faced rather than avoided.",
      },
      {
        id: "potential",
        label: "The Potential",
        hint: "What the bond can become when both Wills are honoured.",
      },
    ],
  },
] as const satisfies readonly Spread[];

export const SPREAD_BY_ID: ReadonlyMap<string, Spread> = new Map(
  SPREADS.map((spread) => [spread.id, spread]),
);

export const DEFAULT_SPREAD = SPREADS[0];
