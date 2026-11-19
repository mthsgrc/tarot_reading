import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getOpenParadigm } from "../../domain/chaos/paradigm";
import {
  PARADIGM_STORAGE_KEY,
  loadParadigms,
  startStoredParadigm,
} from "../../lib/paradigmStorage";
import { ParadigmPage } from "./ParadigmPage";

const STARTED_AT = "2026-11-19T12:00:00.000Z";

function renderParadigmPage() {
  return render(
    <MemoryRouter initialEntries={["/chaos/paradigms"]}>
      <ParadigmPage />
    </MemoryRouter>,
  );
}

async function startExperiment(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByRole("textbox", { name: /temporary belief/i }),
    "There is no rush. The next useful step is enough.",
  );
  await user.click(screen.getByRole("button", { name: /start experiment/i }));
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ParadigmPage", () => {
  it("starts with prompts, a duration, and no open experiment", () => {
    renderParadigmPage();

    expect(
      screen.getByRole("heading", { level: 1, name: /try a belief on for size/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /set the experiment/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /nothing open/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "One day" })).toBeChecked();
    expect(screen.getByRole("group", { name: /starting points/i })).toBeInTheDocument();
    expect(loadParadigms()).toEqual([]);
  });

  it("fills the belief from a starting point and focuses it", async () => {
    const user = userEvent.setup();
    renderParadigmPage();

    const prompt = screen.getByRole("button", {
      name: /there is no rush/i,
    });
    await user.click(prompt);

    const belief = screen.getByRole("textbox", { name: /temporary belief/i });
    expect(belief).toHaveValue("There is no rush. The next useful step is enough.");
    expect(belief).toHaveFocus();
  });

  it("requires a belief before starting", async () => {
    const user = userEvent.setup();
    renderParadigmPage();

    await user.click(screen.getByRole("button", { name: /start experiment/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/write the belief/i);
    expect(screen.getByRole("textbox", { name: /temporary belief/i })).toHaveFocus();
    expect(loadParadigms()).toEqual([]);
  });

  it("starts an experiment and shows the open belief", async () => {
    const user = userEvent.setup();
    renderParadigmPage();

    await startExperiment(user);

    expect(
      screen.getByRole("heading", { level: 2, name: /there is no rush/i }),
    ).toHaveFocus();
    expect(screen.getByText("Open experiment")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^reflect$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /what did you notice/i }),
    ).toBeInTheDocument();
    expect(getOpenParadigm(loadParadigms())).not.toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(/experiment started/i);
  });

  it("requires a reflection before completing", async () => {
    const user = userEvent.setup();
    renderParadigmPage();
    await startExperiment(user);

    await user.click(screen.getByRole("button", { name: /complete experiment/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/write what you noticed/i);
    expect(screen.getByRole("textbox", { name: /what did you notice/i })).toHaveFocus();
    expect(getOpenParadigm(loadParadigms())).not.toBeNull();
  });

  it("completes the experiment and focuses the new record", async () => {
    const user = userEvent.setup();
    renderParadigmPage();
    await startExperiment(user);

    await user.type(
      screen.getByRole("textbox", { name: /what did you notice/i }),
      "I paused before answering and the conversation changed.",
    );
    await user.click(screen.getByRole("button", { name: /complete experiment/i }));

    expect(
      screen.getByRole("heading", { level: 3, name: /there is no rush/i }),
    ).toHaveFocus();
    expect(
      screen.getByRole("heading", { name: /past experiments/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 completed experiment/i)).toBeInTheDocument();
    expect(screen.getByText(/i paused before answering/i)).toBeInTheDocument();
    expect(getOpenParadigm(loadParadigms())).toBeNull();
    expect(loadParadigms()[0]?.reflection).toMatch(/I paused before answering/);
    expect(screen.getByRole("status")).toHaveTextContent(/experiment completed/i);
  });

  it("discards an open experiment after confirmation", async () => {
    const user = userEvent.setup();
    renderParadigmPage();
    await startExperiment(user);

    const discard = screen.getByRole("button", { name: /discard experiment/i });
    await user.click(discard);
    expect(
      screen.getByRole("group", { name: /confirm discarding the experiment/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^cancel$/i }));
    expect(
      screen.queryByRole("group", { name: /confirm discarding/i }),
    ).not.toBeInTheDocument();
    expect(discard).toHaveFocus();
    expect(loadParadigms()).toHaveLength(1);

    await user.click(discard);
    await user.click(screen.getByRole("button", { name: /yes, discard/i }));

    expect(screen.getByRole("heading", { name: /set the experiment/i })).toHaveFocus();
    expect(screen.getByText("Nothing open.")).toBeInTheDocument();
    expect(loadParadigms()).toEqual([]);
  });

  it("marks an experiment ready when its end has passed", async () => {
    startStoredParadigm(
      "I notice what is actually here.",
      "hour",
      "2000-01-01T00:00:00.000Z",
    );

    renderParadigmPage();

    expect(screen.getByText("Ready to reflect")).toBeInTheDocument();
  });

  it("keeps the belief when storage rejects a new experiment", async () => {
    const user = userEvent.setup();
    renderParadigmPage();
    await user.type(
      screen.getByRole("textbox", { name: /temporary belief/i }),
      "I can be wrong and still be safe.",
    );

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    await user.click(screen.getByRole("button", { name: /start experiment/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/could not be saved/i);
    expect(screen.getByRole("textbox", { name: /temporary belief/i })).toHaveValue(
      "I can be wrong and still be safe.",
    );
    expect(loadParadigms()).toEqual([]);
  });

  it("refreshes when another tab starts an experiment", async () => {
    renderParadigmPage();
    startStoredParadigm("The day is an experiment.", "day", STARTED_AT);
    fireEvent(window, new StorageEvent("storage", { key: PARADIGM_STORAGE_KEY }));

    expect(
      await screen.findByRole("heading", { level: 2, name: /the day is an experiment/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Open experiment")).toBeInTheDocument();
  });

  it("links back to the toolkit", () => {
    renderParadigmPage();

    expect(screen.getByRole("link", { name: /toolkit/i })).toHaveAttribute(
      "href",
      "/chaos",
    );
  });
});
