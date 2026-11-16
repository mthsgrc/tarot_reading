import type { CourtCard, MinorCard } from "../../domain/types";

const SMALL_SOURCE = "https://hermetic.com/crowley/book-of-thoth/small-cards";
const COURT_SOURCE = "https://hermetic.com/crowley/book-of-thoth/court-cards";

const disksSmall: MinorCard[] = [
  {
    id: "disks-ace",
    kind: "minor",
    name: "Ace of Disks",
    suit: "Disks",
    rank: "Ace",
    number: 1,
    element: "Earth",
    sephira: "kether",
    lordTitle: "Root of the Powers of Earth",
    keywords: ["opportunity", "grounding", "prosperity", "body", "manifestation"],
    essence:
      "The root of Earth: the seed of the material world before it has grown. It is the opportunity that exists in the body, the land, and the work of the hands.",
    upright:
      "A new material opportunity, grounding, and the seed of prosperity. Put your hands in the soil; the idea becomes real through work.",
    shadow:
      "A missed opportunity, scarcity consciousness, or a disconnection from the body and the earth.",
    symbolism: [
      "The disk: the coin and the field.",
      "The seed: potential waiting for cultivation.",
      "The Yod: the point of material beginning.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "disks-two",
    kind: "minor",
    name: "Two of Disks",
    suit: "Disks",
    rank: "Two",
    number: 2,
    element: "Earth",
    sephira: "chokmah",
    decan: "Jupiter in Capricorn",
    lordTitle: "Lord of Harmonious Change",
    keywords: ["change", "balance", "adaptability", "priorities", "flow"],
    essence:
      "The harmonious change of Earth: the serpent of the endless band, the ability to keep moving without losing balance. Two polarities are held in a living equilibrium.",
    upright:
      "Adaptability, juggling priorities, and the flow of change. Keep adjusting; balance is a motion, not a fixed position.",
    shadow:
      "Overcommitment, disorganization, or one area of life collapsing under the weight of another.",
    symbolism: [
      "The two disks: the polarity of Earth.",
      "The serpent: the endless cycle of change.",
      "Jupiter in Capricorn: expansion grounded in structure.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "disks-three",
    kind: "minor",
    name: "Three of Disks",
    suit: "Disks",
    rank: "Three",
    number: 3,
    element: "Earth",
    sephira: "binah",
    decan: "Mars in Capricorn",
    lordTitle: "Lord of Work",
    keywords: ["work", "craftsmanship", "collaboration", "building", "skill"],
    essence:
      "Earth has taken form through work. The Three of Disks is the craft that builds something lasting, the collaboration of skill and material.",
    upright:
      "Collaboration, craftsmanship, and the satisfaction of work done well. Build the thing; the structure will hold.",
    shadow:
      "Poor teamwork, unfinished work, or effort that is not recognized or rewarded.",
    symbolism: [
      "The three disks: a stable material form.",
      "The pyramid: the first solid structure.",
      "Mars in Capricorn: disciplined effort.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "disks-four",
    kind: "minor",
    name: "Four of Disks",
    suit: "Disks",
    rank: "Four",
    number: 4,
    element: "Earth",
    sephira: "chesed",
    decan: "Sun in Capricorn",
    lordTitle: "Lord of Power",
    keywords: ["power", "security", "stability", "control", "law"],
    essence:
      "The stabilized power of Chesed: law, constitution, and the solidity of things that have been secured. It is the power that keeps the world in order.",
    upright:
      "Security, stability, and the wise use of resources. Build the structure that protects what matters.",
    shadow: "Greed, rigidity, or the fear of loss that turns security into a prison.",
    symbolism: [
      "The four disks: the fourfold foundation of the material world.",
      "The Sun in Capricorn: conscious power in structure.",
      "The castle: what is built to endure.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "disks-five",
    kind: "minor",
    name: "Five of Disks",
    suit: "Disks",
    rank: "Five",
    number: 5,
    element: "Earth",
    sephira: "geburah",
    decan: "Mercury in Taurus",
    lordTitle: "Lord of Worry",
    keywords: ["hardship", "scarcity", "worry", "support", "insecurity"],
    essence:
      "The soft quiet of the Four has been overthrown. The Five of Disks is material worry: the economic order breaks down, and the body feels the lack.",
    upright:
      "Hardship, scarcity, and the need for support. Acknowledge the difficulty and ask for help; poverty is not a moral failure.",
    shadow:
      "Poverty consciousness, isolation, or despair that refuses the help that is available.",
    symbolism: [
      "The five disks: the disturbance of matter.",
      "Mercury in Taurus: practical intelligence under pressure.",
      "The winter landscape: the season of scarcity.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "disks-six",
    kind: "minor",
    name: "Six of Disks",
    suit: "Disks",
    rank: "Six",
    number: 6,
    element: "Earth",
    sephira: "tiphareth",
    decan: "Moon in Taurus",
    lordTitle: "Lord of Success",
    keywords: ["success", "generosity", "exchange", "balance", "stability"],
    essence:
      "The material world at its practical best: success and balanced exchange. The Moon in Taurus is fertile, stable, and generous, if a little dreamy.",
    upright:
      "Success, generosity, and fair exchange. Enjoy the harvest and share it; the gift returns in ways the ledger cannot show.",
    shadow:
      "Strings attached, imbalance, or giving that creates debt rather than relationship.",
    symbolism: [
      "The six disks: balanced material exchange.",
      "The Moon in Taurus: fertility and comfort.",
      "The gifts: generosity as a social glue.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "disks-seven",
    kind: "minor",
    name: "Seven of Disks",
    suit: "Disks",
    rank: "Seven",
    number: 7,
    element: "Earth",
    sephira: "netzach",
    decan: "Saturn in Taurus",
    lordTitle: "Lord of Failure",
    keywords: ["failure", "delay", "patience", "evaluation", "exhaustion"],
    essence:
      "The harvest that does not come. Saturn in Taurus brings the slow disappointment of labour that has lost its reward, and the need to reassess.",
    upright:
      "Failure, delay, and the need to evaluate what you are growing. Not every seed is meant for this field.",
    shadow: "Stubbornness, wasted effort, or the refusal to abandon a failed crop.",
    symbolism: [
      "The seven disks: labour waiting for a harvest.",
      "Saturn in Taurus: the weight of time in the body.",
      "The fallow field: what must be left to rest.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "disks-eight",
    kind: "minor",
    name: "Eight of Disks",
    suit: "Disks",
    rank: "Eight",
    number: 8,
    element: "Earth",
    sephira: "hod",
    decan: "Sun in Virgo",
    lordTitle: "Lord of Prudence",
    keywords: ["prudence", "diligence", "craft", "detail", "patience"],
    essence:
      "The card of the husbandman: sow the seed, do the careful work, and wait. Eight of Disks is prudence and craftsmanship, the long game of the material world.",
    upright:
      "Diligence, skill, and practical attention to detail. Do the next small thing well; the harvest is built from repetitions.",
    shadow: "Perfectionism, monotonous work, or effort without purpose.",
    symbolism: [
      "The eight disks: the patient accumulation of skill.",
      "The Sun in Virgo: clarity in the details.",
      "The garden: cultivation over time.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "disks-nine",
    kind: "minor",
    name: "Nine of Disks",
    suit: "Disks",
    rank: "Nine",
    number: 9,
    element: "Earth",
    sephira: "yesod",
    decan: "Venus in Virgo",
    lordTitle: "Lord of Gain",
    keywords: ["gain", "independence", "comfort", "sufficiency", "pleasure"],
    essence:
      "The full impact of Earth in its most material sense: gain, comfort, and self-sufficiency. Venus in Virgo rewards the work that has been done well.",
    upright:
      "Abundance, independence, and the pleasure of what you have earned. Enjoy the garden without forgetting who tends it.",
    shadow: "Overwork, loneliness, or a materialism that mistakes comfort for meaning.",
    symbolism: [
      "The nine disks: the complete harvest.",
      "Venus in Virgo: pleasure refined through craft.",
      "The garden: the reward of patient cultivation.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "disks-ten",
    kind: "minor",
    name: "Ten of Disks",
    suit: "Disks",
    rank: "Ten",
    number: 10,
    element: "Earth",
    sephira: "malkuth",
    decan: "Mercury in Virgo",
    lordTitle: "Lord of Wealth",
    keywords: ["wealth", "legacy", "family", "stability", "materialization"],
    essence:
      "The end of all energy in the material world: wealth, family, and the completed structure. The Ten of Disks is the harvest fully gathered in Malkuth.",
    upright:
      "Wealth, legacy, and long-term stability. Build for those who come after you, not only for yourself.",
    shadow:
      "Financial strain, family conflict, or a foundation that looks solid but is hollow.",
    symbolism: [
      "The ten disks: the complete material cycle.",
      "Mercury in Virgo: practical intelligence in the harvest.",
      "The family: legacy in the flesh.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
];

const disksCourt: CourtCard[] = [
  {
    id: "disks-knight",
    kind: "court",
    name: "Knight of Disks",
    suit: "Disks",
    rank: "Knight",
    element: "Fire",
    courtElement: "Fiery part of Earth",
    zodiacRange: "21° Leo – 20° Virgo",
    keywords: ["persistence", "duty", "progress", "labour", "reliability"],
    essence:
      "The active, driving power of Earth. The Knight of Disks is the labourer who moves mountains by carrying one stone at a time.",
    upright:
      "Persistence, duty, and steady progress. Keep going; the work itself is the ritual.",
    shadow:
      "Stubbornness, rigidity, or a workaholism that has forgotten why the work matters.",
    symbolism: [
      "The plough: the slow turning of the earth.",
      "The full armour: endurance in the material world.",
      "The steady pace: progress without haste.",
    ],
    sourceUrl: COURT_SOURCE,
  },
  {
    id: "disks-queen",
    kind: "court",
    name: "Queen of Disks",
    suit: "Disks",
    rank: "Queen",
    element: "Water",
    courtElement: "Watery part of Earth",
    zodiacRange: "21° Sagittarius – 20° Capricorn",
    keywords: ["nurture", "abundance", "wisdom", "care", "grounding"],
    essence:
      "The watery part of Earth: the power to nourish and make things grow. The Queen of Disks is practical wisdom and the abundance that comes from care.",
    upright:
      "Nurture, abundance, and grounded care. Tend what is alive, including yourself.",
    shadow: "Neglect, smothering, or martyrdom disguised as care.",
    symbolism: [
      "The fertile land: abundance through nurture.",
      "The goat: Capricorn's patient climb.",
      "The cup: feeling made fruitful in matter.",
    ],
    sourceUrl: COURT_SOURCE,
  },
  {
    id: "disks-prince",
    kind: "court",
    name: "Prince of Disks",
    suit: "Disks",
    rank: "Prince",
    element: "Air",
    courtElement: "Airy part of Earth",
    zodiacRange: "21° Aries – 20° Taurus",
    keywords: ["patience", "reliability", "planning", "growth", "stability"],
    essence:
      "The intelligence of Earth: patient planning and the slow growth of something that will last. The Prince of Disks builds with care.",
    upright:
      "Reliability, patience, and practical planning. Think in seasons, not days, and let the work mature.",
    shadow: "Stagnation, overcaution, or a lack of vision that mistakes safety for life.",
    symbolism: [
      "The bull: Taurus, the slow and fertile power of Earth.",
      "The plough: cultivation and planning.",
      "The solid figure: the body as a foundation.",
    ],
    sourceUrl: COURT_SOURCE,
  },
  {
    id: "disks-princess",
    kind: "court",
    name: "Princess of Disks",
    suit: "Disks",
    rank: "Princess",
    element: "Earth",
    courtElement: "Earthy part of Earth",
    zodiacRange: "No zodiacal attribution",
    keywords: ["practicality", "vitality", "beginning", "body", "fertility"],
    essence:
      "The seed of Earth: physical vitality, fertility, and the power of the body. The Princess of Disks is the ground in which everything else can take root.",
    upright:
      "Practicality, vitality, and a grounded new beginning. Start with the body, the home, and the work in front of you.",
    shadow:
      "Laziness, neglect, or a lack of follow-through that leaves the seed unwatered.",
    symbolism: [
      "The earth: the body and the field.",
      "The seed: potential made physical.",
      "The princess: the embryonic power of the material world.",
    ],
    sourceUrl: COURT_SOURCE,
  },
];

export const DISKS_CARDS = [...disksSmall, ...disksCourt];
