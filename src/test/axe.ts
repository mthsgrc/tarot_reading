import * as axe from "axe-core";
import { expect } from "vitest";

/**
 * Runs axe against the rendered document under the WCAG A/AA tags.
 *
 * jsdom has no layout or paint, so color contrast cannot be judged here. Keep
 * that check in the browser pass and use this audit for structure, names,
 * roles, and relationships.
 */
export async function expectNoAccessibilityViolations(): Promise<void> {
  const results = await axe.run(document.body, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
    },
    rules: {
      "color-contrast": { enabled: false },
    },
  });

  const details = results.violations
    .map((violation) => {
      const nodes = violation.nodes
        .map(
          (node) =>
            `  ${node.target.join(" ")}\n    ${node.failureSummary ?? "No detail"}`,
        )
        .join("\n");

      return `[${violation.impact}] ${violation.id}: ${violation.help}\n${nodes}`;
    })
    .join("\n\n");

  expect(results.violations, details).toEqual([]);
}
