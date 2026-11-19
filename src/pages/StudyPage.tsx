import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cardPath } from "../app/paths";
import { cardTypeLabel } from "../domain/cardLabels";
import { createStudyQuestion } from "../domain/study";
import styles from "./StudyPage.module.css";

export function StudyPage() {
  const [question, setQuestion] = useState(() => createStudyQuestion());
  const [questionNumber, setQuestionNumber] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, answered: 0 });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const focusQuestion = useRef(false);

  const answered = selected !== null;
  const isCorrect = selected === question.answer;

  useEffect(() => {
    if (answered) {
      nextButtonRef.current?.focus();
    }
  }, [answered]);

  useEffect(() => {
    if (!focusQuestion.current) {
      return;
    }

    focusQuestion.current = false;
    const heading = headingRef.current;
    if (!heading) {
      return;
    }

    // Focus without racing the smooth scroll to the previous button, then align
    // the prompt below the sticky header.
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: "start", behavior: "instant" });
  }, [questionNumber]);

  function handleAnswer(option: string) {
    if (answered) {
      return;
    }

    setSelected(option);
    setScore((previous) => ({
      correct: previous.correct + (option === question.answer ? 1 : 0),
      answered: previous.answered + 1,
    }));
  }

  function nextQuestion() {
    focusQuestion.current = true;
    setQuestion(createStudyQuestion());
    setQuestionNumber((number) => number + 1);
    setSelected(null);
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className="eyebrow">Study</p>
        <h1 className={`display-title ${styles.title}`}>Train the correspondences</h1>
        <p className="lede">
          A quick multiple-choice drill across elements, Hebrew letters, Tree paths,
          Golden Dawn titles, and Sephiroth. The score lasts for this visit only.
        </p>
      </header>

      <section className={`panel ${styles.quiz}`} aria-labelledby="study-question">
        <div className={styles.meta}>
          <p className={styles.counter}>Question {questionNumber}</p>
          <p className={styles.score}>
            {score.correct} correct · {score.answered} answered
          </p>
        </div>

        <p className={styles.cardMeta}>{cardTypeLabel(question.card)}</p>
        <h2 id="study-question" className={styles.prompt} ref={headingRef} tabIndex={-1}>
          {question.prompt}
        </h2>

        <ul className={styles.options} aria-label="Answer choices">
          {question.options.map((option) => {
            const optionCorrect = answered && option === question.answer;
            const optionWrong = answered && option === selected && !optionCorrect;

            return (
              <li key={option}>
                <button
                  type="button"
                  className={`${styles.option} ${
                    optionCorrect ? styles.optionCorrect : ""
                  } ${optionWrong ? styles.optionWrong : ""}`}
                  disabled={answered}
                  onClick={() => handleAnswer(option)}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>

        <div className={styles.feedback} role="status">
          {answered ? (
            <>
              <p className={isCorrect ? styles.correct : styles.incorrect}>
                {isCorrect ? "Correct." : `Not quite. The answer is ${question.answer}.`}
              </p>
              <p className={styles.explanation}>{question.explanation}</p>
            </>
          ) : (
            <p className={styles.hint}>Choose the option that fits.</p>
          )}
        </div>

        <div className={styles.actions}>
          {answered ? (
            <button
              ref={nextButtonRef}
              type="button"
              className="button button--primary"
              onClick={nextQuestion}
            >
              Next question
            </button>
          ) : (
            <button type="button" className="button button--ghost" onClick={nextQuestion}>
              Skip question
            </button>
          )}

          {answered && (
            <Link to={cardPath(question.card.id)} className="button button--ghost">
              Read the card
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
