import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SUIT_ELEMENTS, SEPHIROTH } from "../domain/tree";
import type { NumberRank } from "../domain/types";
import {
  ALL_CARDS,
  CARD_BY_ID,
  CUPS_CARDS,
  DISKS_CARDS,
  MAJOR_CARDS,
  SWORDS_CARDS,
  WANDS_CARDS,
} from "./cards";

const NUMBER_RANKS: readonly NumberRank[] = [
  "Ace",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
];

const IMAGE_DIR = join(process.cwd(), "public", "images", "cards");

describe("deck composition", () => {
  it("contains 78 unique cards", () => {
    expect(ALL_CARDS).toHaveLength(78);
    expect(CARD_BY_ID.size).toBe(78);
    expect(new Set(ALL_CARDS.map((card) => card.id)).size).toBe(78);
  });

  it("contains 22 majors and four suits of 14", () => {
    expect(MAJOR_CARDS).toHaveLength(22);
    expect(WANDS_CARDS).toHaveLength(14);
    expect(CUPS_CARDS).toHaveLength(14);
    expect(SWORDS_CARDS).toHaveLength(14);
    expect(DISKS_CARDS).toHaveLength(14);
  });

  it("uses all 22 Hebrew letters exactly once", () => {
    const letters = MAJOR_CARDS.map((card) => card.hebrewLetter);
    const characters = MAJOR_CARDS.map((card) => card.hebrewLetterChar);

    expect(new Set(letters).size).toBe(22);
    expect(new Set(characters).size).toBe(22);
  });

  it("assigns each major to a unique Tree path from 11 to 32", () => {
    const pathNumbers = MAJOR_CARDS.map((card) => card.path.number).sort(
      (left, right) => left - right,
    );

    expect(pathNumbers).toEqual(Array.from({ length: 22 }, (_, index) => index + 11));

    const sephiraIds = new Set(SEPHIROTH.map((sephira) => sephira.id));

    for (const card of MAJOR_CARDS) {
      expect(sephiraIds.has(card.path.from)).toBe(true);
      expect(sephiraIds.has(card.path.to)).toBe(true);
      expect(card.path.from).not.toBe(card.path.to);
    }
  });

  it("keeps the Thelemic Emperor and Star correction", () => {
    const emperor = CARD_BY_ID.get("major-04-emperor");
    const star = CARD_BY_ID.get("major-17-star");

    expect(emperor?.kind).toBe("major");
    expect(star?.kind).toBe("major");

    if (emperor?.kind !== "major" || star?.kind !== "major") {
      throw new Error("Expected the Emperor and Star to be major cards.");
    }

    expect(emperor.hebrewLetter).toBe("Tzaddi");
    expect(emperor.path.number).toBe(28);
    expect(star.hebrewLetter).toBe("Heh");
    expect(star.path.number).toBe(15);
  });

  it("has optimized AVIF and WebP artwork for every card", () => {
    for (const card of ALL_CARDS) {
      expect(existsSync(join(IMAGE_DIR, `${card.id}.avif`))).toBe(true);
      expect(existsSync(join(IMAGE_DIR, `${card.id}.webp`))).toBe(true);
    }

    expect(existsSync(join(process.cwd(), "public", "images", "back-cover.avif"))).toBe(
      true,
    );
    expect(existsSync(join(process.cwd(), "public", "images", "back-cover.webp"))).toBe(
      true,
    );
  });
});

describe("card content", () => {
  it("provides the required study content for every card", () => {
    for (const card of ALL_CARDS) {
      expect(card.id).toMatch(/^[a-z0-9-]+$/);
      expect(card.name.length).toBeGreaterThan(2);
      expect(card.keywords.length).toBeGreaterThanOrEqual(3);
      expect(card.essence.length).toBeGreaterThan(40);
      expect(card.upright.length).toBeGreaterThan(40);
      expect(card.shadow.length).toBeGreaterThan(40);
      expect(card.symbolism.length).toBeGreaterThanOrEqual(3);
      expect(card.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it("gives every minor card a valid rank, Sephira, and decan", () => {
    const sephiraIds = new Set(SEPHIROTH.map((sephira) => sephira.id));

    for (const card of ALL_CARDS) {
      if (card.kind !== "minor") continue;

      expect(card.element).toBe(SUIT_ELEMENTS[card.suit]);
      expect(card.number).toBeGreaterThanOrEqual(1);
      expect(card.number).toBeLessThanOrEqual(10);
      expect(card.rank).toBe(NUMBER_RANKS[card.number - 1]);
      expect(sephiraIds.has(card.sephira)).toBe(true);
      expect(card.lordTitle.length).toBeGreaterThan(4);

      if (card.rank === "Ace") {
        expect(card.decan).toBeUndefined();
      } else {
        expect(card.decan).toBeTruthy();
      }
    }
  });

  it("gives every court card a sub-element and zodiac range", () => {
    for (const card of ALL_CARDS) {
      if (card.kind !== "court") continue;

      expect(card.suit).toBeTruthy();
      expect(card.courtElement).toMatch(/part of (Fire|Water|Air|Earth)/);
      expect(card.zodiacRange).toBeTruthy();
      expect(card.rank).toMatch(/^(Knight|Queen|Prince|Princess)$/);
    }
  });

  it("gives every major a Hebrew letter, title, and Tree path", () => {
    for (const card of MAJOR_CARDS) {
      expect(card.hebrewLetter.length).toBeGreaterThan(2);
      expect(card.hebrewLetterChar.length).toBeGreaterThan(0);
      expect(card.gdTitle.length).toBeGreaterThan(4);
      expect(card.path.number).toBeGreaterThanOrEqual(11);
      expect(card.path.number).toBeLessThanOrEqual(32);
    }
  });
});
