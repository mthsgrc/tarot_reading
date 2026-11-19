import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../app/paths";
import {
  PARADIGM_PROMPTS,
  PARADIGM_REFLECTION_MAX,
  PARADIGM_BELIEF_MAX,
  PARADIGM_DURATIONS,
  getOpenParadigm,
  isParadigmReady,
  normalizeParadigmBelief,
  normalizeParadigmReflection,
  paradigmDuration,
  type ParadigmDuration,
  type ParadigmExperiment,
} from "../../domain/chaos/paradigm";
import {
  PARADIGM_STORAGE_KEY,
  completeStoredParadigm,
  deleteStoredParadigm,
  loadParadigms,
  startStoredParadigm,
} from "../../lib/paradigmStorage";
import styles from "./ParadigmPage.module.css";

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

type PendingFocus =
  { kind: "setup" } | { kind: "open" } | { kind: "history"; id: string } | null;

function formatTimestamp(value: string): string {
  return DATE_FORMAT.format(new Date(value));
}

export function ParadigmPage() {
  const [experiments, setExperiments] = useState(loadParadigms);
  const [belief, setBelief] = useState("");
  const [duration, setDuration] = useState<ParadigmDuration>("day");
  const [reflection, setReflection] = useState("");
  const [error, setError] = useState("");
  const [problem, setProblem] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [now, setNow] = useState(() => new Date().toISOString());
  const pendingFocus = useRef<PendingFocus>(null);
  const beliefRef = useRef<HTMLTextAreaElement>(null);
  const reflectionRef = useRef<HTMLTextAreaElement>(null);
  const setupHeadingRef = useRef<HTMLHeadingElement>(null);
  const openHeadingRef = useRef<HTMLHeadingElement>(null);
  const discardButtonRef = useRef<HTMLButtonElement>(null);

  const open = getOpenParadigm(experiments);
  const completed = experiments.filter(
    (experiment): experiment is ParadigmExperiment & { completedAt: string } =>
      experiment.completedAt !== null,
  );
  const ready = open ? isParadigmReady(open.endsAt, now) : false;

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== null && event.key !== PARADIGM_STORAGE_KEY) {
        return;
      }

      setExperiments(loadParadigms());
      setNow(new Date().toISOString());
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Refresh "ready to reflect" while an experiment is open. The button is
  // always available; this only updates the status copy.
  useEffect(() => {
    if (!open) {
      return;
    }

    const interval = window.setInterval(() => setNow(new Date().toISOString()), 30_000);

    return () => window.clearInterval(interval);
  }, [open]);

  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) {
      return;
    }

    pendingFocus.current = null;

    if (target.kind === "setup") {
      setupHeadingRef.current?.focus();
      return;
    }

    if (target.kind === "open") {
      openHeadingRef.current?.focus();
      return;
    }

    document.getElementById(`paradigm-history-${target.id}`)?.focus();
  }, [experiments]);

  function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeParadigmBelief(belief);

    if (!normalized) {
      setError("Write the belief you want to try.");
      beliefRef.current?.focus();
      return;
    }

    const result = startStoredParadigm(normalized, duration);

    if (result.status === "saved") {
      setExperiments(result.experiments);
      setBelief("");
      setError("");
      setProblem("");
      setFeedback("Experiment started.");
      setConfirmDiscard(false);
      setNow(new Date().toISOString());
      pendingFocus.current = { kind: "open" };
      return;
    }

    if (result.status === "open") {
      setExperiments(loadParadigms());
      setProblem("An experiment is already open. Reflect on it before starting another.");
      return;
    }

    if (result.status === "invalid") {
      setError("Keep the belief to a single, workable sentence.");
      beliefRef.current?.focus();
      return;
    }

    setProblem(
      "The experiment could not be saved. Browser storage may be unavailable or full.",
    );
  }

  function handleComplete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!open) {
      return;
    }

    const normalized = normalizeParadigmReflection(reflection);

    if (!normalized) {
      setError("Write what you noticed before completing the experiment.");
      reflectionRef.current?.focus();
      return;
    }

    const next = completeStoredParadigm(open.id, normalized);

    if (!next) {
      setProblem(
        "The reflection could not be saved. Browser storage may be unavailable or full.",
      );
      return;
    }

    setExperiments(next);
    setReflection("");
    setError("");
    setProblem("");
    setFeedback("Experiment completed and added to your record.");
    setConfirmDiscard(false);
    pendingFocus.current = { kind: "history", id: open.id };
  }

  function handleDiscard() {
    if (!open) {
      return;
    }

    const next = deleteStoredParadigm(open.id);

    if (!next) {
      setProblem(
        "The experiment could not be discarded. Browser storage may be unavailable or full.",
      );
      return;
    }

    setExperiments(next);
    setReflection("");
    setError("");
    setProblem("");
    setFeedback("Experiment discarded.");
    setConfirmDiscard(false);
    pendingFocus.current = { kind: "setup" };
  }

  function cancelDiscard() {
    setConfirmDiscard(false);
    discardButtonRef.current?.focus();
  }

  function applyPrompt(prompt: string) {
    setBelief(prompt);
    setError("");
    beliefRef.current?.focus();
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <Link to={PATHS.chaos} className={styles.backLink}>
          <span aria-hidden="true">←</span> Toolkit
        </Link>
        <p className="eyebrow">Tool 05 · Paradigm</p>
        <h1 className={`display-title ${styles.title}`}>Try a belief on for size.</h1>
        <p className="lede">
          Choose a temporary belief, hold it lightly for a set span, and record what
          changes. The experiment is a lens, not a truth claim. Keep it provisional, kind,
          and grounded in what you can actually observe.
        </p>
      </header>

      <div className={styles.workspace}>
        <section
          className={`panel ${styles.actionPanel}`}
          aria-labelledby="paradigm-action-title"
        >
          {open ? (
            <>
              <h2 id="paradigm-action-title" className={styles.panelTitle}>
                Reflect
              </h2>
              <p className={styles.intro}>
                You can complete the experiment at any time. A sentence about what you
                noticed is enough; it does not have to be tidy.
              </p>

              <form onSubmit={handleComplete} noValidate>
                <div className={styles.field}>
                  <label className="field-label" htmlFor="paradigm-reflection">
                    What did you notice?
                  </label>
                  <textarea
                    id="paradigm-reflection"
                    className={`text-area ${styles.reflectionInput}`}
                    ref={reflectionRef}
                    value={reflection}
                    maxLength={PARADIGM_REFLECTION_MAX}
                    onChange={(event) => {
                      setReflection(event.target.value);
                      setError("");
                      setFeedback("");
                      setProblem("");
                    }}
                    aria-describedby="paradigm-reflection-hint"
                    placeholder="What changed in your attention, choices, or mood?"
                  />
                  <p id="paradigm-reflection-hint" className={styles.fieldHint}>
                    {PARADIGM_REFLECTION_MAX - reflection.length} characters left.
                  </p>
                  {error && (
                    <p className={styles.fieldError} role="alert">
                      {error}
                    </p>
                  )}
                </div>

                <div className={styles.actions}>
                  <button type="submit" className="button button--primary">
                    Complete experiment
                  </button>
                  <button
                    type="button"
                    className="button button--ghost"
                    ref={discardButtonRef}
                    aria-expanded={confirmDiscard}
                    onClick={() => setConfirmDiscard((current) => !current)}
                  >
                    Discard experiment
                  </button>
                </div>

                {confirmDiscard && (
                  <div
                    className={styles.confirm}
                    role="group"
                    aria-label="Confirm discarding the experiment"
                  >
                    <span>Discard this experiment and its open reflection?</span>
                    <button
                      type="button"
                      className="button button--small"
                      onClick={handleDiscard}
                    >
                      Yes, discard
                    </button>
                    <button
                      type="button"
                      className="button button--small button--ghost"
                      onClick={cancelDiscard}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </>
          ) : (
            <>
              <h2
                id="paradigm-action-title"
                className={styles.panelTitle}
                ref={setupHeadingRef}
                tabIndex={-1}
              >
                Set the experiment
              </h2>

              <form onSubmit={handleStart} noValidate>
                <div className={styles.field}>
                  <p className="field-label" id="paradigm-prompts-label">
                    Starting points
                  </p>
                  <div
                    className={styles.prompts}
                    role="group"
                    aria-labelledby="paradigm-prompts-label"
                  >
                    {PARADIGM_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className={styles.prompt}
                        onClick={() => applyPrompt(prompt)}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                  <p className={styles.fieldHint}>
                    Choose one to fill the field, then edit it until it fits.
                  </p>
                </div>

                <div className={styles.field}>
                  <label className="field-label" htmlFor="paradigm-belief">
                    Temporary belief
                  </label>
                  <textarea
                    id="paradigm-belief"
                    className={`text-area ${styles.beliefInput}`}
                    ref={beliefRef}
                    value={belief}
                    maxLength={PARADIGM_BELIEF_MAX}
                    onChange={(event) => {
                      setBelief(event.target.value);
                      setError("");
                      setFeedback("");
                      setProblem("");
                    }}
                    aria-describedby="paradigm-belief-hint"
                    placeholder="There is no rush. The next useful step is enough."
                  />
                  <p id="paradigm-belief-hint" className={styles.fieldHint}>
                    Prefer a belief you can test through ordinary attention. Do not use
                    this to override evidence about health, money, safety, or consent.
                  </p>
                  {error && (
                    <p className={styles.fieldError} role="alert">
                      {error}
                    </p>
                  )}
                </div>

                <fieldset className={styles.fieldset}>
                  <legend className="field-label">Duration</legend>
                  <div className={styles.durations}>
                    {PARADIGM_DURATIONS.map((option) => (
                      <label
                        key={option.id}
                        className={
                          duration === option.id
                            ? `${styles.duration} ${styles.durationSelected}`
                            : styles.duration
                        }
                      >
                        <input
                          className={styles.radio}
                          type="radio"
                          name="paradigm-duration"
                          value={option.id}
                          checked={duration === option.id}
                          onChange={() => setDuration(option.id)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className={styles.actions}>
                  <button type="submit" className="button button--primary">
                    Start experiment
                  </button>
                </div>
              </form>
            </>
          )}

          <p className={styles.feedback} role="status" aria-live="polite">
            {feedback}
          </p>
          {problem && (
            <p className={styles.error} role="alert">
              {problem}
            </p>
          )}
        </section>

        <section
          className={`panel ${styles.experimentPanel}`}
          aria-labelledby="paradigm-experiment-title"
        >
          {open ? (
            <>
              <p className={`eyebrow ${ready ? styles.ready : ""}`}>
                {ready ? "Ready to reflect" : "Open experiment"}
              </p>
              <h2
                id="paradigm-experiment-title"
                className={styles.beliefTitle}
                ref={openHeadingRef}
                tabIndex={-1}
              >
                “{open.belief}”
              </h2>
              <p className={styles.experimentMeta}>
                {paradigmDuration(open.duration).label}
                <span aria-hidden="true"> · </span>
                Started{" "}
                <time dateTime={open.startedAt}>{formatTimestamp(open.startedAt)}</time>
                <span aria-hidden="true"> · </span>
                Ends <time dateTime={open.endsAt}>{formatTimestamp(open.endsAt)}</time>
              </p>
              <p className={styles.experimentNote}>
                Hold it lightly. The point is to notice what changes, not to defend the
                belief. Complete the experiment whenever the span feels finished.
              </p>
            </>
          ) : (
            <div className={styles.empty}>
              <p className="eyebrow">The experiment</p>
              <h2 id="paradigm-experiment-title" className={styles.emptyTitle}>
                Nothing open.
              </h2>
              <p className={styles.emptyText}>
                Choose a belief and a duration on the left. The experiment stays here
                until you complete it or discard it, and it never leaves this browser.
              </p>
            </div>
          )}
        </section>
      </div>

      {completed.length > 0 && (
        <section className={styles.history} aria-labelledby="paradigm-history-title">
          <div className={styles.historyHead}>
            <div>
              <p className="eyebrow">Your record</p>
              <h2 id="paradigm-history-title" className={styles.historyTitle}>
                Past experiments
              </h2>
            </div>
            <p className={styles.count}>
              {completed.length} completed{" "}
              {completed.length === 1 ? "experiment" : "experiments"}
            </p>
          </div>

          <ul className={styles.historyList}>
            {completed.map((experiment) => (
              <li key={experiment.id} className={styles.historyItem}>
                <p className={styles.historyMeta}>
                  {paradigmDuration(experiment.duration).label} · Completed{" "}
                  {formatTimestamp(experiment.completedAt)}
                </p>
                <h3
                  id={`paradigm-history-${experiment.id}`}
                  className={styles.historyBelief}
                  tabIndex={-1}
                >
                  “{experiment.belief}”
                </h3>
                <p className={styles.historyReflection}>{experiment.reflection}</p>
                <p className={styles.historyDates}>
                  Started {formatTimestamp(experiment.startedAt)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className={styles.note}>
        A temporary belief is a lens, not a verdict. Do not use this exercise to override
        evidence about health, money, safety, or another person’s consent. If the
        experiment leaves you distressed, stop and talk to someone you trust.
      </p>
    </div>
  );
}
