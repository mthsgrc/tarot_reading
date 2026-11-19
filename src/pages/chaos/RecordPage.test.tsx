import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { localDateString } from "../../domain/chaos/date";
import {
  RECORD_STORAGE_KEY,
  addStoredRecord,
  loadRecordEntries,
} from "../../lib/recordStorage";
import { RecordPage } from "./RecordPage";

const CREATED_AT = "2026-11-19T12:00:00.000Z";

function renderRecordPage() {
  return render(
    <MemoryRouter initialEntries={["/chaos/record"]}>
      <RecordPage />
    </MemoryRouter>,
  );
}

async function addEntry(
  user: ReturnType<typeof userEvent.setup>,
  {
    title,
    kind = "sigil",
    practice = "Drew the sigil and sat with it.",
    result = "",
  }: {
    title: string;
    kind?: string;
    practice?: string;
    result?: string;
  },
) {
  await user.type(screen.getByRole("textbox", { name: /^title$/i }), title);
  await user.selectOptions(screen.getByLabelText(/^kind$/i), kind);
  await user.type(screen.getByRole("textbox", { name: /what you did/i }), practice);
  if (result) {
    await user.type(screen.getByRole("textbox", { name: /what changed/i }), result);
  }
  await user.click(screen.getByRole("button", { name: /add to record/i }));
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("RecordPage", () => {
  it("starts with today's date and an empty record", () => {
    renderRecordPage();

    expect(
      screen.getByRole("heading", { level: 1, name: /record the working/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /nothing recorded yet/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^date$/i)).toHaveValue(localDateString());
    expect(screen.getByLabelText(/^kind$/i)).toHaveValue("note");
    expect(loadRecordEntries()).toEqual([]);
  });

  it("validates the title and practice, focusing the first problem", async () => {
    const user = userEvent.setup();
    renderRecordPage();

    await user.click(screen.getByRole("button", { name: /add to record/i }));

    expect(screen.getByText(/give the entry a title/i)).toBeInTheDocument();
    expect(screen.getByText("Write what you did.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^title$/i })).toHaveFocus();
    expect(loadRecordEntries()).toEqual([]);
  });

  it("adds an entry and moves focus to its heading", async () => {
    const user = userEvent.setup();
    renderRecordPage();

    await addEntry(user, {
      title: "A sigil for the next step",
      kind: "sigil",
      result: "I noticed I was less rushed afterwards.",
    });

    const title = screen.getByRole("heading", {
      level: 3,
      name: "A sigil for the next step",
    });
    expect(title).toHaveFocus();
    const article = title.closest("article");
    expect(article).not.toBeNull();
    expect(within(article!).getByText("Sigil")).toBeInTheDocument();
    expect(screen.getByText("Drew the sigil and sat with it.")).toBeInTheDocument();
    expect(
      screen.getByText("I noticed I was less rushed afterwards."),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/entry added/i);
    expect(loadRecordEntries()).toHaveLength(1);

    expect(screen.getByRole("textbox", { name: /^title$/i })).toHaveValue("");
    expect(screen.getByLabelText(/^date$/i)).toHaveValue(localDateString());
    expect(screen.getByLabelText(/^kind$/i)).toHaveValue("note");
  });

  it("filters by kind and can show the whole record again", async () => {
    const user = userEvent.setup();
    addStoredRecord(
      {
        title: "A sigil",
        kind: "sigil",
        date: "2026-11-19",
        practice: "Drew it.",
        result: "",
      },
      "2026-11-19T10:00:00.000Z",
    );
    addStoredRecord(
      {
        title: "A note",
        kind: "note",
        date: "2026-11-19",
        practice: "Wrote a note.",
        result: "",
      },
      "2026-11-19T11:00:00.000Z",
    );
    renderRecordPage();

    expect(screen.getByRole("heading", { name: "A sigil" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A note" })).toBeInTheDocument();

    const filter = screen.getByLabelText(/filter by kind/i);
    await user.selectOptions(filter, "sigil");

    expect(screen.getByRole("heading", { name: "A sigil" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "A note" })).toBeNull();
    expect(screen.getByText(/2 entries · 1 shown/i)).toBeInTheDocument();

    await user.selectOptions(filter, "working");
    expect(
      screen.getByRole("heading", { name: /no entries with this kind/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /show all entries/i }));

    expect(screen.getByRole("heading", { name: "A sigil" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A note" })).toBeInTheDocument();
    expect(filter).toHaveValue("all");
  });

  it("deletes an entry only after confirmation and moves focus", async () => {
    const user = userEvent.setup();
    addStoredRecord(
      {
        title: "First",
        kind: "note",
        date: "2026-11-18",
        practice: "First practice.",
        result: "",
      },
      "2026-11-19T10:00:00.000Z",
    );
    addStoredRecord(
      {
        title: "Second",
        kind: "note",
        date: "2026-11-19",
        practice: "Second practice.",
        result: "",
      },
      "2026-11-19T11:00:00.000Z",
    );
    renderRecordPage();

    // Newest working date first.
    const firstTitle = screen.getByRole("heading", { name: "Second" });
    const deleteFirst = screen.getByRole("button", { name: /delete second/i });
    await user.click(deleteFirst);
    expect(
      screen.getByRole("group", { name: /confirm deleting second/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(deleteFirst).toHaveFocus();
    expect(loadRecordEntries()).toHaveLength(2);

    await user.click(deleteFirst);
    await user.click(screen.getByRole("button", { name: /yes, delete/i }));

    expect(screen.getByRole("heading", { name: "First" })).toHaveFocus();
    expect(firstTitle).not.toBeInTheDocument();
    expect(loadRecordEntries()).toHaveLength(1);

    const deleteLast = screen.getByRole("button", { name: /delete first/i });
    await user.click(deleteLast);
    await user.click(screen.getByRole("button", { name: /yes, delete/i }));

    expect(screen.getByRole("heading", { name: /nothing recorded yet/i })).toHaveFocus();
    expect(loadRecordEntries()).toEqual([]);
  });

  it("keeps the draft when browser storage rejects the write", async () => {
    const user = userEvent.setup();
    renderRecordPage();
    await user.type(
      screen.getByRole("textbox", { name: /^title$/i }),
      "A working that will not save",
    );
    await user.type(
      screen.getByRole("textbox", { name: /what you did/i }),
      "I drew a sigil.",
    );

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    await user.click(screen.getByRole("button", { name: /add to record/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/could not be saved/i);
    expect(screen.getByRole("textbox", { name: /^title$/i })).toHaveValue(
      "A working that will not save",
    );
    expect(loadRecordEntries()).toEqual([]);
  });

  it("refreshes when another tab changes the record", async () => {
    renderRecordPage();
    addStoredRecord(
      {
        title: "From another tab",
        kind: "working",
        date: "2026-11-19",
        practice: "A working.",
        result: "",
      },
      CREATED_AT,
    );
    fireEvent(window, new StorageEvent("storage", { key: RECORD_STORAGE_KEY }));

    expect(
      await screen.findByRole("heading", { name: "From another tab" }),
    ).toBeInTheDocument();
  });

  it("links back to the toolkit", () => {
    renderRecordPage();

    expect(screen.getByRole("link", { name: /toolkit/i })).toHaveAttribute(
      "href",
      "/chaos",
    );
  });
});
