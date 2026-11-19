import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { serializeParadigms, getOpenParadigm } from "../domain/chaos/paradigm";
import {
  PARADIGM_STORAGE_KEY,
  completeStoredParadigm,
  deleteStoredParadigm,
  loadParadigms,
  startStoredParadigm,
} from "./paradigmStorage";

const STARTED_AT = "2026-11-19T12:00:00.000Z";
const COMPLETED_AT = "2026-11-20T12:00:00.000Z";

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("paradigm storage", () => {
  it("starts and loads a local experiment", () => {
    const result = startStoredParadigm("  There is no rush. ", "hour", STARTED_AT);

    expect(result.status).toBe("saved");
    if (result.status !== "saved") {
      return;
    }

    const saved = result.experiments[0]!;
    expect(saved.belief).toBe("There is no rush.");
    expect(saved.endsAt).toBe("2026-11-19T13:00:00.000Z");
    expect(getOpenParadigm(loadParadigms())?.id).toBe(saved.id);
  });

  it("refuses a second open experiment", () => {
    expect(startStoredParadigm("First", "day", STARTED_AT).status).toBe("saved");
    expect(startStoredParadigm("Second", "day", STARTED_AT)).toEqual({ status: "open" });
    expect(loadParadigms()).toHaveLength(1);
  });

  it("refuses an invalid belief", () => {
    expect(startStoredParadigm(" ", "day", STARTED_AT)).toEqual({ status: "invalid" });
    expect(loadParadigms()).toEqual([]);
  });

  it("completes an open experiment and allows a new one", () => {
    const started = startStoredParadigm("First", "day", STARTED_AT);
    if (started.status !== "saved") {
      throw new Error("Could not start experiment");
    }

    const completed = completeStoredParadigm(
      started.experiments[0]!.id,
      "  I noticed I was rushing. ",
      COMPLETED_AT,
    );

    expect(completed?.[0]?.completedAt).toBe(COMPLETED_AT);
    expect(completed?.[0]?.reflection).toBe("I noticed I was rushing.");
    expect(loadParadigms()[0]?.completedAt).toBe(COMPLETED_AT);
    expect(startStoredParadigm("Second", "hour", COMPLETED_AT).status).toBe("saved");
  });

  it("refuses an empty reflection and leaves the experiment open", () => {
    const started = startStoredParadigm("First", "day", STARTED_AT);
    if (started.status !== "saved") {
      throw new Error("Could not start experiment");
    }
    const id = started.experiments[0]!.id;

    expect(completeStoredParadigm(id, " ", COMPLETED_AT)).toBeNull();
    expect(getOpenParadigm(loadParadigms())).not.toBeNull();
    expect(deleteStoredParadigm(id)?.length).toBe(0);
    expect(loadParadigms()).toEqual([]);
  });

  it("reports storage failures without losing the open experiment", () => {
    const started = startStoredParadigm("First", "day", STARTED_AT);
    if (started.status !== "saved") {
      throw new Error("Could not start experiment");
    }

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    expect(
      completeStoredParadigm(started.experiments[0]!.id, "A reflection.", COMPLETED_AT),
    ).toBeNull();
    expect(startStoredParadigm("Second", "day", STARTED_AT)).toEqual({
      status: "open",
    });
    expect(loadParadigms()).toHaveLength(1);
    expect(getOpenParadigm(loadParadigms())).not.toBeNull();
  });

  it("reports a storage failure when there is no open experiment", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    expect(startStoredParadigm("First", "day", STARTED_AT)).toEqual({
      status: "error",
    });
    expect(loadParadigms()).toEqual([]);
  });

  it("loads an empty list when storage is corrupt", () => {
    window.localStorage.setItem(PARADIGM_STORAGE_KEY, "{not json");
    expect(loadParadigms()).toEqual([]);
  });

  it("writes a parsable file", () => {
    startStoredParadigm("First", "day", STARTED_AT);
    const raw = window.localStorage.getItem(PARADIGM_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(serializeParadigms(loadParadigms())).toBe(raw);
  });
});
