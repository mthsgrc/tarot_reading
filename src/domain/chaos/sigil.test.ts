import { describe, expect, it } from "vitest";
import {
  SIGIL_STATEMENT_MAX,
  buildSigil,
  normalizeSigilStatement,
  sigilLetters,
  sigilSvgMarkup,
} from "./sigil";

describe("sigil statement", () => {
  it("collapses whitespace and caps the length", () => {
    expect(normalizeSigilStatement("  my   will\n to know  ")).toBe("my will to know");
    expect(normalizeSigilStatement("x".repeat(SIGIL_STATEMENT_MAX + 20))).toHaveLength(
      SIGIL_STATEMENT_MAX,
    );
  });

  it("keeps unique consonants in order and removes vowels and repeats", () => {
    expect(sigilLetters("I will to be free")).toBe("WLTBFR");
    expect(sigilLetters("Why? 123 — now!")).toBe("WHYN");
    expect(sigilLetters("Aeiou")).toBe("");
  });
});

describe("buildSigil", () => {
  it("is deterministic for the same statement", () => {
    const first = buildSigil("I will finish the work");
    const second = buildSigil("  I will finish   the work ");

    expect(first).not.toBeNull();
    expect(second).toEqual(first);
    expect(first?.paths[0]).toMatch(/^M[\d.]+ [\d.]+(?: L[\d.]+ [\d.]+)+$/);
  });

  it("mirrors the main path and changes with the letters", () => {
    const first = buildSigil("I will finish the work");
    const second = buildSigil("I will begin the work");

    expect(first?.paths[0]).not.toBe(first?.paths[1]);
    expect(first?.seed).not.toBe(second?.seed);
    expect(first?.paths).not.toEqual(second?.paths);
  });

  it("refuses statements without at least two charge letters", () => {
    expect(buildSigil("")).toBeNull();
    expect(buildSigil("I am")).toBeNull();
  });

  it("builds a standalone SVG without the private statement in its title", () => {
    const sigil = buildSigil("I will keep <this> & that");
    expect(sigil).not.toBeNull();

    const svg = sigilSvgMarkup(sigil!);
    expect(svg).toContain("<svg");
    expect(svg).toContain("<title>Sigil</title>");
    expect(svg).toContain("Charge letters: W L K P T H S");
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).toContain('stroke="#111111"');
    expect(svg).not.toContain("I will keep");
    expect(svg).not.toContain("<this>");
  });
});
