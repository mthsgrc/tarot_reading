import { describe, expect, it } from "vitest";
import {
  DEFAULT_GNOSIS_MINUTES,
  GNOSIS_MINUTES,
  formatClock,
  gnosisSeconds,
} from "./gnosis";

describe("gnosis spans", () => {
  it("offers short, predictable durations and a default", () => {
    expect(GNOSIS_MINUTES).toEqual([3, 5, 10, 20]);
    expect(GNOSIS_MINUTES).toContain(DEFAULT_GNOSIS_MINUTES);
    expect(gnosisSeconds(3)).toBe(180);
    expect(gnosisSeconds(20)).toBe(1200);
  });
});

describe("formatClock", () => {
  it("formats whole seconds as MM:SS", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(59)).toBe("00:59");
    expect(formatClock(60)).toBe("01:00");
    expect(formatClock(600)).toBe("10:00");
    expect(formatClock(1200)).toBe("20:00");
  });

  it("clamps negative values and rounds partial seconds up", () => {
    expect(formatClock(-4)).toBe("00:00");
    expect(formatClock(58.2)).toBe("00:59");
  });
});
