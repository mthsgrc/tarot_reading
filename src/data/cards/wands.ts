import type { CourtCard, MinorCard } from "../../domain/types";

const SMALL_SOURCE = "https://hermetic.com/crowley/book-of-thoth/small-cards";
const COURT_SOURCE = "https://hermetic.com/crowley/book-of-thoth/court-cards";

const wandsSmall: MinorCard[] = [
  {
    id: "wands-ace",
    kind: "minor",
    name: "Ace of Wands",
    suit: "Wands",
    rank: "Ace",
    number: 1,
    element: "Fire",
    sephira: "kether",
    lordTitle: "Root of the Powers of Fire",
    keywords: ["initiation", "will", "spark", "creation", "energy"],
    essence:
      "The root of Fire: pure will before it has chosen a direction. It is the lightning stroke, the seed of every creative act, and the first yes of the universe.",
    upright:
      "A new spark of will, inspiration, or creative power. Act on the impulse while it is alive. This is the seed of a project, not yet its harvest.",
    shadow:
      "A blocked or scattered spark, false enthusiasm, or the fear of beginning. The fire is present but has no vessel.",
    symbolism: [
      "The flame: undivided creative energy.",
      "The Yod: the first point of manifestation.",
      "The wand: the instrument of will.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "wands-two",
    kind: "minor",
    name: "Two of Wands",
    suit: "Wands",
    rank: "Two",
    number: 2,
    element: "Fire",
    sephira: "chokmah",
    decan: "Mars in Aries",
    lordTitle: "Lord of Dominion",
    keywords: ["dominion", "leadership", "boldness", "initiative", "power"],
    essence:
      "Fire in its best and highest form: will taking command of its own energy. The Two of Wands is the first act of dominion, the will that knows it can move the world.",
    upright:
      "Leadership, bold initiative, and confidence in your own power. Set the direction and take the first decisive step.",
    shadow:
      "Domination, impatience, or aggression disguised as confidence. Power without listening becomes force without wisdom.",
    symbolism: [
      "The crossed wands: balanced polarity of will.",
      "The flames: Mars in Aries, the fire of first action.",
      "The sphere of Chokmah: undifferentiated creative force.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "wands-three",
    kind: "minor",
    name: "Three of Wands",
    suit: "Wands",
    rank: "Three",
    number: 3,
    element: "Fire",
    sephira: "binah",
    decan: "Sun in Aries",
    lordTitle: "Lord of Virtue",
    keywords: ["virtue", "integrity", "courage", "maturity", "character"],
    essence:
      "Will has become character. The Three of Wands is the fire of virtue: the steady courage that comes when power is shaped by understanding.",
    upright:
      "Integrity, creative maturity, and the courage to act from principle. Your character is the vessel that makes the fire useful.",
    shadow:
      "Pride, self-righteousness, or a performance of virtue that hides a lack of substance.",
    symbolism: [
      "The three flames: will, wisdom, and understanding in balance.",
      "The solar fire: conscious, directed vitality.",
      "The triangle: the first stable form.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "wands-four",
    kind: "minor",
    name: "Four of Wands",
    suit: "Wands",
    rank: "Four",
    number: 4,
    element: "Fire",
    sephira: "chesed",
    decan: "Venus in Aries",
    lordTitle: "Lord of Completion",
    keywords: ["completion", "homecoming", "celebration", "stability", "foundation"],
    essence:
      "The fire has found a home. Completion is the joy of a creative act that has become stable enough to be shared.",
    upright:
      "A celebration, a homecoming, or a foundation worth building on. Enjoy the completion before rushing to the next thing.",
    shadow:
      "Complacency, premature closure, or a celebration that papers over an unfinished structure.",
    symbolism: [
      "The four wands: the four elements stabilized.",
      "The canopy: the shelter created by will.",
      "Venus in Aries: love giving form to fire.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "wands-five",
    kind: "minor",
    name: "Five of Wands",
    suit: "Wands",
    rank: "Five",
    number: 5,
    element: "Fire",
    sephira: "geburah",
    decan: "Saturn in Leo",
    lordTitle: "Lord of Strife",
    keywords: ["strife", "competition", "friction", "conflict", "testing"],
    essence:
      "The introduction of motion into a stable system: the clash of fires. Strife is not evil; it is the friction that tests whether strength is real.",
    upright:
      "Competition, conflict, or necessary friction. Use the resistance to sharpen your will rather than to prove you are right.",
    shadow:
      "Pointless aggression, exhaustion, or conflict that has become an identity. Not every fight is your fight.",
    symbolism: [
      "The crossed wands: competing wills.",
      "Saturn in Leo: discipline meeting pride.",
      "The five points: the disturbance of the fourfold stability.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "wands-six",
    kind: "minor",
    name: "Six of Wands",
    suit: "Wands",
    rank: "Six",
    number: 6,
    element: "Fire",
    sephira: "tiphareth",
    decan: "Jupiter in Leo",
    lordTitle: "Lord of Victory",
    keywords: ["victory", "recognition", "success", "confidence", "triumph"],
    essence:
      "The fire of strife has won through. Victory is the balanced success of Tiphareth: the recognition that comes when energy is rightly spent.",
    upright:
      "Recognition, triumph, and well-earned confidence. Accept the victory, then remember that success is a stage, not a destination.",
    shadow:
      "Arrogance, victory without substance, or the need to be seen winning more than to do the work.",
    symbolism: [
      "The laurel: earned recognition.",
      "The solar centre: balanced success.",
      "Jupiter in Leo: expansive, generous triumph.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "wands-seven",
    kind: "minor",
    name: "Seven of Wands",
    suit: "Wands",
    rank: "Seven",
    number: 7,
    element: "Fire",
    sephira: "netzach",
    decan: "Mars in Leo",
    lordTitle: "Lord of Valour",
    keywords: ["valour", "defence", "perseverance", "courage", "struggle"],
    essence:
      "Energy at its last gasp, struggling to hold the ground it has won. Valour is the courage to keep standing when the fire is running low.",
    upright:
      "Perseverance, defence of what matters, and courage under pressure. Hold your position, but do not confuse stubbornness with strength.",
    shadow:
      "Reckless bravado, exhaustion, or fighting for a position that no longer serves you.",
    symbolism: [
      "The seven wands: the lower seven Sephiroth under strain.",
      "Mars in Leo: the warrior's pride.",
      "The defensive stance: will protecting its ground.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "wands-eight",
    kind: "minor",
    name: "Eight of Wands",
    suit: "Wands",
    rank: "Eight",
    number: 8,
    element: "Fire",
    sephira: "hod",
    decan: "Mercury in Sagittarius",
    lordTitle: "Lord of Swiftness",
    keywords: ["speed", "momentum", "communication", "travel", "news"],
    essence:
      "Fire has become ethereal: the lightning of Mercury in Sagittarius. The gross elements disappear and only swift, bright energy remains.",
    upright:
      "Speed, momentum, and rapid communication. Send the message, make the move, and let the current carry you.",
    shadow: "Haste, scattered energy, or a message sent before it is ready.",
    symbolism: [
      "The eight wands: swift, directed energy.",
      "Mercury: communication and movement.",
      "Sagittarius: the arrow of aim.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "wands-nine",
    kind: "minor",
    name: "Nine of Wands",
    suit: "Wands",
    rank: "Nine",
    number: 9,
    element: "Fire",
    sephira: "yesod",
    decan: "Moon in Sagittarius",
    lordTitle: "Lord of Strength",
    keywords: ["strength", "resilience", "endurance", "stability", "defence"],
    essence:
      "Stability through constant change. The Nine of Wands is the strength that comes from remaining mobile in defence: the fire that will not go out.",
    upright:
      "Resilience, inner strength, and the ability to endure. Keep changing, keep moving, and the centre will hold.",
    shadow: "Defensiveness, rigidity, or a strength that has become a wall against help.",
    symbolism: [
      "The nine wands: the full force of the elemental current.",
      "The Moon: instinct and the tides of energy.",
      "The last defence: strength at the threshold.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "wands-ten",
    kind: "minor",
    name: "Ten of Wands",
    suit: "Wands",
    rank: "Ten",
    number: 10,
    element: "Fire",
    sephira: "malkuth",
    decan: "Saturn in Sagittarius",
    lordTitle: "Lord of Oppression",
    keywords: ["burden", "overextension", "pressure", "responsibility", "collapse"],
    essence:
      "The weight of too much fire. Ten of Wands is the oppression that comes when the creative current has been asked to carry more than it can bear.",
    upright:
      "Burden, overextension, and the need to put something down. Responsibility is real, but not everything on your back belongs to you.",
    shadow:
      "Collapse, resentment, or burnout disguised as duty. The fire has been used to punish rather than create.",
    symbolism: [
      "The ten wands: the full weight of manifestation.",
      "Saturn in Sagittarius: limitation meeting the arrow of aspiration.",
      "Malkuth: the heaviness of the material world.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
];

const wandsCourt: CourtCard[] = [
  {
    id: "wands-knight",
    kind: "court",
    name: "Knight of Wands",
    suit: "Wands",
    rank: "Knight",
    element: "Fire",
    courtElement: "Fiery part of Fire",
    zodiacRange: "21° Scorpio – 20° Sagittarius",
    keywords: ["action", "courage", "generosity", "fierceness", "impulse"],
    essence:
      "The lightning strike of Fire: a warrior in full armour on a black horse, carrying a flaming torch. He is the most active, sublime, and transient aspect of the element.",
    upright:
      "Bold action, generosity, and courage. Move fast and take the initiative; this is a force for breaking through inertia.",
    shadow:
      "Cruelty, bigotry, recklessness, or violence that cannot adapt when the first effort fails.",
    symbolism: [
      "The black horse: the wild, leaping power of Fire.",
      "The flaming torch: original energy.",
      "Complete armour: the element in its most defended, active form.",
    ],
    sourceUrl: COURT_SOURCE,
  },
  {
    id: "wands-queen",
    kind: "court",
    name: "Queen of Wands",
    suit: "Wands",
    rank: "Queen",
    element: "Water",
    courtElement: "Watery part of Fire",
    zodiacRange: "21° Pisces – 20° Aries",
    keywords: ["charisma", "warmth", "adaptability", "authority", "leadership"],
    essence:
      "The fluidity and colour of Fire. The Queen rules from a throne of flame; she is magnetic, adaptable, and capable of immense generosity.",
    upright:
      "Charisma, creative leadership, and warm authority. Lead by attraction rather than force, and let your energy be a gift.",
    shadow:
      "Vanity, jealousy, tyranny, or a warmth that becomes manipulation. She may brood, decide wrongly, and react with sudden savagery.",
    symbolism: [
      "The winged globe and flame: sovereignty through vitality.",
      "The leopard: untamed beauty under the hand.",
      "The cone-topped wand: the mysteries of Bacchus.",
    ],
    sourceUrl: COURT_SOURCE,
  },
  {
    id: "wands-prince",
    kind: "court",
    name: "Prince of Wands",
    suit: "Wands",
    rank: "Prince",
    element: "Air",
    courtElement: "Airy part of Fire",
    zodiacRange: "21° Cancer – 20° Leo",
    keywords: ["vision", "nobility", "strength", "enthusiasm", "pride"],
    essence:
      "The expanding, volatilizing power of Fire. The Prince rides a lion-drawn chariot through a sea of flame, an active intelligence carrying the fire forward.",
    upright:
      "Noble courage, vision, and the power to inspire. He fights best against odds and endures through enormous capacity for work.",
    shadow:
      "Violence, indecision, empty boasting, or a pride that cannot tolerate being wrong.",
    symbolism: [
      "The lion: solar power and royal courage.",
      "The phoenix wand: rebirth through energy.",
      "The flaming chariot: will in motion.",
    ],
    sourceUrl: COURT_SOURCE,
  },
  {
    id: "wands-princess",
    kind: "court",
    name: "Princess of Wands",
    suit: "Wands",
    rank: "Princess",
    element: "Earth",
    courtElement: "Earthy part of Fire",
    zodiacRange: "No zodiacal attribution",
    keywords: ["brilliance", "daring", "enthusiasm", "vitality", "beginnings"],
    essence:
      "The fuel of Fire: the earthy part that makes combustion possible. The Princess is the dance of the virgin priestess of the Lords of Fire.",
    upright:
      "Brilliance, daring, and the enthusiasm of a new creative cycle. She creates her own beauty through vigour and energy.",
    shadow:
      "Superficiality, theatricality, cruelty, or a fire that consumes without direction.",
    symbolism: [
      "The leaping flame: the dance of creation.",
      "The solar disk: the promise of light.",
      "The unclothed figure: the freedom required for chemical combination.",
    ],
    sourceUrl: COURT_SOURCE,
  },
];

export const WANDS_CARDS = [...wandsSmall, ...wandsCourt];
