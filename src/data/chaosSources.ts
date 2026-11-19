/** Static reference copy for the Sources & Context page. */

export interface ChaosContextNote {
  title: string;
  body: string;
}

export const CHAOS_CONTEXT_NOTES: readonly ChaosContextNote[] = [
  {
    title: "A modern current, not a single lineage",
    body: "Chaos magic as a named current took shape in the late twentieth century. It draws on Austin Osman Spare's sigil work, Western occultism, experimental art, and the groups around the Illuminates of Thanateros. Its origins and influences are debated, so this app treats them as history and context rather than a claim of unbroken lineage.",
  },
  {
    title: "Belief is treated as a tool",
    body: "A common chaos magic idea is that a belief can be adopted temporarily for what it changes in attention or action, then set aside. The app uses that idea as a reflective prompt. It does not claim that a temporary belief becomes true.",
  },
  {
    title: "Sigils are a focus technique",
    body: "Spare's method is often summarized as simplifying a written statement and forming a glyph from what remains. This app removes vowels and repeated consonants, then draws a mirrored, deterministic shape. That geometry is an original variation for repeatability; it is not a reproduction of a historical hand.",
  },
  {
    title: "Gnosis is a contested word",
    body: "In chaos magic, gnosis often names an absorbed or altered state of attention. Elsewhere the word means knowledge or direct experience. The Gnosis Timer only measures a span you choose. It does not induce a state, prescribe breathwork, or replace medical care.",
  },
  {
    title: "Servitors are practitioner language",
    body: "Practitioners describe servitors and egregores as constructed entities or group thoughtforms. The workshop treats a servitor as a named intention and a creative record, not as an external agent with authority over you. The record is a prompt to review, not an instruction to believe.",
  },
  {
    title: "Cut-up is an art technique",
    body: "Brion Gysin and William S. Burroughs popularized cut-up in the mid-twentieth century, though collage and chance operations are older. This app uses a deterministic shuffle of your own words. It is a prompt for noticing adjacency, not a forecast.",
  },
  {
    title: "Records are not proof of causation",
    body: "Keeping a magical record is common across esoteric traditions. It is useful for memory, pattern-spotting, and reflection, but it cannot establish that a working caused an outcome. The Magical Record is a private log, not evidence.",
  },
];

export interface ChaosToolClaim {
  id: string;
  does: string;
  doesNot: string;
}

export const CHAOS_TOOL_CLAIMS: readonly ChaosToolClaim[] = [
  {
    id: "sigil",
    does: "Reduces a statement to unique consonants and draws a repeatable glyph.",
    doesNot: "Does not predict, charge, or prove anything.",
  },
  {
    id: "gnosis",
    does: "Times a span of attention you choose.",
    doesNot: "Does not induce a state, guide breathwork, or replace medical care.",
  },
  {
    id: "cut-up",
    does: "Reorders your own lines or sentences with a deterministic shuffle.",
    doesNot: "Does not forecast or tell you what the words mean.",
  },
  {
    id: "servitors",
    does: "Keeps a local record of a named intention and its review date.",
    doesNot:
      "Does not create an external being, enforce a task, or replace a relationship.",
  },
  {
    id: "paradigms",
    does: "Tracks a temporary belief and what you notice while holding it.",
    doesNot: "Does not make the belief true or override evidence.",
  },
  {
    id: "record",
    does: "Stores local workings, results, and reflections in one log.",
    doesNot: "Does not prove causation or replace professional advice.",
  },
  {
    id: "working",
    does: "Structures an intention, action, and closing, then saves it to the record.",
    doesNot: "Does not teach a ritual, banishing, or initiation.",
  },
];

export interface ChaosSafetyNote {
  title: string;
  body: string;
}

export const CHAOS_SAFETY_NOTES: readonly ChaosSafetyNote[] = [
  {
    title: "No guided dangerous practices",
    body: "This app does not guide breath-holding, hyperventilation, sleep deprivation, fasting, pain, or any practice that could harm you or someone else. The Gnosis Timer times a span; it does not prescribe how to fill it.",
  },
  {
    title: "Stop and get support",
    body: "If a practice leaves you panicked, dissociated, dizzy, or unwell, stop. Talk to someone you trust or a qualified professional. This app is not a crisis service, and its content is not medical advice.",
  },
  {
    title: "Keep it consent-based",
    body: "Do not use these tools to target, coerce, monitor, or make decisions for another person. The app does not provide love spells, hexes, or advice about someone else's choices. It is a private reflective toolkit.",
  },
  {
    title: "Ritual and banishing are context only",
    body: "Forms of ritual and banishing vary by tradition. The Working Composer asks how you will close and return; it does not provide a guided banishing or initiation. If you want to learn one, use a trusted teacher or community and check the risks.",
  },
  {
    title: "Privacy is local",
    body: "Records stay in this browser. Nothing is uploaded. A downloaded sigil carries only its charge letters in metadata, but the visible shape or the statement on screen may still be sensitive. Share only what you intend to share.",
  },
  {
    title: "Not professional advice",
    body: "Readings and workings are for reflection. They are not medical, legal, financial, or relationship advice. A record can help you notice a pattern; it cannot diagnose a condition or make a decision for you.",
  },
];

export interface ChaosSourceLink {
  title: string;
  href: string;
  publisher: string;
  note: string;
}

export const CHAOS_SOURCE_LINKS: readonly ChaosSourceLink[] = [
  {
    title: "Chaos magic",
    href: "https://en.wikipedia.org/wiki/Chaos_magic",
    publisher: "Wikipedia",
    note: "Overview of the current, its claims, and its history.",
  },
  {
    title: "Austin Osman Spare",
    href: "https://en.wikipedia.org/wiki/Austin_Osman_Spare",
    publisher: "Wikipedia",
    note: "Artist and occultist whose sigil work is a common reference point.",
  },
  {
    title: "Sigil (magic)",
    href: "https://en.wikipedia.org/wiki/Sigil_(magic)",
    publisher: "Wikipedia",
    note: "Historical and comparative overview; not instructions for this app.",
  },
  {
    title: "Cut-up technique",
    href: "https://en.wikipedia.org/wiki/Cut-up_technique",
    publisher: "Wikipedia",
    note: "Art context for Gysin and Burroughs; broader than divination.",
  },
  {
    title: "Illuminates of Thanateros",
    href: "https://en.wikipedia.org/wiki/Illuminates_of_Thanateros",
    publisher: "Wikipedia",
    note: "A major organized chaos magic group, founded in the late 1970s.",
  },
  {
    title: "Egregore",
    href: "https://en.wikipedia.org/wiki/Egregore",
    publisher: "Wikipedia",
    note: "Context for group thoughtforms; this app does not create or contact one.",
  },
  {
    title: "Magical record",
    href: "https://en.wikipedia.org/wiki/Magical_record",
    publisher: "Wikipedia",
    note: "Historical context for keeping a record of workings.",
  },
  {
    title: "Hermetic Library: Chaos",
    href: "https://hermetic.com/chaos",
    publisher: "Hermetic Library",
    note: "An archive of primary and secondary material. The site blocks some automated fetchers; open it in a browser.",
  },
];

export interface ChaosFurtherReading {
  author: string;
  title: string;
  year: string;
  note: string;
}

export const CHAOS_FURTHER_READING: readonly ChaosFurtherReading[] = [
  {
    author: "Austin Osman Spare",
    title: "The Book of Pleasure (Self-Love): The Psychology of Ecstasy",
    year: "1913",
    note: "A primary source for Spare's sigil and ecstasy ideas. Read it as a historical and artistic text, not a clinical manual.",
  },
  {
    author: "Peter J. Carroll",
    title: "Liber Null & Psychonaut",
    year: "1987 combined edition",
    note: "A foundational chaos magic text. It contains claims and practices this app does not reproduce.",
  },
  {
    author: "Phil Hine",
    title: "Condensed Chaos: An Introduction to Chaos Magic",
    year: "1995",
    note: "An accessible introduction from inside the current. Still an emic account, not neutral scholarship.",
  },
  {
    author: "Brion Gysin and William S. Burroughs",
    title: "The Third Mind",
    year: "1978",
    note: "Cut-up as collaborative art and method. Not a divination manual.",
  },
  {
    author: "Jan Fries",
    title: "Visual Magick: A Manual of Freestyle Shamanism",
    year: "1992",
    note: "A practical sigil and trance text. It is not a clinical or safety source.",
  },
];
