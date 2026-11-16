import type { MajorCard } from "../../domain/types";

const ATU_SOURCE = "https://hermetic.com/crowley/book-of-thoth/atu";

/**
 * The 22 Atu. Names follow the Thoth deck, not the Rider–Waite convention.
 *
 * Note the Thelemic correction to the Golden Dawn attributions:
 * Tzaddi is the Emperor and Heh is the Star (Liber AL I:57).
 */
export const MAJOR_CARDS = [
  {
    id: "major-00-fool",
    kind: "major",
    number: 0,
    name: "The Fool",
    element: "Air",
    hebrewLetter: "Aleph",
    hebrewLetterChar: "א",
    gdTitle: "The Spirit of the Aether",
    planet: "Uranus (modern attribution)",
    path: { number: 11, from: "kether", to: "chokmah" },
    keywords: ["beginning", "innocence", "air", "potential", "trust", "folly"],
    essence:
      "The zero-point of the Tree: pure possibility before form. The Fool is the breath of Air that contains all directions and none.",
    upright:
      "A beginning that cannot be justified by reason. Trust the impulse, step into the unknown, and let the situation teach you. Innocence here is not ignorance; it is freedom from the need to control the outcome.",
    shadow:
      "Recklessness, escapism, or a refusal to take the leap while pretending to be free. The shadow Fool scatters energy and mistakes novelty for direction.",
    symbolism: [
      "The crocodile and tiger: the worlds of water and fire that both threaten and initiate.",
      "The dove and ivy: innocence and the spiral of return.",
      "The egg: the universe not yet born.",
      "Zero: the Qabalistic Nothing that is also all things.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-01-magus",
    kind: "major",
    number: 1,
    name: "The Magus",
    element: "Air",
    hebrewLetter: "Beth",
    hebrewLetterChar: "ב",
    gdTitle: "The Magus of Power",
    planet: "Mercury",
    path: { number: 12, from: "kether", to: "binah" },
    keywords: ["will", "word", "magic", "communication", "skill", "trickster"],
    essence:
      "The point of will that speaks the universe into form. Mercury, Thoth, Hermes: the Magus is the Word, the act of communication that turns intention into magic.",
    upright:
      "Concentrated will, skill, and the power of language. Say what you mean, mean what you say, and act with precision. This is a card of magical agency and swift intelligence.",
    shadow:
      "Manipulation, cleverness without ethics, scattered attention, or the illusion that words alone create reality. Beware the trickster who believes his own performance.",
    symbolism: [
      "The caduceus and the winged egg: polarized energy held in balance.",
      "The ibis and the ape: wisdom and mimicry.",
      "The scroll and sword: the word and the will that cuts through illusion.",
      "The number one: the first differentiation from the zero of the Fool.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-02-priestess",
    kind: "major",
    number: 2,
    name: "The Priestess",
    element: "Water",
    hebrewLetter: "Gimel",
    hebrewLetterChar: "ג",
    gdTitle: "The Priestess of the Silver Star",
    planet: "Moon",
    path: { number: 13, from: "kether", to: "tiphareth" },
    keywords: ["intuition", "mystery", "moon", "memory", "silence", "receptivity"],
    essence:
      "The silver star behind the veil. The Priestess is the unconscious, memory, and the reflective intelligence of the Moon; she knows without explaining.",
    upright:
      "Listen inwardly. Intuition, dreams, and hidden knowledge are active. A period of gestation is more valuable than forced action; let the answer emerge from silence.",
    shadow:
      "Ignored intuition, secrecy, dissociation, or a refusal to look beneath the surface. The shadow Priestess can become cold, evasive, or lost in fantasy.",
    symbolism: [
      "The veil of the temple: the boundary between the known and the unknown.",
      "The moon: reflected light and the rhythms of the unconscious.",
      "The camel: endurance through the desert of not-knowing.",
      "The water: memory and the deep mind.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-03-empress",
    kind: "major",
    number: 3,
    name: "The Empress",
    element: "Earth",
    hebrewLetter: "Daleth",
    hebrewLetterChar: "ד",
    gdTitle: "The Daughter of the Mighty Ones",
    planet: "Venus",
    path: { number: 14, from: "chokmah", to: "binah" },
    keywords: ["abundance", "nurture", "beauty", "creation", "body", "Venus"],
    essence:
      "The gate of Venus and the fertile field of creation. The Empress is nature, embodiment, and the abundance that comes when spirit agrees to become matter.",
    upright:
      "Creativity, nurture, pleasure, and growth. Build something that can be touched, fed, and enjoyed. The body and the natural world are part of the Work, not distractions from it.",
    shadow:
      "Smothering attachment, creative block, indulgence, or neglect of the body. The shadow Empress may confuse possession with love or comfort with stagnation.",
    symbolism: [
      "The lotus and the pelican: fertility and self-sacrifice.",
      "The shield with the double eagle: the union of opposites made fertile.",
      "The garden: nature as the throne of spirit.",
      "The Venusian copper: love as a creative force.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-04-emperor",
    kind: "major",
    number: 4,
    name: "The Emperor",
    element: "Fire",
    hebrewLetter: "Tzaddi",
    hebrewLetterChar: "צ",
    gdTitle: "The Son of the Morning",
    zodiac: "Aries",
    path: { number: 28, from: "netzach", to: "yesod" },
    keywords: ["authority", "structure", "Aries", "order", "leadership", "discipline"],
    essence:
      "The Emperor is the ordering power of Aries: the will that gives shape to chaos. In the Thelemic attribution he is Tzaddi, the hook, the point of fixed direction.",
    upright:
      "Structure, authority, and the courage to set boundaries. Lead from a clear centre; a good order frees energy rather than crushing it.",
    shadow:
      "Rigidity, domination, or the fear that without control everything will collapse. The shadow Emperor confuses order with obedience.",
    symbolism: [
      "The ram and the throne: cardinal Fire and the establishment of rule.",
      "The orb and sceptre: sovereignty and direction.",
      "The hook of Tzaddi: that which binds and lifts.",
      "The mountains: the stability of law.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-05-hierophant",
    kind: "major",
    number: 5,
    name: "The Hierophant",
    element: "Earth",
    hebrewLetter: "Vau",
    hebrewLetterChar: "ו",
    gdTitle: "The Magus of the Eternal",
    zodiac: "Taurus",
    path: { number: 16, from: "chokmah", to: "chesed" },
    keywords: ["tradition", "teaching", "Taurus", "doctrine", "guidance", "embodiment"],
    essence:
      "The voice of tradition and the teacher who transmits the mysteries. Taurus, the bull, gives the Hierophant patience, continuity, and the power of embodiment.",
    upright:
      "Learn from a lineage, a teacher, or a tested method. There is value in doing the work as it has been done before you. Shared forms can carry a living current.",
    shadow:
      "Dogma, conformity, spiritual vanity, or rebellion for its own sake. The shadow Hierophant may mistake the institution for the truth it once served.",
    symbolism: [
      "The bull of Taurus: stubborn, patient, and fecund.",
      "The pentagram: the five senses and the human microcosm.",
      "The triple cross: the worlds of the Tree.",
      "The keys: the transmission of knowledge.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-06-lovers",
    kind: "major",
    number: 6,
    name: "The Lovers",
    element: "Air",
    hebrewLetter: "Zayin",
    hebrewLetterChar: "ז",
    gdTitle: "The Children of the Voice Divine",
    zodiac: "Gemini",
    path: { number: 17, from: "binah", to: "tiphareth" },
    keywords: ["union", "choice", "love", "Gemini", "polarity", "partnership"],
    essence:
      "The Lovers are the twins of Gemini, the marriage of opposites that makes consciousness possible. This is not only romance; it is the choice that defines the self.",
    upright:
      "A meaningful union, a decisive choice, and the integration of two forces. Let love become a practice of differentiation rather than a loss of self.",
    shadow:
      "Codependence, divided loyalty, or a choice made to avoid the pain of choosing. The shadow Lovers can become a hall of mirrors.",
    symbolism: [
      "The two figures: Adam and Eve, Cain and Abel, the twins.",
      "The angel or arrow: the third force that consecrates the union.",
      "The serpent and eagle: the lower and higher desires.",
      "The Gemini twins: the tension that generates thought.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-07-chariot",
    kind: "major",
    number: 7,
    name: "The Chariot",
    element: "Water",
    hebrewLetter: "Cheth",
    hebrewLetterChar: "ח",
    gdTitle: "The Child of the Powers of the Waters",
    zodiac: "Cancer",
    path: { number: 18, from: "binah", to: "geburah" },
    keywords: ["willpower", "momentum", "Cancer", "control", "victory", "vehicle"],
    essence:
      "The Chariot is Cancer, the shell that protects the growing self. It is the vehicle of will: motion held together by a disciplined container.",
    upright:
      "Momentum, focus, and the successful integration of opposing drives. Take charge of the vehicle; direction matters more than speed.",
    shadow:
      "Burnout, scattered ambition, or a rigid armour that prevents growth. The shadow Chariot may move fast in the wrong direction.",
    symbolism: [
      "The crab and the chariot: the shell of Cancer and the vehicle of the self.",
      "The two sphinxes or beasts: opposing forces steered by will.",
      "The cup and the shield: reception and defence.",
      "The starry canopy: the field of the Work.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-08-adjustment",
    kind: "major",
    number: 8,
    name: "Adjustment",
    element: "Air",
    hebrewLetter: "Lamed",
    hebrewLetterChar: "ל",
    gdTitle: "The Daughter of the Scales",
    zodiac: "Libra",
    path: { number: 22, from: "geburah", to: "tiphareth" },
    keywords: ["balance", "justice", "truth", "Libra", "correction", "responsibility"],
    essence:
      "Adjustment is Libra: the balance of the scales and the precision that cuts away what cannot be true. The sword does not punish; it corrects.",
    upright:
      "Honesty, proportionality, and the courage to make a necessary correction. Weigh the facts, accept responsibility, and restore equilibrium.",
    shadow:
      "Denial, injustice, self-deception, or a harsh judgment that forgets mercy. The shadow Adjuster may cut too deeply or refuse to weigh at all.",
    symbolism: [
      "The scales: balance and the law of cause and effect.",
      "The sword: discrimination and the clarity that separates.",
      "The woman in the triangle: the equilibrium of opposites.",
      "The Egyptian feather: the heart weighed against truth.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-09-hermit",
    kind: "major",
    number: 9,
    name: "The Hermit",
    element: "Earth",
    hebrewLetter: "Yod",
    hebrewLetterChar: "י",
    gdTitle: "The Magus of the Voice of Light",
    zodiac: "Virgo",
    path: { number: 20, from: "chesed", to: "tiphareth" },
    keywords: ["solitude", "wisdom", "Virgo", "study", "discernment", "guidance"],
    essence:
      "The Hermit is Virgo: the grain of wheat, the labor of discernment, and the light carried inward. He is the magus of the voice of light, not a fugitive from the world.",
    upright:
      "Solitude, study, and the slow work of becoming precise. Withdraw long enough to hear your own voice, then return with something useful.",
    shadow:
      "Isolation, perfectionism, or hiding behind expertise. The shadow Hermit may mistake avoidance for wisdom.",
    symbolism: [
      "The lantern: the light of consciousness carried into the dark.",
      "The staff: support and measure.",
      "The serpent: the coiled energy of generation.",
      "The grain: the harvest of patient work.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-10-fortune",
    kind: "major",
    number: 10,
    name: "Fortune",
    element: "Fire",
    hebrewLetter: "Kaph",
    hebrewLetterChar: "כ",
    gdTitle: "The Lord of the Forces of Life",
    planet: "Jupiter",
    path: { number: 21, from: "chesed", to: "netzach" },
    keywords: ["fate", "change", "Jupiter", "cycle", "luck", "turning point"],
    essence:
      "Fortune is Jupiter and the wheel of change. It is the turning of the worlds, the law of cycles, and the liberating realization that nothing is fixed.",
    upright:
      "A turning point, unexpected luck, or a change you could not force. Move with the cycle; expand your horizon and trust the larger pattern.",
    shadow:
      "Fatalism, addiction to chance, or resistance to change. The shadow Wheel can become a treadmill.",
    symbolism: [
      "The wheel: the cycle of the worlds and the zodiac.",
      "The sphinx: the riddle of the self.",
      "The serpent: descent and renewal.",
      "The ape: the lower mind clinging to the wheel.",
      "The four creatures: the fixed signs.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-11-lust",
    kind: "major",
    number: 11,
    name: "Lust",
    element: "Fire",
    hebrewLetter: "Teth",
    hebrewLetterChar: "ט",
    gdTitle: "The Daughter of the Flaming Sword",
    zodiac: "Leo",
    path: { number: 19, from: "chesed", to: "geburah" },
    keywords: ["desire", "vitality", "Leo", "courage", "passion", "strength"],
    essence:
      "Lust is Leo: the solar fire of desire, the roaring vitality of the beast, and the woman who rides it. In Thelemic terms, this is the strength that comes from embracing desire rather than denying it.",
    upright:
      "Raw vitality, courage, and the creative power of desire. Let the beast be wild and let the woman be wise; the union of instinct and consciousness is the Work.",
    shadow:
      "Consumption, excess, cruelty, or desire that has become a master rather than a power. The shadow Lust may burn through others and call it passion.",
    symbolism: [
      "The beast and the woman: instinct and consciousness in embrace.",
      "The seven heads: the planetary powers.",
      "The cup: the grail of love.",
      "The lion: Leo and the solar heart.",
      "The chain: the voluntary bond of desire.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-12-hanged-man",
    kind: "major",
    number: 12,
    name: "The Hanged Man",
    element: "Water",
    hebrewLetter: "Mem",
    hebrewLetterChar: "מ",
    gdTitle: "The Spirit of the Mighty Waters",
    planet: "Neptune (modern attribution)",
    path: { number: 23, from: "geburah", to: "hod" },
    keywords: [
      "suspension",
      "surrender",
      "Water",
      "initiation",
      "perspective",
      "sacrifice",
    ],
    essence:
      "The Hanged Man is the water of initiation: suspension, reversal, and the surrender that opens a new perspective. He is not punished; he is being turned inside out.",
    upright:
      "A necessary pause, a change of viewpoint, or a sacrifice that creates space. Stop pushing; let the situation invert itself.",
    shadow:
      "Martyrdom, paralysis, or the refusal to let go. The shadow Hanged Man may demand suffering as proof of sincerity.",
    symbolism: [
      "The inverted figure: the reversal of ordinary consciousness.",
      "The water: the unconscious and the womb of rebirth.",
      "The serpent: the current of initiation.",
      "The cross: the four elements and the body.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-13-death",
    kind: "major",
    number: 13,
    name: "Death",
    element: "Water",
    hebrewLetter: "Nun",
    hebrewLetterChar: "נ",
    gdTitle: "The Child of the Great Transformers",
    zodiac: "Scorpio",
    path: { number: 24, from: "tiphareth", to: "netzach" },
    keywords: ["ending", "transformation", "Scorpio", "release", "rebirth", "mortality"],
    essence:
      "Death is Scorpio: the transformation that cannot be reversed, the compost of the old self, and the silence at the threshold. It is an ending that makes the next beginning possible.",
    upright:
      "A clean ending, a metamorphosis, and the release of what has already died. Grieve what is over, then let it return to the ground.",
    shadow:
      "Resistance to change, holding a corpse, or a fear of endings that becomes a living death. The shadow Death may cling to the past with both hands.",
    symbolism: [
      "The skeleton and scythe: the impartial cutting edge of time.",
      "The scorpion, serpent, and eagle: the three stages of Scorpio.",
      "The river: the crossing into the unknown.",
      "The rising sun: renewal beyond the horizon.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-14-art",
    kind: "major",
    number: 14,
    name: "Art",
    element: "Fire",
    hebrewLetter: "Samekh",
    hebrewLetterChar: "ס",
    gdTitle: "The Daughter of the Reconcilers",
    zodiac: "Sagittarius",
    path: { number: 25, from: "tiphareth", to: "yesod" },
    keywords: ["alchemy", "integration", "Sagittarius", "healing", "synthesis", "craft"],
    essence:
      "Art is Sagittarius: the alchemical marriage of opposites, the arrow of direction, and the fire that transmutes. It is the Great Work in its most practical form.",
    upright:
      "Integration, healing, and the patient combination of unlike elements. You are not choosing one side; you are making a third thing from both.",
    shadow:
      "Impurity, misalliance, or a shortcut that avoids the difficult combination. The shadow Art may produce a beautiful surface with no substance.",
    symbolism: [
      "The two vessels: the opposites being poured together.",
      "The arrow: direction and the fire of Sagittarius.",
      "The lion and eagle: the fixed and the volatile.",
      "The rainbow: the bridge between worlds.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-15-devil",
    kind: "major",
    number: 15,
    name: "The Devil",
    element: "Earth",
    hebrewLetter: "Ayin",
    hebrewLetterChar: "ע",
    gdTitle: "The Lord of the Gates of Matter",
    zodiac: "Capricorn",
    path: { number: 26, from: "tiphareth", to: "hod" },
    keywords: ["matter", "desire", "Capricorn", "limitation", "ambition", "shadow"],
    essence:
      "The Devil is Capricorn: the Lord of the Gates of Matter, the dense reality of the body and the world. He is not evil; he is the gravity that tests whether spirit can incarnate.",
    upright:
      "Material reality, ambition, and the power of limitation. Look at what you desire and what you are willing to pay for it; the chain is usually looser than it looks.",
    shadow:
      "Slavery to appetite, exploitation, or the belief that matter is the only reality. The shadow Devil may turn the world into a prison.",
    symbolism: [
      "The goat of Capricorn: the mountain and the drive to climb.",
      "The inverted pentagram: spirit descending into matter.",
      "The chains: attachment and the illusion of necessity.",
      "The torch: the fire of desire.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-16-tower",
    kind: "major",
    number: 16,
    name: "The Tower",
    element: "Fire",
    hebrewLetter: "Peh",
    hebrewLetterChar: "פ",
    gdTitle: "The Lord of the Hosts of the Mighty",
    planet: "Mars",
    path: { number: 27, from: "netzach", to: "hod" },
    keywords: ["upheaval", "revelation", "Mars", "collapse", "liberation", "shock"],
    essence:
      "The Tower is Mars: the sudden lightning that breaks the false structure. It is the destruction of a concept that has become a prison.",
    upright:
      "Upheaval, revelation, and the collapse of something built on a false foundation. Let the lightning do its work; what survives is more real.",
    shadow:
      "Delayed disaster, resistance to the necessary break, or violence that destroys without insight. The shadow Tower may become a permanent state of crisis.",
    symbolism: [
      "The lightning: sudden illumination and the fire of Mars.",
      "The falling figures: the ego and its certainties.",
      "The tower: the false structure of the personality.",
      "The eye: the awakened consciousness.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-17-star",
    kind: "major",
    number: 17,
    name: "The Star",
    element: "Air",
    hebrewLetter: "Heh",
    hebrewLetterChar: "ה",
    gdTitle: "The Daughter of the Firmament",
    zodiac: "Aquarius",
    path: { number: 15, from: "chokmah", to: "tiphareth" },
    keywords: ["hope", "healing", "Aquarius", "vision", "inspiration", "clarity"],
    essence:
      "The Star is Aquarius: the water-bearer who pours the cosmic current into the world. In the Thelemic attribution she is Heh, the window, the aperture through which Nuit's light enters.",
    upright:
      "Hope, healing, and the quiet transmission of a vision. After the Tower, the sky is still there. Let yourself be a channel rather than a controller.",
    shadow:
      "Despair, disconnection from the future, or a vision that never touches the ground. The shadow Star may become escapism.",
    symbolism: [
      "The water poured onto land and sea: the circulation of life.",
      "The seven stars: the planetary spheres.",
      "The ibis: Thoth and the Word.",
      "The naked figure: transparency and the absence of armour.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-18-moon",
    kind: "major",
    number: 18,
    name: "The Moon",
    element: "Water",
    hebrewLetter: "Qoph",
    hebrewLetterChar: "ק",
    gdTitle: "The Ruler of Flux and Reflux",
    zodiac: "Pisces",
    path: { number: 29, from: "netzach", to: "malkuth" },
    keywords: ["illusion", "dream", "Pisces", "intuition", "uncertainty", "shadow"],
    essence:
      "The Moon is Pisces: the tidal mind, the labyrinth of reflection, and the light that reveals only enough to take the next step. It is the realm of dreams and ancestral memory.",
    upright:
      "Uncertainty, imagination, and the need to move by feeling rather than proof. Pay attention to dreams, symbols, and the things that frighten you.",
    shadow:
      "Deception, paranoia, addiction to illusion, or the refusal to distinguish dream from fact. The shadow Moon can drown the mind in its own reflection.",
    symbolism: [
      "The moon: reflected light and the unconscious.",
      "The dogs and wolf: the tamed and untamed instincts.",
      "The crayfish: the first stirrings of life from the deep.",
      "The towers: the gateways of the astral world.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-19-sun",
    kind: "major",
    number: 19,
    name: "The Sun",
    element: "Fire",
    hebrewLetter: "Resh",
    hebrewLetterChar: "ר",
    gdTitle: "The Lord of the Fire of the World",
    planet: "Sun",
    path: { number: 30, from: "hod", to: "yesod" },
    keywords: ["joy", "success", "Sun", "clarity", "vitality", "ego"],
    essence:
      "The Sun is the solar heart: clarity, vitality, and the child who plays in the light. It is the conscious ego illuminated by the deeper self, not the ego pretending to be the whole.",
    upright:
      "Success, joy, and the courage to be seen. Say yes to life; the path is clear enough to walk.",
    shadow:
      "Arrogance, burnout, or a brightness that refuses the shadow. The shadow Sun may demand constant applause.",
    symbolism: [
      "The child: the renewed self.",
      "The sunflowers: the turning of life toward light.",
      "The wall: the boundary of the cultivated world.",
      "The banner: triumph and the joy of manifestation.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-20-aeon",
    kind: "major",
    number: 20,
    name: "The Aeon",
    element: "Fire",
    hebrewLetter: "Shin",
    hebrewLetterChar: "ש",
    gdTitle: "The Spirit of the Primal Fire",
    planet: "Pluto (modern attribution)",
    path: { number: 31, from: "hod", to: "malkuth" },
    keywords: ["aeon", "awakening", "fire", "new age", "Thelema", "rebirth"],
    essence:
      "The Aeon is the new age: the passage from the Aeon of Osiris to the Aeon of Horus. It is the awakening of the child, the fire of a new law, and the end of an old formula.",
    upright:
      "A new era, a radical awakening, and the responsibility of freedom. The old gods are dead; the child is born. Do what thou wilt.",
    shadow:
      "Fear of change, nostalgia for an expired order, or the misuse of new power. The shadow Aeon may announce the new age while repeating the old tyranny.",
    symbolism: [
      "The child Horus: the new solar consciousness.",
      "The three figures: Nuit, Hadit, Ra-Hoor-Khuit.",
      "The fire: the new law.",
      "The vulture and the serpent: the old and new aeons.",
    ],
    sourceUrl: ATU_SOURCE,
  },
  {
    id: "major-21-universe",
    kind: "major",
    number: 21,
    name: "The Universe",
    element: "Earth",
    hebrewLetter: "Tau",
    hebrewLetterChar: "ת",
    gdTitle: "The Great One of the Night of Time",
    planet: "Saturn",
    path: { number: 32, from: "yesod", to: "malkuth" },
    keywords: ["completion", "integration", "Saturn", "world", "dance", "fulfilment"],
    essence:
      "The Universe is Saturn and the completed Great Work: the dance of the world, the body of Nuit, and the return of all things to the circle. It is completion that opens into a new beginning.",
    upright:
      "Completion, integration, and the joy of a cycle brought to its end. Step into the dance; the world is not a prison but a body.",
    shadow:
      "Stagnation, a false finish, or the fear of leaving the known. The shadow Universe may refuse to close the circle and start again.",
    symbolism: [
      "The dancer: the self as the centre of the world.",
      "The serpent: the circle of time.",
      "The four creatures: the fixed signs and the elements.",
      "The veil: the body of Nuit.",
      "The cross: the four quarters.",
    ],
    sourceUrl: ATU_SOURCE,
  },
] as const satisfies readonly MajorCard[];
