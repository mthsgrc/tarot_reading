import { buildFacts } from "./facts";
import { buildFactInsights, selectInsights } from "./notices";
import { buildRelationInsights } from "./relations";
import {
  buildAction,
  buildHeadline,
  buildMovement,
  buildOverview,
  buildPositionInsights,
} from "./synthesis";
import type { ReadingInput, ReadingInterpretation } from "./types";

/**
 * The single entry point for the reading engine.
 *
 * It is deliberately pure: the same spread, cards, orientations, and question
 * always produce the same interpretation. No timers, no randomness, no React.
 */
export function interpretReading(input: ReadingInput): ReadingInterpretation {
  const facts = buildFacts(input);
  const depth = input.depth ?? "standard";
  const notices = selectInsights(
    [
      ...buildFactInsights(facts, input.drawn),
      ...buildRelationInsights(input.spread, input.drawn),
    ],
    facts.total,
    depth,
  );

  return {
    headline: buildHeadline(facts),
    overview: buildOverview(facts),
    notices,
    positions: buildPositionInsights(input.spread, input.drawn, facts),
    movement: buildMovement(input.spread, input.drawn, facts),
    action: buildAction(input.spread, facts),
    depth,
    working: facts,
  };
}
