import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SERVITOR_STORAGE_KEY,
  createStoredServitor,
  loadServitors,
} from "../../lib/servitorStorage";
import { ServitorsPage } from "./ServitorsPage";

const CREATED_AT = "2026-11-19T12:00:00.000Z";

function renderServitorsPage() {
  return render(
    <MemoryRouter initialEntries={["/chaos/servitors"]}>
      <ServitorsPage />
    </MemoryRouter>,
  );
}

async function fillBasic(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole("textbox", { name: /^name$/i }), "The Doorkeeper");
  await user.type(
    screen.getByRole("textbox", { name: /^task$/i }),
    "I notice the next small step and take it.",
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ServitorsPage", () => {
  it("starts with an empty record list and a form", () => {
    renderServitorsPage();

    expect(
      screen.getByRole("heading", { level: 1, name: /give an intention a name/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /no servitors yet/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create servitor/i })).toBeEnabled();
    expect(loadServitors()).toEqual([]);
  });

  it("validates required fields and focuses the first problem", async () => {
    const user = userEvent.setup();
    renderServitorsPage();

    await user.click(screen.getByRole("button", { name: /create servitor/i }));

    expect(screen.getByText(/give the servitor a name/i)).toBeInTheDocument();
    expect(screen.getByText(/describe one task/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^name$/i })).toHaveFocus();
    expect(loadServitors()).toEqual([]);
  });

  it("creates a local record and moves focus to its heading", async () => {
    const user = userEvent.setup();
    renderServitorsPage();

    await fillBasic(user);
    await user.type(
      screen.getByRole("textbox", { name: /^form/i }),
      "A brass key with no lock.",
    );
    await user.click(screen.getByRole("button", { name: /create servitor/i }));

    const title = screen.getByRole("heading", { level: 3, name: "The Doorkeeper" });
    expect(title).toHaveFocus();
    expect(screen.getByText("A brass key with no lock.")).toBeInTheDocument();
    expect(screen.getByText("1 active · 0 retired")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/servitor created/i);
    expect(screen.getByRole("textbox", { name: /^name$/i })).toHaveValue("");
    expect(loadServitors()).toHaveLength(1);
    expect(loadServitors()[0]?.name).toBe("The Doorkeeper");
  });

  it("shows a review due badge from a past date", async () => {
    const user = userEvent.setup();
    renderServitorsPage();

    await fillBasic(user);
    fireEvent.change(screen.getByLabelText(/review on/i), {
      target: { value: "2000-01-01" },
    });
    await user.click(screen.getByRole("button", { name: /create servitor/i }));

    expect(screen.getByText("Review due")).toBeInTheDocument();
    expect(document.querySelector('time[datetime="2000-01-01"]')).toBeInTheDocument();
  });

  it("retires and restores a record", async () => {
    const user = userEvent.setup();
    renderServitorsPage();

    await fillBasic(user);
    await user.click(screen.getByRole("button", { name: /create servitor/i }));
    await user.click(screen.getByRole("button", { name: /retire the doorkeeper/i }));

    expect(screen.getByText("Retired")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /restore the doorkeeper/i }),
    ).toBeInTheDocument();
    expect(loadServitors()[0]?.retiredAt).not.toBeNull();

    await user.click(screen.getByRole("button", { name: /restore the doorkeeper/i }));

    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /retire the doorkeeper/i }),
    ).toBeInTheDocument();
    expect(loadServitors()[0]?.retiredAt).toBeNull();
  });

  it("deletes a record only after confirmation", async () => {
    const user = userEvent.setup();
    renderServitorsPage();

    await fillBasic(user);
    await user.click(screen.getByRole("button", { name: /create servitor/i }));

    const deleteButton = screen.getByRole("button", { name: /delete the doorkeeper/i });
    await user.click(deleteButton);
    expect(
      screen.getByRole("group", { name: /confirm deleting the doorkeeper/i }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(
      screen.queryByRole("group", { name: /confirm deleting/i }),
    ).not.toBeInTheDocument();
    expect(deleteButton).toHaveFocus();
    expect(loadServitors()).toHaveLength(1);

    await user.click(deleteButton);
    await user.click(screen.getByRole("button", { name: /yes, delete/i }));

    expect(screen.getByRole("heading", { name: /no servitors yet/i })).toHaveFocus();
    expect(loadServitors()).toEqual([]);
  });

  it("clears a field error as soon as the field changes", async () => {
    const user = userEvent.setup();
    renderServitorsPage();

    await user.click(screen.getByRole("button", { name: /create servitor/i }));
    expect(screen.getByText(/give the servitor a name/i)).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: /^name$/i }), "T");

    expect(screen.queryByText(/give the servitor a name/i)).not.toBeInTheDocument();
    expect(screen.getByText(/describe one task/i)).toBeInTheDocument();
  });

  it("keeps the draft when browser storage rejects the write", async () => {
    const user = userEvent.setup();
    renderServitorsPage();
    await fillBasic(user);

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    await user.click(screen.getByRole("button", { name: /create servitor/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/could not be saved/i);
    expect(screen.getByRole("textbox", { name: /^name$/i })).toHaveValue(
      "The Doorkeeper",
    );
    expect(loadServitors()).toEqual([]);
  });

  it("refreshes when another tab changes storage", async () => {
    renderServitorsPage();
    createStoredServitor(
      {
        name: "The Listener",
        task: "I hear what is actually said.",
        form: "",
        reviewOn: "",
      },
      CREATED_AT,
    );

    fireEvent(window, new StorageEvent("storage", { key: SERVITOR_STORAGE_KEY }));

    expect(
      await screen.findByRole("heading", { name: "The Listener" }),
    ).toBeInTheDocument();
  });

  it("links back to the toolkit", () => {
    renderServitorsPage();

    expect(screen.getByRole("link", { name: /toolkit/i })).toHaveAttribute(
      "href",
      "/chaos",
    );
  });
});
