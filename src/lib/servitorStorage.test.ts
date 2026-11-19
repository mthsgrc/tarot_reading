import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SERVITOR_MAX_RECORDS,
  createServitor,
  serializeServitors,
  type ServitorDraft,
} from "../domain/chaos/servitor";
import {
  SERVITOR_STORAGE_KEY,
  createStoredServitor,
  deleteStoredServitor,
  loadServitors,
  restoreStoredServitor,
  retireStoredServitor,
} from "./servitorStorage";

const CREATED_AT = "2026-11-19T12:00:00.000Z";

function draft(overrides: Partial<ServitorDraft> = {}): ServitorDraft {
  return {
    name: "The Doorkeeper",
    task: "I notice the next small step and take it.",
    form: "A brass key with no lock.",
    reviewOn: "2026-12-01",
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("servitor storage", () => {
  it("creates a normalized record and loads it back", () => {
    const result = createStoredServitor(
      draft({ name: "  The Doorkeeper  " }),
      CREATED_AT,
    );

    expect(result.status).toBe("saved");
    if (result.status !== "saved") {
      return;
    }

    expect(result.servitors).toHaveLength(1);
    expect(result.servitors[0]?.name).toBe("The Doorkeeper");
    expect(loadServitors()).toEqual(result.servitors);
    expect(window.localStorage.getItem(SERVITOR_STORAGE_KEY)).toContain("The Doorkeeper");
  });

  it("refuses an invalid draft without writing", () => {
    const result = createStoredServitor(draft({ task: "" }), CREATED_AT);

    expect(result).toEqual({ status: "invalid" });
    expect(loadServitors()).toEqual([]);
  });

  it("refuses to create beyond the record cap", () => {
    const records = Array.from({ length: SERVITOR_MAX_RECORDS }, (_, index) =>
      createServitor(draft({ name: `Servitor ${index}` }), `id-${index}`, CREATED_AT)!,
    );
    window.localStorage.setItem(SERVITOR_STORAGE_KEY, serializeServitors(records));

    expect(createStoredServitor(draft({ name: "One more" }), CREATED_AT)).toEqual({
      status: "full",
    });
    expect(loadServitors()).toHaveLength(SERVITOR_MAX_RECORDS);
  });

  it("retires, restores, and deletes stored records", () => {
    const first = createStoredServitor(draft({ name: "First" }), CREATED_AT);
    const second = createStoredServitor(draft({ name: "Second" }), CREATED_AT);
    if (first.status !== "saved" || second.status !== "saved") {
      throw new Error("Could not create fixtures");
    }

    const firstId = second.servitors[1]!.id;
    const retired = retireStoredServitor(firstId, "2026-11-20T12:00:00.000Z");
    expect(retired?.find((item) => item.id === firstId)?.retiredAt).toBe(
      "2026-11-20T12:00:00.000Z",
    );

    const restored = restoreStoredServitor(firstId);
    expect(restored?.find((item) => item.id === firstId)?.retiredAt).toBeNull();

    const deleted = deleteStoredServitor(firstId);
    expect(deleted?.some((item) => item.id === firstId)).toBe(false);
    expect(loadServitors().some((item) => item.id === firstId)).toBe(false);
  });

  it("reports a storage failure without losing existing records", () => {
    const first = createStoredServitor(draft({ name: "First" }), CREATED_AT);
    if (first.status !== "saved") {
      throw new Error("Could not create fixture");
    }

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    expect(createStoredServitor(draft({ name: "Second" }), CREATED_AT)).toEqual({
      status: "error",
    });
    expect(loadServitors()).toHaveLength(1);
    expect(retireStoredServitor(first.servitors[0]!.id)).toBeNull();
  });

  it("loads an empty list when storage is corrupt", () => {
    window.localStorage.setItem(SERVITOR_STORAGE_KEY, "{not json");
    expect(loadServitors()).toEqual([]);
  });
});
