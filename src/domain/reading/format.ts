import { SEPHIRA_BY_ID } from "../tree";
import { DEPTH_LABELS, LENS_LABELS } from "./language";
import { ELEMENTS } from "./positions";
import { describeCard } from "./text";
import type { ReadingInput, ReadingInterpretation } from "./types";

/** Plain text suitable for the clipboard or a note-taking app. */
export function formatReading(
  interpretation: ReadingInterpretation,
  input: Pick<ReadingInput, "spread" | "question">,
): string {
  const lines: string[] = [`Thoth Tarot — ${input.spread.name}`];
  const question = input.question?.trim();

  if (question) {
    lines.push(`Question: ${question}`);
  }

  lines.push(
    `Lens: ${LENS_LABELS[interpretation.working.lens]}`,
    `Depth: ${DEPTH_LABELS[interpretation.depth]}`,
    "",
  );
  lines.push(interpretation.headline, "");

  interpretation.overview.forEach((paragraph) => {
    lines.push(paragraph, "");
  });

  if (interpretation.notices.length > 0) {
    lines.push("What stands out");

    interpretation.notices.forEach((notice) => {
      lines.push(`• ${notice.title}. ${notice.body}`);
    });

    lines.push("");
  }

  if (interpretation.depth !== "brief" && interpretation.positions.length > 0) {
    lines.push("The cards in their positions");

    interpretation.positions.forEach((position) => {
      lines.push(
        "",
        `${position.drawn.position.label} — ${describeCard(position.drawn, true)}`,
        position.body,
      );
    });

    lines.push("");
  }

  if (interpretation.depth !== "brief" && interpretation.movement.length > 0) {
    lines.push("How the spread moves");

    interpretation.movement.forEach((paragraph) => {
      lines.push("", paragraph);
    });

    lines.push("");
  }

  lines.push("How this reading was built");
  lines.push(
    `Elements: ${ELEMENTS.filter(
      (element) => interpretation.working.elements[element] > 0,
    )
      .map((element) => `${element} ${interpretation.working.elements[element]}`)
      .join(" · ")}`,
  );
  lines.push(
    `Arcana: ${interpretation.working.kinds.major} major · ${interpretation.working.kinds.minor} minor · ${interpretation.working.kinds.court} court`,
  );
  lines.push(
    `Orientation: ${interpretation.working.orientations.upright} upright · ${interpretation.working.orientations.shadow} shadow`,
  );

  const shared = interpretation.working.sephiraTouches[0];
  if (shared) {
    lines.push(
      `Shared Sephira: ${SEPHIRA_BY_ID[shared.sephira].name} (${shared.cards.length} cards)`,
    );
  }

  if (interpretation.working.repeatedNumbers.length > 0) {
    lines.push(
      `Repeated number: ${interpretation.working.repeatedNumbers
        .map((group) => `${group.rank} (${group.cards.length})`)
        .join(" · ")}`,
    );
  }

  if (interpretation.working.resonances.length > 0) {
    lines.push("Resonances:");

    interpretation.working.resonances.forEach((resonance) => {
      lines.push(
        `• ${resonance.drawn.card.name} in ${resonance.stationLabel}: ${resonance.detail}`,
      );
    });
  }

  lines.push("", "One action", interpretation.action, "");
  lines.push("A reading for reflection, not prediction.");

  return lines.join("\n");
}
