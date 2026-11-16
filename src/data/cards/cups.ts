import type { CourtCard, MinorCard } from "../../domain/types";

const SMALL_SOURCE = "https://hermetic.com/crowley/book-of-thoth/small-cards";
const COURT_SOURCE = "https://hermetic.com/crowley/book-of-thoth/court-cards";

const cupsSmall: MinorCard[] = [
  {
    id: "cups-ace",
    kind: "minor",
    name: "Ace of Cups",
    suit: "Cups",
    rank: "Ace",
    number: 1,
    element: "Water",
    sephira: "kether",
    lordTitle: "Root of the Powers of Water",
    keywords: ["love", "opening", "compassion", "receptivity", "grace"],
    essence:
      "The root of Water: the pure grail of love before it has been given an object. It is the heart opened, the seed of compassion, and the vessel of grace.",
    upright:
      "A new opening of love, compassion, or intuitive feeling. Receive what is being offered; the cup is full before you know how to name it.",
    shadow:
      "A blocked heart, sentimentality, or the fear of being filled. The vessel is guarded at the very moment it could be nourished.",
    symbolism: [
      "The chalice: receptivity and the womb of creation.",
      "The overflowing water: love that cannot be contained.",
      "The Yod: the seed of emotional life.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "cups-two",
    kind: "minor",
    name: "Two of Cups",
    suit: "Cups",
    rank: "Two",
    number: 2,
    element: "Water",
    sephira: "chokmah",
    decan: "Venus in Cancer",
    lordTitle: "Lord of Love",
    keywords: ["love", "union", "partnership", "attraction", "harmony"],
    essence:
      "The Lord of Love: the meeting of two waters that recognize one another. It is the first differentiation of love into relationship.",
    upright:
      "Partnership, mutual attraction, and emotional harmony. A genuine meeting of equals; let love be reciprocal rather than possessive.",
    shadow: "Codependence, imbalance, or a union built on need rather than recognition.",
    symbolism: [
      "The two cups: the union of opposites.",
      "Venus in Cancer: tender, fertile attraction.",
      "The water: feeling that seeks its own level.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "cups-three",
    kind: "minor",
    name: "Three of Cups",
    suit: "Cups",
    rank: "Three",
    number: 3,
    element: "Water",
    sephira: "binah",
    decan: "Mercury in Cancer",
    lordTitle: "Lord of Abundance",
    keywords: ["abundance", "friendship", "celebration", "generosity", "community"],
    essence:
      "Love has come to fruition and spills over into community. The Three of Cups is abundance as shared joy, the feast that is only complete when others are at the table.",
    upright:
      "Friendship, celebration, and generous connection. Let the good thing become a shared thing.",
    shadow: "Excess, gossip, or superficiality that mistakes stimulation for intimacy.",
    symbolism: [
      "The three cups: the first stable form of love.",
      "Mercury in Cancer: communication warmed by feeling.",
      "The overflow: abundance that seeks company.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "cups-four",
    kind: "minor",
    name: "Four of Cups",
    suit: "Cups",
    rank: "Four",
    number: 4,
    element: "Water",
    sephira: "chesed",
    decan: "Moon in Cancer",
    lordTitle: "Lord of Luxury",
    keywords: ["luxury", "contentment", "pleasure", "rest", "stability"],
    essence:
      "Pleasure has become stable. The Four of Cups is luxury: emotional comfort that has settled into a form, with all the beauty and stagnation that stability brings.",
    upright:
      "Contentment, sensual delight, and the permission to rest. Enjoy what you have without turning comfort into a cage.",
    shadow:
      "Indulgence, emotional numbness, or the refusal to leave a comfortable arrangement that no longer feeds you.",
    symbolism: [
      "The four cups: the fourfold stability of feeling.",
      "The Moon in Cancer: memory, comfort, and the home of the heart.",
      "The still water: pleasure at rest.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "cups-five",
    kind: "minor",
    name: "Five of Cups",
    suit: "Cups",
    rank: "Five",
    number: 5,
    element: "Water",
    sephira: "geburah",
    decan: "Mars in Scorpio",
    lordTitle: "Lord of Disappointment",
    keywords: ["disappointment", "loss", "grief", "challenge", "letting go"],
    essence:
      "The disturbance of emotional ease. Mars in Scorpio brings loss, grief, and the uncomfortable truth that pleasure cannot be held forever.",
    upright:
      "Disappointment, emotional challenge, and the need to grieve. Let the loss be real; the cup that remains can still be drunk.",
    shadow:
      "Wallowing, bitterness, or a refusal to grieve that turns pain into resentment.",
    symbolism: [
      "The spilled cups: what cannot be recovered.",
      "Mars in Scorpio: the cutting edge of desire.",
      "The remaining cups: what is still available.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "cups-six",
    kind: "minor",
    name: "Six of Cups",
    suit: "Cups",
    rank: "Six",
    number: 6,
    element: "Water",
    sephira: "tiphareth",
    decan: "Sun in Scorpio",
    lordTitle: "Lord of Pleasure",
    keywords: ["pleasure", "harmony", "fertility", "joy", "balance"],
    essence:
      "Pleasure harmonized in the solar centre. The Six of Cups is fertile joy: the heart at peace with its own desire, one of the best cards in the pack.",
    upright:
      "Happiness, mutual pleasure, and emotional balance. Say yes to what is good without demanding that it last forever.",
    shadow:
      "Hedonism, complacency, or a pleasure that avoids the deeper work of relationship.",
    symbolism: [
      "The sun: pleasure illuminated by consciousness.",
      "The six cups: the harmony of the heart.",
      "Scorpio: depth, fertility, and transformation.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "cups-seven",
    kind: "minor",
    name: "Seven of Cups",
    suit: "Cups",
    rank: "Seven",
    number: 7,
    element: "Water",
    sephira: "netzach",
    decan: "Venus in Scorpio",
    lordTitle: "Lord of Debauch",
    keywords: ["illusion", "temptation", "excess", "confusion", "escapism"],
    essence:
      "The degeneration of desire. The Seven of Cups is poison in the cup: false pleasure, intoxication, and the sinking into a dream that cannot nourish.",
    upright:
      "Temptation, illusion, and a choice made under the spell of fantasy. Name what you actually want; the shining cup may be empty.",
    shadow:
      "Addiction, self-destruction, or the deliberate confusion of desire with escape.",
    symbolism: [
      "The seven cups: desire multiplying into fantasy.",
      "Venus in Scorpio: pleasure fused with poison.",
      "The mire: what happens when feeling has no ground.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "cups-eight",
    kind: "minor",
    name: "Eight of Cups",
    suit: "Cups",
    rank: "Eight",
    number: 8,
    element: "Water",
    sephira: "hod",
    decan: "Saturn in Pisces",
    lordTitle: "Lord of Indolence",
    keywords: ["withdrawal", "disappointment", "apathy", "rest", "retreat"],
    essence:
      "The party that never happens. Saturn in Pisces brings a heavy, disappointed inertia: the exhaustion of feeling that has lost its current.",
    upright:
      "Withdrawal, emotional fatigue, and the need to retreat. Stop pretending the celebration is working; rest and let the water settle.",
    shadow: "Depression, apathy, or a withdrawal that becomes permanent isolation.",
    symbolism: [
      "The stagnant water: feeling without movement.",
      "Saturn in Pisces: limitation dissolving into formlessness.",
      "The abandoned cups: what the heart can no longer pretend to enjoy.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "cups-nine",
    kind: "minor",
    name: "Nine of Cups",
    suit: "Cups",
    rank: "Nine",
    number: 9,
    element: "Water",
    sephira: "yesod",
    decan: "Jupiter in Pisces",
    lordTitle: "Lord of Happiness",
    keywords: ["happiness", "contentment", "wishes", "generosity", "satisfaction"],
    essence:
      "The full impact of Water in its most material sense: happiness as luck and satisfaction. Jupiter in Pisces is good fortune, but also complete satiety.",
    upright:
      "Contentment, wishes fulfilled, and the enjoyment of what has been given. Be grateful without mistaking satisfaction for permanence.",
    shadow:
      "Smugness, satiety, or the illusion that the good feeling can be held forever.",
    symbolism: [
      "The nine cups: the full tide of feeling.",
      "Jupiter in Pisces: expansive luck in the watery realm.",
      "The satisfied figure: the dream of rest.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
  {
    id: "cups-ten",
    kind: "minor",
    name: "Ten of Cups",
    suit: "Cups",
    rank: "Ten",
    number: 10,
    element: "Water",
    sephira: "malkuth",
    decan: "Mars in Pisces",
    lordTitle: "Lord of Satiety",
    keywords: ["completion", "family", "satiety", "dissolution", "fulfilment"],
    essence:
      "The end of emotional energy: the cup is full, and fullness itself becomes a kind of emptiness. The Ten of Cups is completion in the world of feeling.",
    upright:
      "Family, emotional completion, and the end of a cycle. Receive the fullness, knowing that all full cups eventually return to the sea.",
    shadow:
      "Emotional exhaustion, dissolution, or a false peace that avoids the next transformation.",
    symbolism: [
      "The ten cups: the completed vessel.",
      "Mars in Pisces: desire dissolving into the ocean.",
      "Malkuth: the emotional harvest in the material world.",
    ],
    sourceUrl: SMALL_SOURCE,
  },
];

const cupsCourt: CourtCard[] = [
  {
    id: "cups-knight",
    kind: "court",
    name: "Knight of Cups",
    suit: "Cups",
    rank: "Knight",
    element: "Fire",
    courtElement: "Fiery part of Water",
    zodiacRange: "21° Aquarius – 20° Pisces",
    keywords: ["romance", "idealism", "sensitivity", "passion", "grace"],
    essence:
      "The swift, passionate attack of rain and springs. The Knight of Cups is the most active aspect of Water: graceful, idealistic, and easily moved.",
    upright:
      "Romance, idealism, and emotional initiative. Lead with feeling, but give the feeling a form that can endure.",
    shadow:
      "Moodiness, escapism, or a sensitivity that becomes instability. Passion without depth can disappear like rain.",
    symbolism: [
      "The white charger: active, leaping Water.",
      "The cup with the crab: the cardinal sign of Water.",
      "The peacock: the brilliance of water in motion.",
    ],
    sourceUrl: COURT_SOURCE,
  },
  {
    id: "cups-queen",
    kind: "court",
    name: "Queen of Cups",
    suit: "Cups",
    rank: "Queen",
    element: "Water",
    courtElement: "Watery part of Water",
    zodiacRange: "21° Gemini – 20° Cancer",
    keywords: ["compassion", "intuition", "receptivity", "dreams", "tranquillity"],
    essence:
      "Water's power of reception and reflection. The Queen of Cups is enthroned on still water, a perfect mirror of whatever comes near her.",
    upright:
      "Compassion, intuition, and emotional depth. Receive without losing yourself; the mirror can reflect without becoming the image.",
    shadow:
      "Moodiness, dependence, manipulation, or a receptivity that has no centre of its own.",
    symbolism: [
      "The still water: the reflective mind.",
      "The shell cup: the womb of feeling.",
      "The lotus of Isis: the Great Mother.",
    ],
    sourceUrl: COURT_SOURCE,
  },
  {
    id: "cups-prince",
    kind: "court",
    name: "Prince of Cups",
    suit: "Cups",
    rank: "Prince",
    element: "Air",
    courtElement: "Airy part of Water",
    zodiacRange: "21° Libra – 20° Scorpio",
    keywords: ["diplomacy", "secrecy", "artistry", "emotion", "ambition"],
    essence:
      "The airy part of Water: subtlety, volatility, and the secret intensity of Scorpio. The Prince is an artist of feeling, calm on the surface and passionate beneath.",
    upright:
      "Emotional intelligence, diplomacy, and artistic craft. Let the secret passion serve the work rather than the ego.",
    shadow:
      "Manipulation, secrecy, ruthlessness, or a charm that conceals a complete lack of conscience.",
    symbolism: [
      "The eagle: the spiritualized Scorpio.",
      "The serpent in the cup: hidden wisdom and poison.",
      "The stagnant lake: the calm surface of deep feeling.",
    ],
    sourceUrl: COURT_SOURCE,
  },
  {
    id: "cups-princess",
    kind: "court",
    name: "Princess of Cups",
    suit: "Cups",
    rank: "Princess",
    element: "Earth",
    courtElement: "Earthy part of Water",
    zodiacRange: "No zodiacal attribution",
    keywords: ["gentleness", "romance", "creativity", "tenderness", "dreams"],
    essence:
      "The crystallization of Water: the power to give substance to feeling. The Princess dances in a robe of flowing light, turning dream into form.",
    upright:
      "Gentleness, romance, and creative tenderness. Let the dream take shape; sweetness is a strength when it is allowed to become real.",
    shadow:
      "Sentimentality, passivity, or an escapist fantasy that never touches the ground.",
    symbolism: [
      "The swan: the word AUM and the process of creation.",
      "The covered cup: the dream not yet revealed.",
      "The dolphin: the royal fish of creation.",
    ],
    sourceUrl: COURT_SOURCE,
  },
];

export const CUPS_CARDS = [...cupsSmall, ...cupsCourt];
