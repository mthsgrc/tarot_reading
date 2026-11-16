import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ReadingPage } from "./ReadingPage";

function renderReadingPage() {
  return render(
    <MemoryRouter>
      <ReadingPage />
    </MemoryRouter>,
  );
}

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
