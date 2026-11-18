import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CARD_BY_ID } from "../data/cards";
import { createStudyQuestion, type StudyQuestion } from "../domain/study";
import { StudyPage } from "./StudyPage";

vi.mock("../domain/study", () => ({
  createStudyQuestion: vi.fn(),
}));

const FOOL = CARD_BY_ID.get("major-00-fool");
if (!FOOL) {
  throw new Error("Missing the Fool");
}

const QUESTIONS: readonly StudyQuestion[] = [
  {
    id: "hebrew-letter:major-00-fool",
    topic: "hebrew-letter",
    card: FOOL,
    prompt: "Which Hebrew letter is attributed to The Fool?",
    answer: "Aleph",
    options: ["Aleph", "Beth", "Gimel", "Daleth"],
    explanation: "The Fool carries Aleph (א).",
  },
  {
    id: "gd-title:major-00-fool",
    topic: "gd-title",
    card: FOOL,
    prompt: "Which Golden Dawn title belongs to The Fool?",
    answer: "The Spirit of the Aether",
    options: [
      "The Spirit of the Aether",
      "The Magus of Power",
      "The Daughter of the Mighty Ones",
      "The Lord of the Gates of Matter",
    ],
    explanation: "Its Golden Dawn title is “The Spirit of the Aether.”",
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <StudyPage />
    </MemoryRouter>,
  );
}

function answerChoices() {
  return screen.getByRole("list", { name: /answer choices/i });
}

beforeEach(() => {
  let call = 0;
  vi.mocked(createStudyQuestion).mockImplementation(
    () => QUESTIONS[Math.min(call++, QUESTIONS.length - 1)]!,
  );
});

describe("StudyPage", () => {
  it("shows a question, four choices, and an in-session score", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { level: 1, name: /train the correspondences/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /which hebrew letter is attributed to the fool/i,
      }),
    ).toBeInTheDocument();
    expect(within(answerChoices()).getAllByRole("button")).toHaveLength(4);
    expect(screen.getByText("0 correct · 0 answered")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /skip question/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /read the card/i }),
    ).not.toBeInTheDocument();
  });

  it("scores a correct answer and moves focus to Next question", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Aleph" }));

    expect(screen.getByText("Correct.")).toBeInTheDocument();
    expect(screen.getByText("The Fool carries Aleph (א).")).toBeInTheDocument();
    expect(screen.getByText("1 correct · 1 answered")).toBeInTheDocument();
    for (const option of within(answerChoices()).getAllByRole("button")) {
      expect(option).toBeDisabled();
    }

    expect(screen.getByRole("button", { name: /next question/i })).toHaveFocus();
    expect(screen.getByRole("link", { name: /read the card/i })).toHaveAttribute(
      "href",
      "/cards/major-00-fool",
    );
  });

  it("reveals the answer after a wrong choice without adding a point", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Beth" }));

    expect(screen.getByText("Not quite. The answer is Aleph.")).toBeInTheDocument();
    expect(screen.getByText("0 correct · 1 answered")).toBeInTheDocument();
  });

  it("loads the next question and focuses its prompt", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Aleph" }));
    await user.click(screen.getByRole("button", { name: /next question/i }));

    expect(screen.getByText("Question 2")).toBeInTheDocument();
    expect(screen.getByText("1 correct · 1 answered")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /which golden dawn title belongs to the fool/i,
      }),
    ).toHaveFocus();
    expect(screen.getByText(/choose the option that fits/i)).toBeInTheDocument();
    for (const option of within(answerChoices()).getAllByRole("button")) {
      expect(option).toBeEnabled();
    }
  });

  it("skips without answering or scoring", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /skip question/i }));

    expect(screen.getByText("Question 2")).toBeInTheDocument();
    expect(screen.getByText("0 correct · 0 answered")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /which golden dawn title belongs to the fool/i,
      }),
    ).toHaveFocus();
    expect(
      screen.queryByRole("link", { name: /read the card/i }),
    ).not.toBeInTheDocument();
  });
});
