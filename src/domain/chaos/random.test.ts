import { describe, expect, it } from "vitest";
import { hashString, mulberry32, shuffle } from "./random";

describe("chaos random helpers", () => {
  it("hashes the same text to the same unsigned seed", () => {
    expect(hashString("I will finish the work")).toBe(
      hashString("I will finish the work"),
    );
    expect(hashString("I will finish the work")).not.toBe(
      hashString("I will begin the work"),
    );
    expect(hashString("sigil")).toBeGreaterThanOrEqual(0);
  });

  it("shuffles deterministically without mutating the input", () => {
    const input = [1, 2, 3, 4, 5];
    const first = shuffle(input, mulberry32(1234));
    const second = shuffle(input, mulberry32(1234));

    expect(first).toEqual(second);
    expect(first).not.toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});
