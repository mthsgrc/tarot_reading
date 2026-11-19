import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SigilPage } from "./SigilPage";

function renderSigilPage() {
  return render(
    <MemoryRouter initialEntries={["/chaos/sigil"]}>
      <SigilPage />
    </MemoryRouter>,
  );
}

function currentGlyphPath(): string | null {
  return document.querySelector("svg path")?.getAttribute("d") ?? null;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SigilPage", () => {
  it("shows the empty state before a statement is forged", () => {
    renderSigilPage();

    expect(
      screen.getByRole("heading", { level: 1, name: /forge a sigil/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /nothing drawn yet/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /sigil for/i })).toBeNull();
    expect(screen.getByRole("button", { name: /forge sigil/i })).toBeDisabled();
  });

  it("rejects a statement that leaves fewer than two consonants", async () => {
    const user = userEvent.setup();
    renderSigilPage();

    await user.type(
      screen.getByRole("textbox", { name: /what are you encoding/i }),
      "I am",
    );
    await user.click(screen.getByRole("button", { name: /forge sigil/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/at least two consonants/i);
    expect(screen.queryByRole("img", { name: /sigil for/i })).toBeNull();

    await user.clear(screen.getByRole("textbox", { name: /what are you encoding/i }));
    await user.type(
      screen.getByRole("textbox", { name: /what are you encoding/i }),
      "I am ready",
    );
    await user.click(screen.getByRole("button", { name: /forge sigil/i }));

    expect(screen.queryByRole("alert")).toBeNull();
    expect(
      screen.getByRole("img", { name: /sigil for i am ready/i }),
    ).toBeInTheDocument();
  });

  it("keeps the glyph deterministic for the same normalized statement", async () => {
    const user = userEvent.setup();
    renderSigilPage();

    const input = screen.getByRole("textbox", { name: /what are you encoding/i });
    await user.type(input, "I will finish the work");
    await user.click(screen.getByRole("button", { name: /forge sigil/i }));

    const firstPath = currentGlyphPath();
    expect(firstPath).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /start another/i }));
    expect(screen.getByRole("textbox", { name: /what are you encoding/i })).toHaveValue(
      "",
    );

    await user.type(input, "  I   will finish  the work  ");
    await user.click(screen.getByRole("button", { name: /forge sigil/i }));

    expect(currentGlyphPath()).toBe(firstPath);
    expect(screen.getByText("W L F N S H T R K")).toBeInTheDocument();
  });

  it("moves focus to the result heading after forging", async () => {
    const user = userEvent.setup();
    renderSigilPage();

    await user.type(
      screen.getByRole("textbox", { name: /what are you encoding/i }),
      "I will finish the work",
    );
    await user.click(screen.getByRole("button", { name: /forge sigil/i }));

    expect(screen.getByRole("heading", { name: /your sigil/i })).toHaveFocus();
  });

  it("prepares an SVG download and reports the result", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn((_blob: Blob) => "blob:sigil");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    renderSigilPage();

    await user.type(
      screen.getByRole("textbox", { name: /what are you encoding/i }),
      "I will finish the work",
    );
    await user.click(screen.getByRole("button", { name: /forge sigil/i }));
    await user.click(screen.getByRole("button", { name: /download svg/i }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0]?.[0];
    expect(blob).toBeInstanceOf(Blob);

    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:sigil");
    expect(screen.getByRole("status")).toHaveTextContent(/svg prepared for download/i);
  });

  it("resets the workspace for another statement", async () => {
    const user = userEvent.setup();
    renderSigilPage();

    const input = screen.getByRole("textbox", { name: /what are you encoding/i });
    await user.type(input, "I will finish the work");
    await user.click(screen.getByRole("button", { name: /forge sigil/i }));
    await user.click(screen.getByRole("button", { name: /start another/i }));

    expect(
      screen.getByRole("heading", { name: /nothing drawn yet/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /what are you encoding/i })).toHaveValue(
      "",
    );
    expect(screen.getByRole("textbox", { name: /what are you encoding/i })).toHaveFocus();
    expect(screen.getByRole("button", { name: /forge sigil/i })).toBeDisabled();
  });

  it("links back to the toolkit", () => {
    renderSigilPage();

    const navigation = screen.getByRole("link", { name: /toolkit/i });
    expect(within(navigation).getByText(/toolkit/i)).toBeInTheDocument();
    expect(navigation).toHaveAttribute("href", "/chaos");
  });
});
