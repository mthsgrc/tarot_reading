import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ALL_CARDS } from "../data/cards";
import { SPREADS } from "../data/spreads";
import { drawCards, seededRandom } from "../domain/deck";
import { buildShareParams, readSharedReading } from "../domain/reading/share";
import {
  JOURNAL_STORAGE_KEY,
  loadJournal,
  saveJournalEntry,
} from "../lib/journalStorage";
import { JournalPage } from "./JournalPage";

function triadSpread() {
  const spread = SPREADS.find((item) => item.id === "thelema-triad");
  if (!spread) {
    throw new Error("Missing thelema-triad spread");
  }
  return spread;
}

const SPREAD = triadSpread();

const DRAWN = drawCards(SPREAD, { shadow: true }, ALL_CARDS, seededRandom(7));

function paramsFor(question = "What should I notice?") {
  return buildShareParams({
    spread: SPREAD,
    drawn: DRAWN,
    question,
    shadow: true,
  });
}

function renderJournalPage() {
  return render(
    <MemoryRouter initialEntries={["/journal"]}>
      <JournalPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("JournalPage", () => {
  it("invites a first reading when the journal is empty", () => {
    renderJournalPage();

    expect(
      screen.getByRole("heading", { level: 1, name: /readings you kept/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/nothing kept yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /draw a reading/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("lists a saved reading with its cards, question, and open link", () => {
    const params = paramsFor();
    const reading = readSharedReading(params);
    expect(reading).not.toBeNull();
    saveJournalEntry(params);

    renderJournalPage();

    expect(screen.getByText("1 saved reading")).toBeInTheDocument();
    expect(screen.getAllByText(reading!.spread.name).length).toBeGreaterThan(0);
    expect(screen.getByText("What should I notice?")).toBeInTheDocument();
    expect(screen.getByText(reading!.drawn[0]!.card.name)).toBeInTheDocument();
    expect(screen.getByText(/automatic lens.*standard depth/i)).toBeInTheDocument();

    const open = screen.getByRole("link", { name: /open reading/i });
    expect(open.getAttribute("href")).toContain("v=1");
    expect(open.getAttribute("href")).toContain("j=1");
  });

  it("refreshes when another tab changes the journal", async () => {
    saveJournalEntry(paramsFor("First"));
    renderJournalPage();

    expect(screen.getByText("1 saved reading")).toBeInTheDocument();

    saveJournalEntry(paramsFor("Second"));
    fireEvent(window, new StorageEvent("storage", { key: JOURNAL_STORAGE_KEY }));

    expect(await screen.findByText("2 saved readings")).toBeInTheDocument();
  });

  it("deletes one saved reading", async () => {
    const user = userEvent.setup();
    saveJournalEntry(paramsFor());
    renderJournalPage();

    await user.click(
      screen.getByRole("button", { name: /delete the thelema triad reading/i }),
    );

    expect(screen.getByText(/nothing kept yet/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /nothing kept yet/i })).toHaveFocus();
    expect(loadJournal()).toEqual([]);
  });

  it("moves focus to the next reading after a keyboard delete", async () => {
    const user = userEvent.setup();
    saveJournalEntry(paramsFor("First"));
    saveJournalEntry(paramsFor("Second"));
    saveJournalEntry(paramsFor("Third"));
    renderJournalPage();

    // Entries are newest first: Third, Second, First.
    const second = screen.getByText("Second").closest("li");
    const deleteSecond = within(second!).getByRole("button", { name: /delete/i });
    deleteSecond.focus();
    await user.keyboard("{Enter}");

    const links = screen.getAllByRole("link", { name: /open reading/i });
    expect(links).toHaveLength(2);
    expect(links[1]).toHaveFocus();
    expect(links[1]!.closest("li")).toHaveTextContent("First");
  });

  it("moves focus to the previous reading when the last one is deleted", async () => {
    const user = userEvent.setup();
    saveJournalEntry(paramsFor("First"));
    saveJournalEntry(paramsFor("Second"));
    renderJournalPage();

    const first = screen.getByText("First").closest("li");
    await user.click(within(first!).getByRole("button", { name: /delete/i }));

    const links = screen.getAllByRole("link", { name: /open reading/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveFocus();
    expect(links[0]!.closest("li")).toHaveTextContent("Second");
  });

  it("clears every reading after an explicit confirmation", async () => {
    const user = userEvent.setup();
    saveJournalEntry(paramsFor("First"));
    saveJournalEntry(paramsFor("Second"));
    renderJournalPage();

    expect(screen.getByText("2 saved readings")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear journal/i }));
    expect(
      screen.getByRole("group", { name: /confirm clearing the journal/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /yes, clear all/i }));

    expect(screen.getByText(/nothing kept yet/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /nothing kept yet/i })).toHaveFocus();
    expect(loadJournal()).toEqual([]);
  });

  it("cancels a clear without touching the journal", async () => {
    const user = userEvent.setup();
    saveJournalEntry(paramsFor());
    renderJournalPage();

    await user.click(screen.getByRole("button", { name: /clear journal/i }));
    await user.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(screen.queryByRole("group", { name: /confirm clearing/i })).toBeNull();
    expect(screen.getByText("1 saved reading")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear journal/i })).toHaveFocus();
    expect(loadJournal()).toHaveLength(1);
  });

  it("reports a storage failure without dropping the entry", async () => {
    const user = userEvent.setup();
    saveJournalEntry(paramsFor());
    renderJournalPage();

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    await user.click(
      screen.getByRole("button", { name: /delete the thelema triad reading/i }),
    );

    expect(screen.getByText(/journal could not be updated/i)).toBeInTheDocument();
    expect(screen.getByText("1 saved reading")).toBeInTheDocument();
  });
});
