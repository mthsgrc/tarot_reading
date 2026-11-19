import { describe, expect, it } from "vitest";
import { CUT_UP_TEXT_MAX, buildCutUp, normalizeCutUpText, splitCutUp } from "./cutup";

describe("cut-up text", () => {
  it("normalizes line endings and caps the stored text", () => {
    expect(normalizeCutUpText("  First\r\nSecond  ")).toBe("First\nSecond");
    expect(normalizeCutUpText("x".repeat(CUT_UP_TEXT_MAX + 20))).toHaveLength(
      CUT_UP_TEXT_MAX,
    );
  });

  it("splits non-empty lines and cleans internal spacing", () => {
    expect(splitCutUp("  First   line \n\n Second line  ", "lines")).toEqual([
      "First line",
      "Second line",
    ]);
  });

  it("splits sentences across punctuation and line breaks", () => {
    expect(
      splitCutUp("First sentence. Second sentence!\nThird? No punctuation", "sentences"),
    ).toEqual(["First sentence.", "Second sentence!", "Third?", "No punctuation"]);
  });

  it("returns no fragments for blank text", () => {
    expect(splitCutUp("   \n  ", "lines")).toEqual([]);
    expect(splitCutUp("", "sentences")).toEqual([]);
  });
});

describe("buildCutUp", () => {
  it("needs at least two fragments", () => {
    expect(buildCutUp("", "lines", 0)).toBeNull();
    expect(buildCutUp("Only one line", "lines", 0)).toBeNull();
    expect(buildCutUp("Only one sentence.", "sentences", 0)).toBeNull();
  });

  it("rearranges the first cut and preserves every fragment", () => {
    const cut = buildCutUp("First line\nSecond line", "lines", 0);

    expect(cut).not.toBeNull();
    expect(cut?.fragments).toEqual(["Second line", "First line"]);
    expect([...cut!.fragments].sort()).toEqual(["First line", "Second line"]);
    expect(cut?.cutIndex).toBe(0);
  });

  it("is deterministic for the same text, mode, and cut number", () => {
    const first = buildCutUp("Alpha\nBeta\nGamma", "lines", 2);
    const second = buildCutUp("  Alpha\nBeta\nGamma  ", "lines", 2);

    expect(first).toEqual(second);
  });

  it("moves to a different arrangement when given the previous cut", () => {
    const first = buildCutUp("First line\nSecond line", "lines", 0);
    const second = buildCutUp("First line\nSecond line", "lines", 1, first!.fragments);

    expect(second).not.toBeNull();
    expect(second?.fragments).not.toEqual(first?.fragments);
    expect(second?.fragments).toEqual(["First line", "Second line"]);
  });

  it("changes the arrangement as the cut index changes", () => {
    const cuts = [0, 1, 2, 3].map(
      (index) => buildCutUp("Alpha\nBeta\nGamma\nDelta", "lines", index)!.fragments,
    );

    expect(
      new Set(cuts.map((fragments) => fragments.join("\u0000"))).size,
    ).toBeGreaterThan(1);
  });
});
