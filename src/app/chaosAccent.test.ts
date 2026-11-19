import { describe, expect, it } from "vitest";
import chaosCss from "../styles/chaos.css?raw";
import {
  CHAOS_ACCENTS,
  accentLabel,
  pickChaosAccent,
  type ChaosAccent,
} from "./chaosAccent";

function accentRgb(id: ChaosAccent): [number, number, number] {
  const block = chaosCss.match(
    new RegExp(`\\[data-accent="${id}"\\]\\s*\\{([^}]*)\\}`),
  )?.[1];
  const values = block?.match(/--chaos-accent-rgb:\s*(\d+)\s+(\d+)\s+(\d+)/);

  if (!values) {
    throw new Error(`Missing CSS accent block for ${id}`);
  }

  return [Number(values[1]), Number(values[2]), Number(values[3])];
}

function luminance([red, green, blue]: [number, number, number]): number {
  const [r, g, b] = [red, green, blue]
    .map((channel) => channel / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    ) as [number, number, number];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastAgainstBlack(rgb: [number, number, number]): number {
  const accent = luminance(rgb);
  const black = luminance([5, 5, 5]);

  return (accent + 0.05) / (black + 0.05);
}

describe("Chaos accents", () => {
  it("defines a distinct, labelled choice for every accent", () => {
    const ids = CHAOS_ACCENTS.map((accent) => accent.id);
    const labels = CHAOS_ACCENTS.map((accent) => accent.label);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(labels).size).toBe(labels.length);

    for (const accent of CHAOS_ACCENTS) {
      expect(accentLabel(accent.id)).toBe(accent.label);
    }
  });

  it("keeps every accent at AAA contrast against the black shell", () => {
    for (const accent of CHAOS_ACCENTS) {
      const ratio = contrastAgainstBlack(accentRgb(accent.id));

      expect(ratio, `${accent.id} contrast`).toBeGreaterThanOrEqual(7);
    }
  });

  it("picks from the top and bottom of the random range", () => {
    expect(pickChaosAccent(() => 0)).toBe(CHAOS_ACCENTS[0].id);
    expect(pickChaosAccent(() => 0.999999)).toBe(
      CHAOS_ACCENTS[CHAOS_ACCENTS.length - 1]?.id,
    );
  });

  it("never rerolls the accent that is already showing", () => {
    for (const accent of CHAOS_ACCENTS) {
      expect(pickChaosAccent(() => 0, accent.id)).not.toBe(accent.id);
      expect(pickChaosAccent(() => 0.999999, accent.id)).not.toBe(accent.id);
    }
  });
});
