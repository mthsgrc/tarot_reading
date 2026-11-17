import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadJournal } from "../lib/journalStorage";
import { ReadingPage } from "./ReadingPage";

function LocationProbe() {
  const location = useLocation();
  return <span data-testid="location">{location.search}</span>;
}

function ShareLinkButton({ to }: { to: string }) {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}>
      open shared link
    </button>
  );
}

function renderReadingPage(initialEntry = "/reading") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ReadingPage />
      <LocationProbe />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ReadingPage", () => {
  it("draws, reveals, opens, and resets a reading", async () => {
    const user = userEvent.setup();
    renderReadingPage();

    expect(
      screen.getByRole("heading", { level: 1, name: /the cards are a mirror/i }),
    ).toBeInTheDocument();

    await user.type(
      screen.getByRole("textbox", { name: /question/i }),
      "What should I notice?",
    );
    await user.click(screen.getByRole("button", { name: /draw the cards/i }));

    expect(screen.getByText("0 of 3 cards revealed.")).toBeInTheDocument();
    expect(screen.getByText(/what should I notice\?/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /reveal the card in the .* position/i }),
    ).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: /reveal all/i }));

    expect(screen.getByText("3 of 3 cards revealed.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The pattern" })).toBeInTheDocument();

    const revealedCards = screen.getAllByRole("button", {
      name: /open details for/i,
    });
    expect(revealedCards).toHaveLength(3);

    await user.click(revealedCards[0]!);

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/in the .* position/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: /close card details/i }));

    expect(dialog).not.toHaveAttribute("open");
    expect(
      screen.queryByRole("button", { name: /close card details/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /new reading/i }));

    expect(
      screen.getByRole("heading", { name: /set the question/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /draw the cards/i })).toBeInTheDocument();
  });

  it("shows the generated interpretation and copies the full reading", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderReadingPage();

    await user.click(screen.getByRole("button", { name: /draw the cards/i }));

    expect(
      screen.queryByRole("heading", { name: "The reading" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reveal all/i }));

    expect(screen.getByRole("heading", { name: "The reading" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /what stands out/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /the cards in their positions/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /how the spread moves/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /one action/i }),
    ).toBeInTheDocument();

    const buildSummary = screen.getByText(/how this reading was built/i);
    expect(buildSummary.tagName).toBe("SUMMARY");
    await user.click(buildSummary);
    expect(buildSummary.closest("details")).toHaveAttribute("open");
    expect(screen.getByText("Shared Sephira")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /copy reading/i }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("How the spread moves"),
    );
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("A reading for reflection, not prediction."),
    );
    expect(screen.getByText(/reading copied to the clipboard/i)).toBeInTheDocument();
  });

  it("opens a shared reading from the URL without drawing", () => {
    const params = new URLSearchParams({
      v: "1",
      spread: "thelema-triad",
      cards: "major-00-fool.u,cups-two.s,major-17-star.u",
      q: "What should I notice?",
    });

    renderReadingPage(`/?${params.toString()}`);

    expect(screen.getByText("Shared reading")).toBeInTheDocument();
    expect(screen.getByText("3 of 3 cards revealed.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The pattern" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "The reading" })).toBeInTheDocument();
    expect(screen.getByText(/what should i notice\?/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reveal all/i })).toBeDisabled();
    expect(screen.getAllByText("Two of Cups").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Shadow").length).toBeGreaterThan(0);
  });

  it("opens a share link that arrives without a reload", async () => {
    const user = userEvent.setup();
    const params = new URLSearchParams({
      v: "1",
      spread: "thelema-triad",
      cards: "major-00-fool.u,cups-two.u,major-17-star.u",
      q: "What should I notice?",
    });

    render(
      <MemoryRouter initialEntries={["/reading"]}>
        <ReadingPage />
        <ShareLinkButton to={`/?${params.toString()}`} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: /set the question/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open shared link/i }));

    expect(screen.getByText("Shared reading")).toBeInTheDocument();
    expect(screen.getByText("3 of 3 cards revealed.")).toBeInTheDocument();
  });

  it("returns to setup when a shared reading link is left", async () => {
    const user = userEvent.setup();
    const params = new URLSearchParams({
      v: "1",
      spread: "thelema-triad",
      cards: "major-00-fool.u,cups-two.u,major-17-star.u",
      q: "What should I notice?",
    });

    render(
      <MemoryRouter initialEntries={[`/?${params.toString()}`]}>
        <ReadingPage />
        <Link to="/">Home</Link>
        <LocationProbe />
      </MemoryRouter>,
    );

    expect(screen.getByText("Shared reading")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /home/i }));

    expect(
      await screen.findByRole("heading", { name: /set the question/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Shared reading")).not.toBeInTheDocument();
    expect(screen.getByTestId("location").textContent).toBe("");
  });

  it("copies a shareable link for the current draw", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderReadingPage();

    await user.selectOptions(screen.getByRole("combobox", { name: /lens/i }), "work");
    await user.selectOptions(screen.getByRole("combobox", { name: /depth/i }), "deep");
    await user.type(screen.getByRole("textbox", { name: /question/i }), "What now?");
    await user.click(screen.getByRole("button", { name: /draw the cards/i }));
    await user.click(screen.getByRole("button", { name: /reveal all/i }));
    await user.click(screen.getByRole("button", { name: /copy link/i }));

    expect(writeText).toHaveBeenCalledTimes(1);

    const copied = writeText.mock.calls[0]?.[0] as string;
    expect(copied).toContain("#/?");

    const shared = new URLSearchParams(copied.slice(copied.indexOf("?") + 1));
    expect(shared.get("v")).toBe("1");
    expect(shared.get("spread")).toBe("thelema-triad");
    expect(shared.get("q")).toBe("What now?");
    expect(shared.get("lens")).toBe("work");
    expect(shared.get("depth")).toBe("deep");
    expect(shared.get("cards")).toMatch(/^[a-z0-9-]+\.(u|s)(,[a-z0-9-]+\.(u|s)){2}$/);

    expect(
      screen.getByText(/link copied to the clipboard.*includes your question/i),
    ).toBeInTheDocument();
  });

  it("prints a fully revealed reading", async () => {
    const user = userEvent.setup();
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    const params = new URLSearchParams({
      v: "1",
      spread: "thelema-triad",
      cards: "major-00-fool.u,cups-two.s,major-17-star.u",
      q: "What should I notice?",
    });

    renderReadingPage(`/?${params.toString()}`);
    await user.click(screen.getByRole("button", { name: /print reading/i }));

    expect(print).toHaveBeenCalledTimes(1);
  });

  it("saves a reading to the local journal with its lens and depth", async () => {
    const user = userEvent.setup();
    const params = new URLSearchParams({
      v: "1",
      spread: "thelema-triad",
      cards: "major-00-fool.u,cups-two.s,major-17-star.u",
      q: "What should I notice?",
      lens: "love",
      depth: "brief",
    });

    renderReadingPage(`/?${params.toString()}`);
    await user.click(screen.getByRole("button", { name: /save to journal/i }));

    expect(screen.getByText("Reading saved to your journal.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^saved$/i })).toBeDisabled();

    const entries = loadJournal();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.params).toContain("spread=thelema-triad");
    expect(entries[0]?.params).toContain("q=What");
    expect(entries[0]?.params).toContain("lens=love");
    expect(entries[0]?.params).toContain("depth=brief");
  });

  it("keeps a brief reading to its strongest material", () => {
    const params = new URLSearchParams({
      v: "1",
      spread: "thelema-triad",
      cards: "major-00-fool.u,cups-two.s,major-17-star.u",
      q: "What should I notice?",
      lens: "work",
      depth: "brief",
    });

    renderReadingPage(`/?${params.toString()}`);

    expect(screen.getByText(/brief depth/i)).toBeInTheDocument();
    expect(screen.getAllByText(/will and work/i).length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("heading", { name: "The cards in their positions" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "How the spread moves" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What stands out" })).toBeInTheDocument();
  });

  it("marks a reading opened from the journal", () => {
    const params = new URLSearchParams({
      v: "1",
      spread: "thelema-triad",
      cards: "major-00-fool.u,cups-two.s,major-17-star.u",
      q: "What should I notice?",
    });

    renderReadingPage(`/?${params.toString()}&j=1`);

    expect(screen.getByText("Saved reading")).toBeInTheDocument();
  });

  it("reports when the journal cannot be written", async () => {
    const user = userEvent.setup();
    const params = new URLSearchParams({
      v: "1",
      spread: "thelema-triad",
      cards: "major-00-fool.u,cups-two.s,major-17-star.u",
      q: "What should I notice?",
    });

    renderReadingPage(`/?${params.toString()}`);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    await user.click(screen.getByRole("button", { name: /save to journal/i }));

    expect(screen.getByText(/journal is unavailable/i)).toBeInTheDocument();
  });

  it("clears the share parameters when a new reading starts", async () => {
    const user = userEvent.setup();
    const params = new URLSearchParams({
      v: "1",
      spread: "thelema-triad",
      cards: "major-00-fool.u,cups-two.u,major-17-star.u",
      q: "What should I notice?",
    });

    renderReadingPage(`/?${params.toString()}`);
    expect(screen.getByTestId("location").textContent).not.toBe("");

    await user.click(screen.getByRole("button", { name: /new reading/i }));

    expect(screen.getByTestId("location").textContent).toBe("");
    expect(screen.getByRole("textbox", { name: /question/i })).toHaveValue(
      "What should I notice?",
    );
  });

  it("explains an unreadable shared link", () => {
    renderReadingPage("/?v=1&spread=unknown&cards=major-00-fool.u");

    expect(screen.getByText(/could not be read/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /set the question/i }),
    ).toBeInTheDocument();
  });

  it("draws the selected larger spread", async () => {
    const user = userEvent.setup();
    renderReadingPage();

    await user.click(screen.getByRole("radio", { name: /^Tree of Life/ }));
    await user.click(screen.getByRole("button", { name: /draw the cards/i }));

    expect(screen.getByText("0 of 10 cards revealed.")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /reveal the card in the .* position/i }),
    ).toHaveLength(10);
  });

  it("lets shadow orientation be enabled before the draw", async () => {
    const user = userEvent.setup();
    renderReadingPage();

    const shadowToggle = screen.getByRole("checkbox", {
      name: /include shadow cards/i,
    });

    expect(shadowToggle).not.toBeChecked();
    await user.click(shadowToggle);
    expect(shadowToggle).toBeChecked();
  });
});
