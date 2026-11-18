import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LibraryPage } from "./LibraryPage";

function renderLibraryPage() {
  return render(
    <MemoryRouter>
      <LibraryPage />
    </MemoryRouter>,
  );
}

describe("LibraryPage", () => {
  it("shows the complete deck by default", () => {
    renderLibraryPage();

    expect(screen.getByText("78 cards")).toBeInTheDocument();
    expect(screen.getByText("The Fool").closest("a")).toHaveAttribute(
      "href",
      "/cards/major-00-fool",
    );
    expect(screen.getByText("Princess of Disks").closest("a")).toHaveAttribute(
      "href",
      "/cards/disks-princess",
    );
  });

  it("names the card link without repeating the thumbnail alt text", () => {
    renderLibraryPage();

    // Querying all 78 links by accessible name is expensive in jsdom, so find
    // the link by its text and assert the accessible name on that element.
    const foolLink = screen.getByText("The Fool").closest("a");

    expect(foolLink).toHaveAccessibleName(/The Fool/);
    expect(foolLink).not.toHaveAccessibleName(/from the Thoth Tarot/i);
  });

  it("searches by name and reports the reduced count", async () => {
    const user = userEvent.setup();
    renderLibraryPage();

    await user.type(screen.getByRole("searchbox"), "Ace of Cups");

    expect(await screen.findByText("1 card")).toBeInTheDocument();
    expect(screen.getByText("Ace of Cups").closest("a")).toHaveAttribute(
      "href",
      "/cards/cups-ace",
    );
    expect(screen.queryByText("The Fool")).not.toBeInTheDocument();
  });

  it("combines filters and offers an empty state", async () => {
    const user = userEvent.setup();
    renderLibraryPage();

    await user.selectOptions(screen.getByLabelText(/arcana/i), "major");
    expect(screen.getByText("22 cards")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/suit/i), "Wands");
    expect(screen.getByText("0 cards")).toBeInTheDocument();
    expect(screen.getByText(/nothing in the deck answers that/i)).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: /clear filters/i })[0]!);

    expect(screen.getByText("78 cards")).toBeInTheDocument();
    expect(screen.getByText("The Fool")).toBeInTheDocument();
  });

  it("filters by element using the court sub-element", async () => {
    const user = userEvent.setup();
    renderLibraryPage();

    await user.selectOptions(screen.getByLabelText(/element/i), "Water");

    expect(screen.getByText("Queen of Wands")).toBeInTheDocument();
    expect(screen.queryByText("Ace of Wands")).not.toBeInTheDocument();
  });
});
