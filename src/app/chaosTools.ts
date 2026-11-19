import { PATHS } from "./paths";

export interface ChaosTool {
  id: string;
  title: string;
  path: string;
  description: string;
}

/** The canonical toolkit index, shared by the home grid and the Sources page. */
export const CHAOS_TOOLS: readonly ChaosTool[] = [
  {
    id: "sigil",
    title: "Sigil Forge",
    path: PATHS.chaosSigil,
    description: "Reduce a statement to its charge letters and draw a repeatable glyph.",
  },
  {
    id: "gnosis",
    title: "Gnosis Timer",
    path: PATHS.chaosGnosis,
    description: "A silent countdown for focused attention, with pause and reset.",
  },
  {
    id: "cut-up",
    title: "Cut-up Oracle",
    path: PATHS.chaosCutUp,
    description: "Shuffle your own words into a new reading.",
  },
  {
    id: "servitors",
    title: "Servitor Workshop",
    path: PATHS.chaosServitors,
    description: "Give a task a name, a form, and a review date — then retire it.",
  },
  {
    id: "paradigms",
    title: "Paradigm Shift",
    path: PATHS.chaosParadigms,
    description: "Try a temporary belief and record what changes.",
  },
  {
    id: "record",
    title: "Magical Record",
    path: PATHS.chaosRecord,
    description: "Keep experiments, results, and reflections in this browser.",
  },
  {
    id: "working",
    title: "Working Composer",
    path: PATHS.chaosWorking,
    description: "Build a working with an intention, action, closing, and reflection.",
  },
  {
    id: "sources",
    title: "Sources & Context",
    path: PATHS.chaosSources,
    description:
      "Read the history, the disputed claims, and the safety notes behind each tool.",
  },
];
