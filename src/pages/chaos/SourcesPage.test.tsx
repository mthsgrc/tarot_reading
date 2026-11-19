import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SourcesPage } from "./SourcesPage";

function renderSourcesPage() {
  return render(
    <MemoryRouter initialEntries={["/chaos/sources"]}>
      <SourcesPage />
    </MemoryRouter>,
  );
}

describe("SourcesPage", () => {
  it("frames the toolkit as context rather than lineage", () => {
    renderSourcesPage();

    expect(
      screen.getByRole("heading", { level: 1, name: /sources & context/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /context, not lineage/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /a modern current, not a single lineage/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the app's copy is an original summary/i),
    ).toBeInTheDocument();
  });

  it("links every practice tool with its claim and limit", () => {
    renderSourcesPage();

    const tools = [
      ["Sigil Forge", "/chaos/sigil"],
      ["Gnosis Timer", "/chaos/gnosis"],
      ["Cut-up Oracle", "/chaos/cut-up"],
      ["Servitor Workshop", "/chaos/servitors"],
      ["Paradigm Shift", "/chaos/paradigms"],
      ["Magical Record", "/chaos/record"],
      ["Working Composer", "/chaos/working"],
    ] as const;

    for (const [name, href] of tools) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }

    expect(screen.getAllByText("It does")).toHaveLength(tools.length);
    expect(screen.getAllByText("It does not")).toHaveLength(tools.length);
    expect(
      screen.getByText(/does not teach a ritual, banishing, or initiation/i),
    ).toBeInTheDocument();
  });

  it("keeps ritual and banishing as context, not guided practice", () => {
    renderSourcesPage();

    expect(
      screen.getByRole("heading", { name: /safety and scope/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /ritual and banishing are context only/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/does not provide a guided banishing or initiation/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/does not guide breath-holding, hyperventilation/i),
    ).toBeInTheDocument();
  });

  it("opens external sources safely in a new tab", () => {
    renderSourcesPage();

    const chaosLink = screen.getByRole("link", { name: /^chaos magic/i });
    expect(chaosLink).toHaveAttribute(
      "href",
      "https://en.wikipedia.org/wiki/Chaos_magic",
    );
    expect(chaosLink).toHaveAttribute("target", "_blank");
    expect(chaosLink).toHaveAttribute("rel", "noreferrer");
    expect(chaosLink).toHaveAccessibleName(/opens in a new tab/i);

    expect(
      screen.getByRole("link", { name: /^hermetic library: chaos/i }),
    ).toHaveAttribute("href", "https://hermetic.com/chaos");
  });

  it("lists further reading and the independence note", () => {
    renderSourcesPage();

    expect(
      screen.getByRole("heading", { level: 2, name: /^books$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "The Book of Pleasure (Self-Love): The Psychology of Ecstasy",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/not affiliated with the ordo templi orientis/i),
    ).toBeInTheDocument();
  });

  it("links back to the toolkit", () => {
    renderSourcesPage();

    expect(screen.getByRole("link", { name: /toolkit/i })).toHaveAttribute(
      "href",
      "/chaos",
    );
  });
});
