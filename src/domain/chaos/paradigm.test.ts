import { describe, expect, it } from "vitest";
import {
  PARADIGM_BELIEF_MAX,
  PARADIGM_FILE_VERSION,
  PARADIGM_MAX_RECORDS,
  PARADIGM_PROMPTS,
  PARADIGM_REFLECTION_MAX,
  addParadigmExperiment,
  completeParadigmExperiment,
  createParadigmExperiment,
  deleteParadigmExperiment,
  getOpenParadigm,
  isParadigmReady,
  normalizeParadigmBelief,
  normalizeParadigmReflection,
  paradigmDuration,
  parseParadigms,
  serializeParadigms,
  type ParadigmDuration,
  type ParadigmExperiment,
} from "./paradigm";

const START = "2026-11-19T12:00:00.000Z";

function experiment(overrides: Partial<ParadigmExperiment> = {}): ParadigmExperiment {
  return {
    ...createParadigmExperiment(
      "I can be wrong and still be safe.",
      "day",
      "experiment-1",
      START,
    )!,
    ...overrides,
  };
}

function completedExperiment(index: number): ParadigmExperiment {
  const open = createParadigmExperiment(
    `Temporary belief ${index}`,
    "day",
    `id-${index}`,
    START,
  )!;
  return {
    ...open,
    completedAt: "2026-11-20T12:00:00.000Z",
    reflection: `What I noticed ${index}.`,
  };
}

describe("paradigm text", () => {
  it("normalizes a belief to one line and preserves reflection lines", () => {
    expect(normalizeParadigmBelief("  I can   be wrong \n and safe ")).toBe(
      "I can be wrong and safe",
    );
    expect(normalizeParadigmReflection("  First line\r\n\r\nSecond line  ")).toBe(
      "First line\n\nSecond line",
    );
  });

  it("offers grounded starting points", () => {
    expect(PARADIGM_PROMPTS.length).toBeGreaterThanOrEqual(4);
    expect(PARADIGM_PROMPTS.every((prompt) => prompt.endsWith("."))).toBe(true);
  });
});

describe("createParadigmExperiment", () => {
  it("computes the end from the chosen duration", () => {
    expect(createParadigmExperiment("A belief", "hour", "id", START)?.endsAt).toBe(
      "2026-11-19T13:00:00.000Z",
    );
    expect(createParadigmExperiment("A belief", "day", "id", START)?.endsAt).toBe(
      "2026-11-20T12:00:00.000Z",
    );
    expect(createParadigmExperiment("A belief", "week", "id", START)?.endsAt).toBe(
      "2026-11-26T12:00:00.000Z",
    );
  });

  it("normalizes the belief and starts open", () => {
    const created = createParadigmExperiment(
      "  I notice   what is here. ",
      "day",
      "id",
      START,
    );

    expect(created?.belief).toBe("I notice what is here.");
    expect(created?.completedAt).toBeNull();
    expect(created?.reflection).toBe("");
  });

  it("refuses invalid input", () => {
    expect(createParadigmExperiment("", "day", "id", START)).toBeNull();
    expect(
      createParadigmExperiment("x".repeat(PARADIGM_BELIEF_MAX + 1), "day", "id", START),
    ).toBeNull();
    expect(
      createParadigmExperiment("A belief", "month" as ParadigmDuration, "id", START),
    ).toBeNull();
    expect(createParadigmExperiment("A belief", "day", "", START)).toBeNull();
    expect(createParadigmExperiment("A belief", "day", "id", "yesterday")).toBeNull();
  });

  it("labels durations", () => {
    expect(paradigmDuration("hour").label).toBe("One hour");
    expect(paradigmDuration("week").hours).toBe(168);
  });
});

describe("paradigm lifecycle", () => {
  it("finds and completes the open experiment", () => {
    const open = experiment();
    const records = [open];
    expect(getOpenParadigm(records)).toEqual(open);

    const completed = completeParadigmExperiment(
      records,
      open.id,
      "  I paused before answering. ",
      "2026-11-20T12:00:00.000Z",
    );

    expect(completed?.[0]?.completedAt).toBe("2026-11-20T12:00:00.000Z");
    expect(completed?.[0]?.reflection).toBe("I paused before answering.");
    expect(getOpenParadigm(completed!)).toBeNull();
    expect(
      completeParadigmExperiment(
        completed!,
        open.id,
        "Again.",
        "2026-11-20T13:00:00.000Z",
      ),
    ).toBeNull();
  });

  it("refuses an empty, overlong, or untimestamped reflection", () => {
    const records = [experiment()];
    const id = records[0]!.id;

    expect(completeParadigmExperiment(records, id, "  ", START)).toBeNull();
    expect(
      completeParadigmExperiment(
        records,
        id,
        "x".repeat(PARADIGM_REFLECTION_MAX + 1),
        START,
      ),
    ).toBeNull();
    expect(
      completeParadigmExperiment(records, id, "A reflection.", "not-a-date"),
    ).toBeNull();
  });

  it("marks readiness at the end timestamp", () => {
    expect(isParadigmReady("2026-11-19T13:00:00.000Z", "2026-11-19T12:59:59.000Z")).toBe(
      false,
    );
    expect(isParadigmReady("2026-11-19T13:00:00.000Z", "2026-11-19T13:00:00.000Z")).toBe(
      true,
    );
    expect(isParadigmReady("not-a-date", START)).toBe(false);
  });

  it("adds and deletes records", () => {
    const first = experiment();
    const second = completedExperiment(2);

    expect(addParadigmExperiment([first], second).map((item) => item.id)).toEqual([
      second.id,
      first.id,
    ]);
    expect(deleteParadigmExperiment([first, second], first.id)).toEqual([second]);
  });
});

describe("paradigm storage shape", () => {
  it("round-trips a record file", () => {
    const records = [completedExperiment(1), completedExperiment(2), experiment()];

    expect(parseParadigms(serializeParadigms(records))).toEqual(records);
  });

  it("ignores corrupt files and wrong versions", () => {
    expect(parseParadigms(null)).toEqual([]);
    expect(parseParadigms("{")).toEqual([]);
    expect(parseParadigms(JSON.stringify({ version: 2, entries: [] }))).toEqual([]);
    expect(parseParadigms(JSON.stringify({ version: PARADIGM_FILE_VERSION }))).toEqual(
      [],
    );
  });

  it("drops invalid and duplicate entries", () => {
    const valid = completedExperiment(1);
    const raw = JSON.stringify({
      version: PARADIGM_FILE_VERSION,
      entries: [
        valid,
        valid,
        { ...valid, id: "bad-belief", belief: "" },
        { ...valid, id: "bad-duration", duration: "month" },
        { ...valid, id: "bad-end", endsAt: valid.startedAt },
        { ...valid, id: "empty-reflection", reflection: "" },
      ],
    });

    expect(parseParadigms(raw)).toEqual([valid]);
  });

  it("keeps only the first open experiment", () => {
    const open = experiment({ id: "first-open" });
    const secondOpen = experiment({ id: "second-open" });
    const raw = JSON.stringify({
      version: PARADIGM_FILE_VERSION,
      entries: [open, secondOpen],
    });

    expect(parseParadigms(raw).map((item) => item.id)).toEqual(["first-open"]);
  });

  it("caps a hand-edited file at the record limit", () => {
    const entries = Array.from({ length: PARADIGM_MAX_RECORDS + 4 }, (_, index) =>
      completedExperiment(index),
    );
    const raw = JSON.stringify({ version: PARADIGM_FILE_VERSION, entries });

    expect(parseParadigms(raw)).toHaveLength(PARADIGM_MAX_RECORDS);
  });
});
