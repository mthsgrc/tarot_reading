/**
 * Accent choices for the Chaos shell. The ids are also the `data-accent`
 * values in `styles/chaos.css`, where each one maps to a contrast-safe colour.
 */
export const CHAOS_ACCENTS = [
  { id: "acid", label: "Acid" },
  { id: "signal", label: "Signal" },
  { id: "ion", label: "Ion" },
  { id: "magenta", label: "Magenta" },
  { id: "sulfur", label: "Sulfur" },
  { id: "ultraviolet", label: "Ultraviolet" },
  { id: "ember", label: "Ember" },
  { id: "mint", label: "Mint" },
] as const;

export type ChaosAccent = (typeof CHAOS_ACCENTS)[number]["id"];

export function accentLabel(accent: ChaosAccent): string {
  return CHAOS_ACCENTS.find((choice) => choice.id === accent)?.label ?? "Signal";
}

/**
 * Picks one accent for the app load. `exclude` lets the reroll button avoid
 * choosing the colour that is already on screen.
 */
export function pickChaosAccent(
  random: () => number = Math.random,
  exclude?: ChaosAccent,
): ChaosAccent {
  const choices = exclude
    ? CHAOS_ACCENTS.filter((choice) => choice.id !== exclude)
    : CHAOS_ACCENTS;
  const index = Math.min(
    Math.max(Math.floor(random() * choices.length), 0),
    choices.length - 1,
  );

  return choices[index]?.id ?? CHAOS_ACCENTS[0].id;
}
