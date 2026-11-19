import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GnosisPage } from "./GnosisPage";

function renderGnosisPage() {
  return render(
    <MemoryRouter initialEntries={["/chaos/gnosis"]}>
      <GnosisPage />
    </MemoryRouter>,
  );
}

function clock() {
  return screen.getByRole("timer");
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("GnosisPage", () => {
  it("starts at five minutes and changes the span while idle", () => {
    renderGnosisPage();

    expect(clock()).toHaveTextContent("05:00");
    expect(screen.getByRole("radio", { name: "5 min" })).toBeChecked();
    expect(screen.getByRole("button", { name: /^start$/i })).toBeEnabled();

    fireEvent.click(screen.getByRole("radio", { name: "10 min" }));

    expect(clock()).toHaveTextContent("10:00");
    expect(screen.getByRole("radio", { name: "10 min" })).toBeChecked();
  });

  it("runs, pauses, resumes, and completes with focus on the result", () => {
    renderGnosisPage();

    fireEvent.click(screen.getByRole("button", { name: /^start$/i }));
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^pause$/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(clock()).toHaveTextContent("04:58");

    fireEvent.click(screen.getByRole("button", { name: /^pause$/i }));
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^resume$/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(clock()).toHaveTextContent("04:58");

    fireEvent.click(screen.getByRole("button", { name: /^resume$/i }));
    act(() => {
      vi.advanceTimersByTime(298000);
    });

    expect(clock()).toHaveTextContent("00:00");
    expect(screen.getByText("Complete")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /^time\.$/i })).toHaveFocus();
    expect(screen.getByText(/the span is complete/i)).toBeInTheDocument();
  });

  it("resets to the chosen span and clears the countdown", () => {
    renderGnosisPage();

    fireEvent.click(screen.getByRole("radio", { name: "10 min" }));
    fireEvent.click(screen.getByRole("button", { name: /^start$/i }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(clock()).toHaveTextContent("09:57");

    fireEvent.click(screen.getByRole("button", { name: /^reset$/i }));

    expect(clock()).toHaveTextContent("10:00");
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^start$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^reset$/i })).toBeDisabled();
  });

  it("locks the span while the timer is running or paused", () => {
    renderGnosisPage();

    fireEvent.click(screen.getByRole("button", { name: /^start$/i }));
    expect(screen.getByRole("radio", { name: "10 min" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /^pause$/i }));
    expect(screen.getByRole("radio", { name: "10 min" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /^reset$/i }));
    expect(screen.getByRole("radio", { name: "10 min" })).toBeEnabled();
  });

  it("returns the full span when starting again after completion", () => {
    renderGnosisPage();

    fireEvent.click(screen.getByRole("button", { name: /^start$/i }));
    act(() => {
      vi.advanceTimersByTime(300000);
    });
    expect(screen.getByText("Complete")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /start again/i }));

    expect(clock()).toHaveTextContent("05:00");
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("links back to the toolkit", () => {
    renderGnosisPage();

    expect(screen.getByRole("link", { name: /toolkit/i })).toHaveAttribute(
      "href",
      "/chaos",
    );
  });
});
