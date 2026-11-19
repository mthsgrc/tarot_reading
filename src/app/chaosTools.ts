import { PATHS } from "./paths";

export type ChaosToolStatus = "available" | "next";

export interface ChaosTool {
  id: string;
  title: string;
  path: string;
  description: string;
  status: ChaosToolStatus;
}

/** The toolkit index. Mark a tool available only when its route is real. */
export const CHAOS_TOOLS: readonly ChaosTool[] = [
  {
    id: "sigil",
    title: "Sigil Forge",
    path: PATHS.chaosSigil,
    description: "Reduce a statement to its charge letters and draw a repeatable glyph.",
    status: "available",
  },
  {
    id: "gnosis",
    title: "Gnosis Timer",
    path: PATHS.chaosGnosis,
    description: "A silent countdown for focused attention, with pause and reset.",
    status: "available",
  },
  {
    id: "cut-up",
    title: "Cut-up Oracle",
    path: PATHS.chaosCutUp,
    description: "Shuffle your own words into a new reading.",
    status: "available",
  },
  {
    id: "servitors",
    title: "Servitor Workshop",
    path: PATHS.chaosServitors,
    description: "Give a task a name, a form, and a review date — then retire it.",
    status: "available",
  },
  {
    id: "paradigms",
    title: "Paradigm Shift",
    path: PATHS.chaosParadigms,
    description: "Try a temporary belief and record what changes.",
    status: "available",
  },
  {
    id: "record",
    title: "Magical Record",
    path: PATHS.chaosRecord,
    description: "Keep experiments, results, and reflections in this browser.",
    status: "available",
  },
  {
    id: "working",
    title: "Working Composer",
    path: PATHS.chaosWorking,
    description: "Build a working with an intention, action, closing, and reflection.",
    status: "next",
  },
  {
    id: "sources",
    title: "Sources & Context",
    path: PATHS.chaosSources,
    description:
      "Read the history, the disputed claims, and the safety notes behind each tool.",
    status: "next",
  },
];
