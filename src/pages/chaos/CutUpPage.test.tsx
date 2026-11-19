import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CutUpPage } from "./CutUpPage";

function renderCutUpPage() {
  return render(
    <MemoryRouter initialEntries={["/chaos/cut-up"]}>
      <CutUpPage />
    </MemoryRouter>,
  );
}

function fragments() {
  return within(screen.getByRole("list"))
    .getAllByRole("listitem")
    .map((item) => item.textContent);
}

describe("CutUpPage", () => {
  it("shows an empty state and a disabled cut button", () => {
    renderCutUpPage();

    expect(
      screen.getByRole("heading", { level: 1, name: /break the sentence open/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /nothing cut yet/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Lines" })).toBeChecked();
    expect(screen.getByRole("button", { name: /cut the text/i })).toBeDisabled();
  });

  it("rejects a single line and a single sentence", async () => {
    const user = userEvent.setup();
    renderCutUpPage();

    const input = screen.getByRole("textbox", { name: /text to cut/i });
    await user.type(input, "Only one line");
    await user.click(screen.getByRole("button", { name: /cut the text/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/at least two non-empty lines/i);

    await user.clear(input);
    await user.click(screen.getByText("Sentences"));
    await user.type(input, "Only one sentence.");
    await user.click(screen.getByRole("button", { name: /cut the text/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/at least two sentences/i);
  });

  it("cuts lines deterministically and moves focus to the result", async () => {
    const user = userEvent.setup();
    renderCutUpPage();

    await user.type(
      screen.getByRole("textbox", { name: /text to cut/i }),
      "First line\nSecond line",
    );
    await user.click(screen.getByRole("button", { name: /cut the text/i }));

    expect(screen.getByRole("heading", { level: 2, name: /^the cut$/i })).toHaveFocus();
    expect(screen.getByText(/cut 1 · lines · 2 fragments/i)).toBeInTheDocument();
    expect(fragments()).toEqual(["Second line", "First line"]);
  });

  it("cuts again without repeating the previous order", async () => {
    const user = userEvent.setup();
    renderCutUpPage();

    await user.type(
      screen.getByRole("textbox", { name: /text to cut/i }),
      "First line\nSecond line",
    );
    await user.click(screen.getByRole("button", { name: /cut the text/i }));
    expect(fragments()).toEqual(["Second line", "First line"]);

    await user.click(screen.getByRole("button", { name: /cut again/i }));

    expect(screen.getByText(/cut 2 · lines · 2 fragments/i)).toBeInTheDocument();
    expect(fragments()).toEqual(["First line", "Second line"]);
  });

  it("cuts a paragraph into sentences", async () => {
    const user = userEvent.setup();
    renderCutUpPage();

    await user.click(screen.getByText("Sentences"));
    await user.type(
      screen.getByRole("textbox", { name: /text to cut/i }),
      "One. Two!\nThree?",
    );
    await user.click(screen.getByRole("button", { name: /cut the text/i }));

    expect(screen.getByText(/cut 1 · sentences · 3 fragments/i)).toBeInTheDocument();
    expect(fragments()).toHaveLength(3);
    expect([...fragments()!].sort()).toEqual(["One.", "Three?", "Two!"]);
  });

  it("clears a result when the text or mode changes", async () => {
    const user = userEvent.setup();
    renderCutUpPage();

    const input = screen.getByRole("textbox", { name: /text to cut/i });
    await user.type(input, "First line\nSecond line");
    await user.click(screen.getByRole("button", { name: /cut the text/i }));
    expect(screen.getByRole("list")).toBeInTheDocument();

    await user.type(input, " changed");
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.getByRole("heading", { name: /nothing cut yet/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /cut the text/i }));
    expect(screen.getByRole("list")).toBeInTheDocument();

    await user.click(screen.getByText("Sentences"));
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("starts over with focus on the text field", async () => {
    const user = userEvent.setup();
    renderCutUpPage();

    const input = screen.getByRole("textbox", { name: /text to cut/i });
    await user.type(input, "First line\nSecond line");
    await user.click(screen.getByRole("button", { name: /cut the text/i }));
    await user.click(screen.getByRole("button", { name: /start over/i }));

    expect(screen.getByRole("textbox", { name: /text to cut/i })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: /text to cut/i })).toHaveFocus();
    expect(screen.getByRole("button", { name: /cut the text/i })).toBeDisabled();
    expect(screen.getByRole("heading", { name: /nothing cut yet/i })).toBeInTheDocument();
  });

  it("links back to the toolkit", () => {
    renderCutUpPage();

    expect(screen.getByRole("link", { name: /toolkit/i })).toHaveAttribute(
      "href",
      "/chaos",
    );
  });
});
