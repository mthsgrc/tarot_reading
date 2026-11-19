import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { localDateString } from "../../domain/chaos/date";
import { addStoredRecord, loadRecordEntries } from "../../lib/recordStorage";
import { WorkingPage } from "./WorkingPage";

function renderWorkingPage() {
  return render(
    <MemoryRouter initialEntries={["/chaos/working"]}>
      <WorkingPage />
    </MemoryRouter>,
  );
}

async function fillWorking(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByRole("textbox", { name: /^title$/i }),
    "A working for the next step",
  );
  await user.type(
    screen.getByRole("textbox", { name: /^intention$/i }),
    "I want to notice the next useful step.",
  );
  await user.type(
    screen.getByRole("textbox", { name: /^action$/i }),
    "Sit still for five minutes and return to the phrase.",
  );
  await user.type(
    screen.getByRole("textbox", { name: /^closing$/i }),
    "Stand up, drink water, and write one sentence.",
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("WorkingPage", () => {
  it("starts with an empty preview and today's date", () => {
    renderWorkingPage();

    expect(
      screen.getByRole("heading", { level: 1, name: /compose a working/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /the sequence/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /nothing composed yet/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^date$/i)).toHaveValue(localDateString());
    expect(screen.getByRole("button", { name: /save to magical record/i })).toBeEnabled();
  });

  it("previews the working as it is written", async () => {
    const user = userEvent.setup();
    renderWorkingPage();
    await fillWorking(user);

    expect(
      screen.getByRole("heading", { level: 3, name: "A working for the next step" }),
    ).toBeInTheDocument();
    const preview = screen
      .getByRole("heading", { level: 2, name: /^the working$/i })
      .closest("section");
    expect(preview).not.toBeNull();
    expect(
      within(preview!).getByText("I want to notice the next useful step."),
    ).toBeInTheDocument();
    expect(
      within(preview!).getByText("Sit still for five minutes and return to the phrase."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/nothing composed yet/i)).toBeNull();
  });

  it("validates the required sequence and focuses the first problem", async () => {
    const user = userEvent.setup();
    renderWorkingPage();

    await user.click(screen.getByRole("button", { name: /save to magical record/i }));

    expect(screen.getByText(/give the working a title/i)).toBeInTheDocument();
    expect(screen.getByText(/write the intention/i)).toBeInTheDocument();
    expect(screen.getByText(/write what you will do/i)).toBeInTheDocument();
    expect(screen.getByText(/write how you will close/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^title$/i })).toHaveFocus();
    expect(loadRecordEntries()).toEqual([]);
  });

  it("saves the working to the Magical Record", async () => {
    const user = userEvent.setup();
    renderWorkingPage();
    await fillWorking(user);
    await user.type(
      screen.getByRole("textbox", { name: /^reflection/i }),
      "I noticed the phrase kept changing.",
    );

    await user.click(screen.getByRole("button", { name: /save to magical record/i }));

    expect(
      screen.getByRole("heading", { level: 3, name: /in the magical record/i }),
    ).toHaveFocus();
    expect(screen.getByRole("button", { name: /saved to record/i })).toBeDisabled();
    expect(screen.getByRole("link", { name: /open the record/i })).toHaveAttribute(
      "href",
      "/chaos/record",
    );

    const entries = loadRecordEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.kind).toBe("working");
    expect(entries[0]?.title).toBe("A working for the next step");
    expect(entries[0]?.practice).toContain("Intention:");
    expect(entries[0]?.practice).toContain("Action:");
    expect(entries[0]?.practice).toContain("Closing:");
    expect(entries[0]?.result).toBe("I noticed the phrase kept changing.");
  });

  it("clears the saved state when the working changes", async () => {
    const user = userEvent.setup();
    renderWorkingPage();
    await fillWorking(user);
    await user.click(screen.getByRole("button", { name: /save to magical record/i }));
    expect(
      screen.getByRole("heading", { level: 3, name: /in the magical record/i }),
    ).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: /^title$/i }), " again");

    expect(
      screen.queryByRole("heading", { level: 3, name: /in the magical record/i }),
    ).toBeNull();
    expect(screen.getByRole("button", { name: /save to magical record/i })).toBeEnabled();
    expect(loadRecordEntries()).toHaveLength(1);
  });

  it("keeps the draft when browser storage rejects the save", async () => {
    const user = userEvent.setup();
    renderWorkingPage();
    await fillWorking(user);

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    await user.click(screen.getByRole("button", { name: /save to magical record/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/could not be saved/i);
    expect(screen.getByRole("textbox", { name: /^title$/i })).toHaveValue(
      "A working for the next step",
    );
    expect(loadRecordEntries()).toEqual([]);
  });

  it("clears the composer and focuses the title", async () => {
    const user = userEvent.setup();
    renderWorkingPage();
    await fillWorking(user);

    await user.click(screen.getByRole("button", { name: /^clear$/i }));

    expect(screen.getByRole("textbox", { name: /^title$/i })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: /^title$/i })).toHaveFocus();
    expect(screen.getByLabelText(/^date$/i)).toHaveValue(localDateString());
    expect(
      screen.getByRole("heading", { level: 3, name: /nothing composed yet/i }),
    ).toBeInTheDocument();
  });

  it("reports when the record is full", async () => {
    const user = userEvent.setup();
    const base = {
      title: "Existing entry",
      kind: "note" as const,
      date: localDateString(),
      practice: "Existing practice.",
      result: "",
    };
    for (let index = 0; index < 100; index += 1) {
      addStoredRecord(
        { ...base, title: `Entry ${index}` },
        new Date(Date.UTC(2026, 10, 19, 12, 0, 0) + index * 1000).toISOString(),
      );
    }
    renderWorkingPage();
    await fillWorking(user);

    await user.click(screen.getByRole("button", { name: /save to magical record/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/record is full/i);
    expect(
      screen.queryByRole("heading", { level: 3, name: /in the magical record/i }),
    ).toBeNull();
  });

  it("links back to the toolkit", () => {
    renderWorkingPage();

    expect(screen.getByRole("link", { name: /toolkit/i })).toHaveAttribute(
      "href",
      "/chaos",
    );
  });
});
