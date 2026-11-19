import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ALL_CARDS } from "../data/cards";
import { SPREADS } from "../data/spreads";
import { drawCards, seededRandom } from "../domain/deck";
import { buildShareParams, buildShareUrl } from "../domain/reading/share";
import { App } from "./App";
import { CHAOS_ACCENTS } from "./chaosAccent";

const ACCENT_IDS = CHAOS_ACCENTS.map((accent) => accent.id);

afterEach(() => {
  window.location.hash = "";
  document.title = "";
  delete document.documentElement.dataset.system;
  delete document.documentElement.dataset.accent;
});

describe("App", () => {
  it("offers both currents from the home route", () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/";
    render(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: /choose a system/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /enter the thelema current/i }),
    ).toHaveAttribute("href", "#/thelema");
    expect(
      screen.getByRole("link", { name: /enter the chaos current/i }),
    ).toHaveAttribute("href", "#/chaos");
    expect(document.title).toBe("Choose a system · Two Currents");
    expect(document.documentElement.dataset.system).toBe("home");
  });

  it("offers the Chaos current and the chooser from the Thelema workspace", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/thelema";
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /the cards are a mirror/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Chaos" })).toHaveAttribute(
      "href",
      "#/chaos",
    );
    expect(screen.getByRole("link", { name: "Systems" })).toHaveAttribute("href", "#/");

    await user.click(screen.getByRole("link", { name: "Chaos" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: /belief is a tool/i }),
    ).toBeInTheDocument();
    expect(window.location.hash).toBe("#/chaos");
  });

  it("renders a generated share link on the reading page", () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});

    const spread = SPREADS.find((item) => item.id === "thelema-triad");
    if (!spread) {
      throw new Error("Missing thelema-triad spread");
    }

    const url = buildShareUrl("https://example.com/tarot_reading/", {
      spread,
      drawn: drawCards(spread, { shadow: true }, ALL_CARDS, seededRandom(7)),
      question: "What should I notice?",
      shadow: true,
    });

    window.location.hash = new URL(url).hash;
    render(<App />);

    expect(screen.getByText("Shared reading")).toBeInTheDocument();
    expect(screen.getByText("3 of 3 cards revealed.")).toBeInTheDocument();
    expect(screen.queryByText(/the path turns back/i)).not.toBeInTheDocument();
  });

  it("forwards an old root share link to the Thelema route", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
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

    window.location.hash = `#/?${params.toString()}`;
    render(<App />);

    expect(await screen.findByText("Shared reading")).toBeInTheDocument();
    expect(window.location.hash.startsWith("#/thelema?")).toBe(true);
  });

  it("loads a secondary route from its own chunk", async () => {
    window.location.hash = "#/thelema/journal";
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /readings you kept/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /draw a reading/i })).toHaveAttribute(
      "href",
      "#/thelema",
    );
  });

  it("redirects an old route to its Thelema home", async () => {
    window.location.hash = "#/library?sort=name";
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: /seventy-eight doors/i }),
    ).toBeInTheDocument();
    expect(window.location.hash).toBe("#/thelema/library?sort=name");
  });

  it("loads study mode with its own title", async () => {
    window.location.hash = "#/thelema/study";
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /train the correspondences/i,
      }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Study · Thoth Tarot");
  });

  it("keeps the skip link inside the app and focuses main content", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/";
    render(<App />);

    await user.click(screen.getByRole("link", { name: /skip to content/i }));

    expect(screen.getByRole("main")).toHaveFocus();
    expect(window.location.hash).toBe("#/");
    expect(
      screen.getByRole("heading", { level: 1, name: /choose a system/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/no path opens here/i)).not.toBeInTheDocument();
  });

  it("updates the title and focuses main content after navigation", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/thelema";
    render(<App />);

    expect(document.title).toBe("Reading · Thoth Tarot");
    expect(screen.getByRole("main")).not.toHaveFocus();

    await user.click(screen.getByRole("link", { name: /card library/i }));

    expect(
      await screen.findByRole("heading", { name: /seventy-eight doors/i }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Card Library · Thoth Tarot");
    expect(screen.getByRole("main")).toHaveFocus();
  });

  it("titles a card page as part of the library", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/thelema/cards/major-00-fool";
    render(<App />);

    expect(
      await screen.findByRole("heading", { level: 1, name: /the fool/i }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Card Library · Thoth Tarot");
  });

  it("redirects an old card link and keeps its search", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/cards/major-00-fool?from=old";
    render(<App />);

    expect(
      await screen.findByRole("heading", { level: 1, name: /the fool/i }),
    ).toBeInTheDocument();
    expect(window.location.hash).toBe("#/thelema/cards/major-00-fool?from=old");
  });

  it("lists the toolkit and opens the Sigil Forge", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/chaos";
    render(<App />);

    expect(await screen.findByText("Eight tools, one experiment.")).toBeInTheDocument();
    const openSigil = screen.getByRole("link", { name: /open sigil forge/i });
    expect(openSigil).toHaveAttribute("href", "#/chaos/sigil");
    expect(screen.getByRole("link", { name: /open gnosis timer/i })).toHaveAttribute(
      "href",
      "#/chaos/gnosis",
    );
    expect(screen.getByRole("link", { name: /open cut-up oracle/i })).toHaveAttribute(
      "href",
      "#/chaos/cut-up",
    );
    expect(screen.getByRole("link", { name: /open servitor workshop/i })).toHaveAttribute(
      "href",
      "#/chaos/servitors",
    );
    expect(screen.getByRole("link", { name: /open paradigm shift/i })).toHaveAttribute(
      "href",
      "#/chaos/paradigms",
    );
    expect(screen.getByRole("link", { name: /open magical record/i })).toHaveAttribute(
      "href",
      "#/chaos/record",
    );
    expect(screen.getByRole("link", { name: /open working composer/i })).toHaveAttribute(
      "href",
      "#/chaos/working",
    );
    expect(screen.getByRole("link", { name: /open sources & context/i })).toHaveAttribute(
      "href",
      "#/chaos/sources",
    );
    expect(screen.queryByText(/in the works/i)).toBeNull();

    await user.click(openSigil);

    expect(
      await screen.findByRole("heading", { level: 1, name: /forge a sigil/i }),
    ).toBeInTheDocument();
    expect(window.location.hash).toBe("#/chaos/sigil");
    expect(document.title).toBe("Sigil Forge · Two Currents");
  });

  it("loads the Gnosis Timer with its own title", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/chaos/gnosis";
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /hold a single point/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("timer")).toHaveTextContent("05:00");
    expect(document.title).toBe("Gnosis Timer · Two Currents");
  });

  it("loads the Cut-up Oracle with its own title", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/chaos/cut-up";
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /break the sentence open/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Lines" })).toBeChecked();
    expect(document.title).toBe("Cut-up Oracle · Two Currents");
  });

  it("loads the Servitor Workshop with its own title", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/chaos/servitors";
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /give an intention a name/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /no servitors yet/i }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Servitor Workshop · Two Currents");
  });

  it("loads the Paradigm Shift with its own title", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/chaos/paradigms";
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /try a belief on for size/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /nothing open/i })).toBeInTheDocument();
    expect(document.title).toBe("Paradigm Shift · Two Currents");
  });

  it("loads the Magical Record with its own title", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/chaos/record";
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /record the working/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /nothing recorded yet/i }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Magical Record · Two Currents");
  });

  it("loads the Working Composer with its own title", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/chaos/working";
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /compose a working/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /nothing composed yet/i }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Working Composer · Two Currents");
  });

  it("loads Sources & Context with its own title", async () => {
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/chaos/sources";
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: /sources & context/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /context, not lineage/i }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Sources & Context · Two Currents");
  });

  it("themes the Chaos route with one accent and rerolls a new signal", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.location.hash = "#/chaos";
    render(<App />);

    expect(
      await screen.findByRole("heading", { level: 1, name: /belief is a tool/i }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Chaos Magic · Two Currents");
    expect(document.documentElement.dataset.system).toBe("chaos");

    const firstAccent = document.documentElement.dataset.accent;
    expect(ACCENT_IDS).toContain(firstAccent);

    await user.click(screen.getByRole("button", { name: /new signal/i }));

    const secondAccent = document.documentElement.dataset.accent;
    expect(ACCENT_IDS).toContain(secondAccent);
    expect(secondAccent).not.toBe(firstAccent);

    await user.click(screen.getByRole("link", { name: /^thelema$/i }));

    expect(
      await screen.findByRole("heading", { level: 1, name: /the cards are a mirror/i }),
    ).toBeInTheDocument();
    expect(document.documentElement.dataset.system).toBe("thelema");
    expect(document.documentElement.dataset.accent).toBe(secondAccent);
  });
});
