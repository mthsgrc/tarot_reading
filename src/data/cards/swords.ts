import type { CourtCard, MinorCard } from "../../domain/types";

const SMALL_SOURCE = "https://hermetic.com/crowley/book-of-thoth/small-cards";
const COURT_SOURCE = "https://hermetic.com/crowley/book-of-thoth/court-cards";

const swordsSmall: MinorCard[] = [
  {
    id: "swords-ace",
    kind: "minor",
    name: "Ace of Swords",
    suit: "Swords",
    rank: "Ace",
    number: 1,
    element: "Air",
    sephira: "kether",
    lordTitle: "Root of the Powers of Air",
    keywords: ["clarity", "truth", "mind", "breakthrough", "discrimination"],
    essence:
      "The root of Air: pure mind before it has been divided by opinion. It is the sword of discrimination, the flash of truth that cuts through confusion.",
    upright:
      "Clarity, truth, and a mental breakthrough. Name the thing accurately; the sword is most useful when it serves reality rather than cleverness.",
    shadow:
      "Confusion, cruelty, or the misuse of intellect as a weapon against the obvious.",
    symbolism: [
      "The sword: discrimination and the power to separate.",
      "The crown: the source of true authority.",
      "The Yod: the seed of conscious thought.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "swords-two",
    kind: "minor",
    name: "Two of Swords",
    suit: "Swords",
    rank: "Two",
    number: 2,
    element: "Air",
    sephira: "chokmah",
    decan: "Moon in Libra",
    lordTitle: "Lord of Peace",
    keywords: ["peace", "truce", "choice", "balance", "stillness"],
    essence:
      "The Lord of Peace: the balance of opposites held before conflict begins. It is not the peace of resolution, but the charged stillness of a choice not yet made.",
    upright:
      "A truce, a pause, or a difficult choice held in balance. Use the stillness to see both sides clearly, then choose.",
    shadow: "Indecision, repression, or a cold war that avoids the conflict it needs.",
    symbolism: [
      "The two swords: opposing ideas held in tension.",
      "The Moon in Libra: feeling and balance in negotiation.",
      "The blindfold or still point: the suspension of judgment.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "swords-three",
    kind: "minor",
    name: "Three of Swords",
    suit: "Swords",
    rank: "Three",
    number: 3,
    element: "Air",
    sephira: "binah",
    decan: "Saturn in Libra",
    lordTitle: "Lord of Sorrow",
    keywords: ["sorrow", "heartbreak", "separation", "truth", "grief"],
    essence:
      "The universal sorrow of Binah: not merely personal disappointment, but the melancholy that comes from seeing separation clearly. The mind has cut the world into pieces.",
    upright:
      "Grief, heartbreak, or a truth that hurts. Let the sorrow be felt; it is the price of seeing clearly.",
    shadow:
      "Despair, self-pity, or a refusal to heal because the wound has become an identity.",
    symbolism: [
      "The three swords: the pain of division.",
      "Saturn in Libra: the weight of judgment.",
      "The heart: what the mind cannot simply solve.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "swords-four",
    kind: "minor",
    name: "Four of Swords",
    suit: "Swords",
    rank: "Four",
    number: 4,
    element: "Air",
    sephira: "chesed",
    decan: "Jupiter in Libra",
    lordTitle: "Lord of Truce",
    keywords: ["truce", "rest", "recovery", "retreat", "stability"],
    essence:
      "The armed peace of Chesed: the strong man keeping his house in order. It is rest after conflict, a temporary stability that must not be mistaken for resolution.",
    upright:
      "Recovery, retreat, and mental rest. Take the pause you need; a clear mind is worth more than a quick answer.",
    shadow: "Avoidance, stagnation, or a truce that leaves the real conflict untouched.",
    symbolism: [
      "The four swords: the fourfold stability of mind.",
      "Jupiter in Libra: generous, lawful peace.",
      "The resting figure: recovery after battle.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "swords-five",
    kind: "minor",
    name: "Five of Swords",
    suit: "Swords",
    rank: "Five",
    number: 5,
    element: "Air",
    sephira: "geburah",
    decan: "Venus in Aquarius",
    lordTitle: "Lord of Defeat",
    keywords: ["defeat", "conflict", "humiliation", "loss", "letting go"],
    essence:
      "The failure of force. The armed peace has broken; the quarrel has broken out, and the mind discovers that winning can still be a defeat.",
    upright:
      "Defeat, conflict, or a battle not worth winning. Concede what must be conceded and learn from the loss.",
    shadow:
      "Revenge, bitterness, or the need to win at any cost. The mind turns conflict into a permanent war.",
    symbolism: [
      "The five swords: force that has exceeded its authority.",
      "Venus in Aquarius: love divided by ideology.",
      "The broken peace: the cost of unresolved conflict.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "swords-six",
    kind: "minor",
    name: "Six of Swords",
    suit: "Swords",
    rank: "Six",
    number: 6,
    element: "Air",
    sephira: "tiphareth",
    decan: "Mercury in Aquarius",
    lordTitle: "Lord of Science",
    keywords: ["science", "clarity", "learning", "transition", "analysis"],
    essence:
      "Intelligence has won to the goal. Mercury in Aquarius is the scientific mind: the ability to analyze, learn, and carry the mind beyond its old division.",
    upright:
      "Clarity, learning, and a successful analysis. Let the mind move from confusion to understanding, even if the crossing is uncomfortable.",
    shadow: "Cold logic, dogmatism, or information that has replaced wisdom.",
    symbolism: [
      "The six swords: the mind brought into order.",
      "Mercury: intelligence and transmission.",
      "The crossing: movement from one mental state to another.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "swords-seven",
    kind: "minor",
    name: "Seven of Swords",
    suit: "Swords",
    rank: "Seven",
    number: 7,
    element: "Air",
    sephira: "netzach",
    decan: "Moon in Aquarius",
    lordTitle: "Lord of Futility",
    keywords: ["futility", "deception", "strategy", "self-sabotage", "fatigue"],
    essence:
      "The weakness of Air below the Abyss: the little energy that remains is dream-work, incapable of sustained effort. The Seven of Swords is the cunning that cannot deliver.",
    upright:
      "Futility, unfinished projects, or a strategy that avoids the real work. Stop trying to outsmart the situation; choose one honest action.",
    shadow: "Deception, self-sabotage, or exhaustion disguised as cleverness.",
    symbolism: [
      "The seven swords: scattered mental effort.",
      "The Moon in Aquarius: dreams detached from reality.",
      "The stolen or abandoned weapons: intelligence without integrity.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "swords-eight",
    kind: "minor",
    name: "Eight of Swords",
    suit: "Swords",
    rank: "Eight",
    number: 8,
    element: "Air",
    sephira: "hod",
    decan: "Jupiter in Gemini",
    lordTitle: "Lord of Interference",
    keywords: ["interference", "restriction", "obstacles", "perspective", "bad luck"],
    essence:
      "Good-natured meddling and sheer unforeseen interference. The Eight of Swords is the mind trapped by its own cleverness and by trivial events that alter everything.",
    upright:
      "Restriction, interference, and a situation that needs a new perspective. The cage may be made of assumptions rather than iron.",
    shadow:
      "Paralysis, self-imposed limits, or a refusal to see the way out that is already available.",
    symbolism: [
      "The eight swords: a fence built from thought.",
      "Jupiter in Gemini: expansive intelligence meeting confusion.",
      "The bound figure: the illusion of powerlessness.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "swords-nine",
    kind: "minor",
    name: "Nine of Swords",
    suit: "Swords",
    rank: "Nine",
    number: 9,
    element: "Air",
    sephira: "yesod",
    decan: "Mars in Gemini",
    lordTitle: "Lord of Cruelty",
    keywords: ["anxiety", "nightmares", "anguish", "cruelty", "despair"],
    essence:
      "The mind turned against itself. Mars in Gemini is agony of thought: the Ruach consuming itself in analysis until only despair remains.",
    upright:
      "Anxiety, nightmares, and mental anguish. Name the fear, bring it into the light, and remember that the mind is not always a reliable witness.",
    shadow:
      "Despair, paranoia, or self-harm through thought. The cruelty is now directed inward.",
    symbolism: [
      "The nine swords: thought repeated until it becomes torture.",
      "Mars in Gemini: the aggressive mind.",
      "The sleepless figure: the night of the soul.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "swords-ten",
    kind: "minor",
    name: "Ten of Swords",
    suit: "Swords",
    rank: "Ten",
    number: 10,
    element: "Air",
    sephira: "malkuth",
    decan: "Sun in Gemini",
    lordTitle: "Lord of Ruin",
    keywords: ["ruin", "ending", "exhaustion", "survival", "truth"],
    essence:
      "The end of a mental cycle. The Ten of Swords is ruin: the painful finality that comes when a way of thinking has exhausted itself, and the strange survival that follows.",
    upright:
      "A painful ending, exhaustion, and the truth that ends a delusion. The worst has happened; now the cycle can close.",
    shadow: "Collapse, victimhood, or a refusal to end what is already over.",
    symbolism: [
      "The ten swords: the completion of mental suffering.",
      "The Sun in Gemini: clarity at the end of the cycle.",
      "The fallen figure: the death of an old way of knowing.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
];

const swordsCourt: CourtCard[] = [
  {
    id: "swords-knight",
    kind: "court",
    name: "Knight of Swords",
    suit: "Swords",
    rank: "Knight",
    element: "Fire",
    courtElement: "Fiery part of Air",
    zodiacRange: "21° Taurus – 20° Gemini",
    keywords: ["attack", "ambition", "speed", "courage", "force"],
    essence:
      "The wind and the storm: the violent power of motion applied to Air. The Knight of Swords is the spirit of the tempest, armed with sword and poniard.",
    upright:
      "Decisive action, ambition, and speed. Strike while the idea is clear, but aim before you swing.",
    shadow: "Recklessness, aggression, or inadequate violence that ends in futility.",
    symbolism: [
      "The maddened steed: thought driven to attack.",
      "The revolving wing: the storm of Air.",
      "The sword and poniard: the double edge of intellect.",
    ],
    sourceUrl: COURT_SOURCE,
  },
  {
    id: "swords-queen",
    kind: "court",
    name: "Queen of Swords",
    suit: "Swords",
    rank: "Queen",
    element: "Water",
    courtElement: "Watery part of Air",
    zodiacRange: "21° Virgo – 20° Libra",
    keywords: ["discernment", "independence", "honesty", "clarity", "perception"],
    essence:
      "The clear, conscious perception of Idea. The Queen of Swords is the liberator of the mind: perceptive, independent, and unafraid of the truth.",
    upright:
      "Discernment, independence, and honest communication. See clearly, speak precisely, and do not soften the truth into a lie.",
    shadow: "Coldness, cruelty, or cutting words used to keep intimacy at a distance.",
    symbolism: [
      "The sword: the mind's precision.",
      "The severed head: the ego cut away from perception.",
      "The clouds: the realm of Air.",
    ],
    sourceUrl: COURT_SOURCE,
  },
  {
    id: "swords-prince",
    kind: "court",
    name: "Prince of Swords",
    suit: "Swords",
    rank: "Prince",
    element: "Air",
    courtElement: "Airy part of Air",
    zodiacRange: "21° Capricorn – 20° Aquarius",
    keywords: ["intellect", "ideas", "analysis", "movement", "detachment"],
    essence:
      "The mind in its pure element: geometrical, restless, and capable of enormous intellectual movement. The Prince's chariot is drawn by winged children, all caprice and no direction.",
    upright:
      "Intellect, ideas, and analytical force. Give the mind a clear aim; otherwise its brilliance will scatter.",
    shadow:
      "Overthinking, manipulation, or a cleverness disconnected from the body and the heart.",
    symbolism: [
      "The winged children: thoughts that move without reins.",
      "The geometric chariot: the mind's abstract constructions.",
      "The child's head: the secret crown of Tiphareth.",
    ],
    sourceUrl: COURT_SOURCE,
  },
  {
    id: "swords-princess",
    kind: "court",
    name: "Princess of Swords",
    suit: "Swords",
    rank: "Princess",
    element: "Earth",
    courtElement: "Earthy part of Air",
    zodiacRange: "No zodiacal attribution",
    keywords: ["curiosity", "vigilance", "observation", "restlessness", "clarity"],
    essence:
      "The crystallization of Air: the mind made sharp and watchful. The Princess of Swords is curiosity armed with a blade, the intelligence that tests everything.",
    upright:
      "Vigilance, curiosity, and clear observation. Ask the difficult question and trust what you see.",
    shadow:
      "Gossip, deception, or a restless defensiveness that turns every observation into an accusation.",
    symbolism: [
      "The drawn sword: readiness to discern.",
      "The cloud: the realm of thought.",
      "The watchful stance: the mind on guard.",
    ],
    sourceUrl: COURT_SOURCE,
  },
];

export const SWORDS_CARDS = [...swordsSmall, ...swordsCourt];
