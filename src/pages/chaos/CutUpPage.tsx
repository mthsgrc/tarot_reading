import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../app/paths";
import {
  CUT_UP_MODES,
  CUT_UP_TEXT_MAX,
  buildCutUp,
  normalizeCutUpText,
  type CutUp,
  type CutUpMode,
} from "../../domain/chaos/cutup";
import styles from "./CutUpPage.module.css";

const MODE_LABEL: Record<CutUpMode, string> = {
  lines: "Lines",
  sentences: "Sentences",
};

export function CutUpPage() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<CutUpMode>("lines");
  const [cut, setCut] = useState<CutUp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const normalized = normalizeCutUpText(text);

  useEffect(() => {
    if (cut) {
      resultHeadingRef.current?.focus();
    }
  }, [cut]);

  function clearResult() {
    setCut(null);
    setError(null);
  }

  function handleTextChange(value: string) {
    setText(value);
    clearResult();
  }

  function handleModeChange(next: CutUpMode) {
    setMode(next);
    clearResult();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = buildCutUp(text, mode, 0);

    if (!next) {
      setCut(null);
      setError(
        mode === "lines"
          ? "Add at least two non-empty lines before cutting."
          : "Add at least two sentences before cutting.",
      );
      return;
    }

    setError(null);
    setCut(next);
  }

  function cutAgain() {
    if (!cut) {
      return;
    }

    const next = buildCutUp(text, mode, cut.cutIndex + 1, cut.fragments);

    if (!next) {
      setError("The text changed too much to cut again. Start a new cut.");
      return;
    }

    setError(null);
    setCut(next);
  }

  function startOver() {
    setText("");
    setCut(null);
    setError(null);
    textAreaRef.current?.focus();
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <Link to={PATHS.chaos} className={styles.backLink}>
          <span aria-hidden="true">←</span> Toolkit
        </Link>
        <p className="eyebrow">Tool 03 · Cut-up</p>
        <h1 className={`display-title ${styles.title}`}>Break the sentence open.</h1>
        <p className="lede">
          Cut-up is a collage technique associated with Brion Gysin and William S.
          Burroughs. Paste your own lines or sentences and this tool rearranges them into
          a new sequence. The result is a prompt for noticing, not a prediction.
        </p>
      </header>

      <div className={styles.workspace}>
        <section
          className={`panel ${styles.formPanel}`}
          aria-labelledby="cutup-form-title"
        >
          <h2 id="cutup-form-title" className={styles.panelTitle}>
            Your material
          </h2>

          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="cutup-text">
              Text to cut
            </label>
            <textarea
              id="cutup-text"
              className={`text-area ${styles.textArea}`}
              ref={textAreaRef}
              value={text}
              maxLength={CUT_UP_TEXT_MAX}
              onChange={(event) => handleTextChange(event.target.value)}
              aria-describedby="cutup-hint"
              placeholder={
                "One thought per line.\nOr write a paragraph and cut it into sentences."
              }
            />
            <p id="cutup-hint" className={styles.hint}>
              Nothing is uploaded or saved. Lines and sentences stay in this tab, so avoid
              pasting material you would not want on screen.
            </p>

            <fieldset className={styles.fieldset}>
              <legend className="field-label">Cut by</legend>
              <div className={styles.modes}>
                {CUT_UP_MODES.map((option) => (
                  <label
                    key={option.id}
                    className={
                      mode === option.id
                        ? `${styles.mode} ${styles.modeSelected}`
                        : styles.mode
                    }
                  >
                    <input
                      className={styles.radio}
                      type="radio"
                      name="cutup-mode"
                      value={option.id}
                      checked={mode === option.id}
                      onChange={() => handleModeChange(option.id)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
              <p className={styles.modeHint}>
                {CUT_UP_MODES.find((option) => option.id === mode)?.hint}
              </p>
            </fieldset>

            <div className={styles.formFooter}>
              <span className={styles.count} aria-hidden="true">
                {text.length}/{CUT_UP_TEXT_MAX}
              </span>
              <button
                type="submit"
                className="button button--primary"
                disabled={!normalized}
              >
                Cut the text
              </button>
            </div>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
          </form>
        </section>

        <section
          className={`panel ${styles.resultPanel}`}
          aria-labelledby="cutup-result-title"
        >
          {cut ? (
            <>
              <h2
                id="cutup-result-title"
                className={styles.resultTitle}
                ref={resultHeadingRef}
                tabIndex={-1}
              >
                The cut
              </h2>
              <p className={styles.resultMeta}>
                Cut {cut.cutIndex + 1} · {MODE_LABEL[cut.mode]} · {cut.fragments.length}{" "}
                fragments
              </p>
              <ol className={styles.fragmentList}>
                {cut.fragments.map((fragment, index) => (
                  <li key={`${index}-${fragment}`}>{fragment}</li>
                ))}
              </ol>
              <div className={styles.resultActions}>
                <button type="button" className="button" onClick={cutAgain}>
                  Cut again
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={startOver}
                >
                  Start over
                </button>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <p className="eyebrow">Waiting for material</p>
              <h2 id="cutup-result-title" className={styles.resultTitle}>
                Nothing cut yet.
              </h2>
              <p className={styles.emptyText}>
                The new order appears here. Each cut is deterministic: the same text and
                cut number always produce the same sequence, and{" "}
                <strong>Cut again</strong> moves to the next arrangement.
              </p>
            </div>
          )}
        </section>
      </div>

      <p className={styles.note}>
        A cut-up does not tell you what will happen. It gives familiar words a new
        adjacency and lets you notice what you make of the change. Keep what is useful,
        and discard the rest.
      </p>
    </div>
  );
}
