import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ALL_CARDS } from "../data/cards";
import { SPREADS } from "../data/spreads";
import { drawCards, seededRandom } from "../domain/deck";
import { buildShareParams } from "../domain/reading/share";
import { saveJournalEntry } from "../lib/journalStorage";
import { expectNoAccessibilityViolations } from "../test/axe";
import { App } from "./App";
import { RouteErrorBoundary } from "./RouteStates";

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

  return `/thelema?${params.toString()}`;
}

function openRoute(hash: string) {
  window.location.hash = hash;
  return render(<App />);
}

afterEach(() => {
  window.location.hash = "";
  delete document.documentElement.dataset.system;
  delete document.documentElement.dataset.accent;
  vi.restoreAllMocks();
});

describe("accessibility audit", () => {
  it("keeps the current chooser free of violations", async () => {
    openRoute("#/");
    await screen.findByRole("heading", { name: /choose a system/i });

    await expectNoAccessibilityViolations();
  });

  it("keeps the Chaos shell free of violations", async () => {
    openRoute("#/chaos");
    await screen.findByRole("heading", { name: /belief is a tool/i });

    await expectNoAccessibilityViolations();
  });

  it("keeps the Sigil Forge free of violations before and after forging", async () => {
    const user = userEvent.setup();
    openRoute("#/chaos/sigil");
    await screen.findByRole("heading", { level: 1, name: /forge a sigil/i });

    await expectNoAccessibilityViolations();

    await user.type(
      screen.getByRole("textbox", { name: /what are you encoding/i }),
      "I will finish the work",
    );
    await user.click(screen.getByRole("button", { name: /forge sigil/i }));
    await screen.findByRole("heading", { name: /your sigil/i });

    await expectNoAccessibilityViolations();
  });

  it("keeps the Gnosis Timer free of violations before and during a span", async () => {
    const user = userEvent.setup();
    openRoute("#/chaos/gnosis");
    await screen.findByRole("heading", { level: 1, name: /hold a single point/i });

    await expectNoAccessibilityViolations();

    await user.click(screen.getByRole("button", { name: /^start$/i }));
    expect(screen.getByText("In progress")).toBeInTheDocument();

    await expectNoAccessibilityViolations();
  });

  it("keeps the setup and a completed reading free of violations", async () => {
    const user = userEvent.setup();
    openRoute("#/thelema");

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
    const library = openRoute("#/thelema/library");
    await screen.findByRole("heading", { name: /seventy-eight doors/i });

    // Narrow the grid so the audit focuses on page structure, not 78 repetitions.
    await user.type(screen.getByRole("searchbox", { name: /search/i }), "fool");
    expect(await screen.findByText("1 card")).toBeInTheDocument();

    await expectNoAccessibilityViolations();
    library.unmount();

    openRoute("#/thelema/cards/major-00-fool");
    await screen.findByRole("heading", { level: 1, name: /the fool/i });
    await expectNoAccessibilityViolations();
  }, 20_000);

  it("keeps the tradition page free of violations", async () => {
    openRoute("#/thelema/tradition");
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

    openRoute("#/thelema/journal");
    await screen.findByText("1 saved reading");

    await expectNoAccessibilityViolations();
  });

  it("keeps the study quiz free of violations before and after answering", async () => {
    const user = userEvent.setup();
    openRoute("#/thelema/study");
    await screen.findByRole("heading", {
      level: 1,
      name: /train the correspondences/i,
    });

    await expectNoAccessibilityViolations();

    const choices = screen.getByRole("list", { name: /answer choices/i });
    await user.click(within(choices).getAllByRole("button")[0]!);
    expect(screen.getByText(/1 answered/i)).toBeInTheDocument();

    await expectNoAccessibilityViolations();
  });

  it("keeps the not-found page free of violations", async () => {
    openRoute("#/nowhere");
    await screen.findByRole("heading", { name: /no path opens here/i });

    await expectNoAccessibilityViolations();
  });

  it("keeps the route error state free of violations", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    function BrokenRoute(): never {
      throw new Error("Chunk failed to load");
    }

    render(
      <MemoryRouter>
        <RouteErrorBoundary reload={() => {}}>
          <BrokenRoute />
        </RouteErrorBoundary>
      </MemoryRouter>,
    );
    await screen.findByRole("heading", { name: /this page did not load/i });

    await expectNoAccessibilityViolations();
  });
});
