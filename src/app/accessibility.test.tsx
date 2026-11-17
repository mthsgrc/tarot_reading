import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { ALL_CARDS } from "../data/cards";
import { SPREADS } from "../data/spreads";
import { drawCards, seededRandom } from "../domain/deck";
import { buildShareParams } from "../domain/reading/share";
import { saveJournalEntry } from "../lib/journalStorage";
import { expectNoAccessibilityViolations } from "../test/axe";
import { App } from "./App";

function triadShare() {
  const spread = SPREADS.find((item) => item.id === "thelema-triad");
  if (!spread) {
    throw new Error("Missing thelema-triad spread");
  }

  const params = buildShareParams({
    spread,
    drawn: drawCards(spread, { shadow: true }, ALL_CARDS, seededRandom(7)),
    question: "What should I notice?",
    shadow: true,
  });

  return `/?${params.toString()}`;
}

function openRoute(hash: string) {
  window.location.hash = hash;
  return render(<App />);
}

afterEach(() => {
  window.location.hash = "";
});

describe("accessibility audit", () => {
  it("keeps the setup and a completed reading free of violations", async () => {
    const user = userEvent.setup();
    openRoute("#/");

    await expectNoAccessibilityViolations();

    await user.click(screen.getByRole("button", { name: /draw the cards/i }));
    await user.click(screen.getByRole("button", { name: /reveal all/i }));
    expect(screen.getByText("3 of 3 cards revealed.")).toBeInTheDocument();

    await expectNoAccessibilityViolations();
  }, 20_000);

  it("keeps the card detail dialog free of violations", async () => {
    const user = userEvent.setup();
    openRoute(`#${triadShare()}`);

    await screen.findByText("Shared reading");
    await user.click(screen.getAllByRole("button", { name: /open details for/i })[0]!);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await expectNoAccessibilityViolations();
  });

  it("keeps the library and a card entry free of violations", async () => {
    const user = userEvent.setup();
    const library = openRoute("#/library");
    await screen.findByRole("heading", { name: /seventy-eight doors/i });

    // Narrow the grid so the audit focuses on page structure, not 78 repetitions.
    await user.type(screen.getByRole("searchbox", { name: /search/i }), "fool");
    expect(await screen.findByText("1 card")).toBeInTheDocument();

    await expectNoAccessibilityViolations();
    library.unmount();

    openRoute("#/cards/major-00-fool");
    await screen.findByRole("heading", { level: 1, name: /the fool/i });
    await expectNoAccessibilityViolations();
  }, 20_000);

  it("keeps the tradition page free of violations", async () => {
    openRoute("#/tradition");
    await screen.findByRole("heading", { level: 1 });

    await expectNoAccessibilityViolations();
  });

  it("keeps the populated journal free of violations", async () => {
    const spread = SPREADS.find((item) => item.id === "thelema-triad");
    if (!spread) {
      throw new Error("Missing thelema-triad spread");
    }

    saveJournalEntry(
      buildShareParams({
        spread,
        drawn: drawCards(spread, { shadow: true }, ALL_CARDS, seededRandom(7)),
        question: "What should I notice?",
        shadow: true,
      }),
    );

    openRoute("#/journal");
    await screen.findByText("1 saved reading");

    await expectNoAccessibilityViolations();
  });

  it("keeps the not-found page free of violations", async () => {
    openRoute("#/nowhere");
    await screen.findByRole("heading", { name: /no card is laid here/i });

    await expectNoAccessibilityViolations();
  });
});
