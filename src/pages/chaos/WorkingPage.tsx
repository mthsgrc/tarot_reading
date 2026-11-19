import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../app/paths";
import { isValidDateInput, localDateString } from "../../domain/chaos/date";
import {
  WORKING_ACTION_MAX,
  WORKING_CLOSING_MAX,
  WORKING_INTENTION_MAX,
  WORKING_PREPARATION_MAX,
  WORKING_REFLECTION_MAX,
  WORKING_TITLE_MAX,
  hasWorkingErrors,
  normalizeWorkingDraft,
  validateWorkingDraft,
  workingToRecordDraft,
  type WorkingDraft,
  type WorkingErrors,
} from "../../domain/chaos/working";
import { addStoredRecord } from "../../lib/recordStorage";
import styles from "./WorkingPage.module.css";

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const FIELD_ORDER = [
  "title",
  "date",
  "intention",
  "preparation",
  "action",
  "closing",
  "reflection",
] as const;

function emptyWorking(): WorkingDraft {
  return {
    title: "",
    date: localDateString(),
    intention: "",
    preparation: "",
    action: "",
    closing: "",
    reflection: "",
  };
}

function formatDate(value: string): string {
  return DATE_FORMAT.format(new Date(`${value}T00:00:00`));
}

export function WorkingPage() {
  const [draft, setDraft] = useState<WorkingDraft>(emptyWorking);
  const [errors, setErrors] = useState<WorkingErrors>({});
  const [problem, setProblem] = useState("");
  const [saved, setSaved] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const intentionRef = useRef<HTMLTextAreaElement>(null);
  const preparationRef = useRef<HTMLTextAreaElement>(null);
  const actionRef = useRef<HTMLTextAreaElement>(null);
  const closingRef = useRef<HTMLTextAreaElement>(null);
  const reflectionRef = useRef<HTMLTextAreaElement>(null);
  const savedHeadingRef = useRef<HTMLHeadingElement>(null);

  const preview = normalizeWorkingDraft(draft);
  const hasPreview =
    Boolean(preview.title) ||
    Boolean(preview.intention) ||
    Boolean(preview.preparation) ||
    Boolean(preview.action) ||
    Boolean(preview.closing) ||
    Boolean(preview.reflection);

  useEffect(() => {
    if (saved) {
      savedHeadingRef.current?.focus();
    }
  }, [saved]);

  function focusField(field: keyof WorkingDraft) {
    switch (field) {
      case "title":
        titleRef.current?.focus();
        break;
      case "date":
        dateRef.current?.focus();
        break;
      case "intention":
        intentionRef.current?.focus();
        break;
      case "preparation":
        preparationRef.current?.focus();
        break;
      case "action":
        actionRef.current?.focus();
        break;
      case "closing":
        closingRef.current?.focus();
        break;
      case "reflection":
        reflectionRef.current?.focus();
        break;
    }
  }

  function updateField<K extends keyof WorkingDraft>(field: K, value: WorkingDraft[K]) {
    setDraft((current) => {
      const next = { ...current };
      next[field] = value;
      return next;
    });
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setSaved(false);
    setProblem("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateWorkingDraft(draft);

    if (hasWorkingErrors(nextErrors)) {
      setErrors(nextErrors);
      setProblem("");
      const firstError = FIELD_ORDER.find((field) => nextErrors[field]);
      if (firstError) {
        focusField(firstError);
      }
      return;
    }

    const result = addStoredRecord(workingToRecordDraft(draft));

    if (result.status === "saved") {
      setErrors({});
      setProblem("");
      setSaved(true);
      return;
    }

    if (result.status === "full") {
      setProblem(
        "The Magical Record is full. Delete an entry there before saving this working.",
      );
      return;
    }

    if (result.status === "invalid") {
      setProblem("The working could not be saved. Check the fields and try again.");
      focusField("intention");
      return;
    }

    setProblem(
      "The working could not be saved. Browser storage may be unavailable or full.",
    );
  }

  function clearWorking() {
    setDraft(emptyWorking());
    setErrors({});
    setProblem("");
    setSaved(false);
    titleRef.current?.focus();
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <Link to={PATHS.chaos} className={styles.backLink}>
          <span aria-hidden="true">←</span> Toolkit
        </Link>
        <p className="eyebrow">Tool 07 · Working</p>
        <h1 className={`display-title ${styles.title}`}>Compose a working.</h1>
        <p className="lede">
          A working is a deliberate action with an opening, a middle, and a close. Write
          the sequence down, keep it within what you can stop safely, and save it to the
          Magical Record. This composer does not teach a ritual.
        </p>
      </header>

      <div className={styles.workspace}>
        <section
          className={`panel ${styles.formPanel}`}
          aria-labelledby="working-form-title"
        >
          <h2 id="working-form-title" className={styles.panelTitle}>
            The sequence
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className="field-label" htmlFor="working-title">
                  Title
                </label>
                <input
                  id="working-title"
                  className="text-input"
                  ref={titleRef}
                  value={draft.title}
                  maxLength={WORKING_TITLE_MAX}
                  onChange={(event) => updateField("title", event.target.value)}
                  aria-invalid={Boolean(errors.title) || undefined}
                  aria-describedby={errors.title ? "working-title-error" : undefined}
                  placeholder="A working for the next step"
                  autoComplete="off"
                />
                {errors.title && (
                  <p id="working-title-error" className={styles.fieldError}>
                    {errors.title}
                  </p>
                )}
              </div>

              <div className={styles.field}>
                <label className="field-label" htmlFor="working-date">
                  Date
                </label>
                <input
                  id="working-date"
                  type="date"
                  className="text-input"
                  ref={dateRef}
                  value={draft.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  aria-invalid={Boolean(errors.date) || undefined}
                  aria-describedby={errors.date ? "working-date-error" : undefined}
                />
                {errors.date && (
                  <p id="working-date-error" className={styles.fieldError}>
                    {errors.date}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label className="field-label" htmlFor="working-intention">
                Intention
              </label>
              <textarea
                id="working-intention"
                className={`text-area ${styles.shortInput}`}
                ref={intentionRef}
                value={draft.intention}
                maxLength={WORKING_INTENTION_MAX}
                onChange={(event) => updateField("intention", event.target.value)}
                aria-invalid={Boolean(errors.intention) || undefined}
                aria-describedby={
                  errors.intention
                    ? "working-intention-hint working-intention-error"
                    : "working-intention-hint"
                }
                placeholder="What is this working for?"
              />
              <p id="working-intention-hint" className={styles.fieldHint}>
                Keep it specific enough to notice what happens.
              </p>
              {errors.intention && (
                <p id="working-intention-error" className={styles.fieldError}>
                  {errors.intention}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className="field-label" htmlFor="working-preparation">
                Preparation <span className={styles.optional}>optional</span>
              </label>
              <textarea
                id="working-preparation"
                className={`text-area ${styles.shortInput}`}
                ref={preparationRef}
                value={draft.preparation}
                maxLength={WORKING_PREPARATION_MAX}
                onChange={(event) => updateField("preparation", event.target.value)}
                aria-invalid={Boolean(errors.preparation) || undefined}
                aria-describedby={
                  errors.preparation
                    ? "working-preparation-hint working-preparation-error"
                    : "working-preparation-hint"
                }
                placeholder="What needs to be ready before you begin?"
              />
              <p id="working-preparation-hint" className={styles.fieldHint}>
                Optional. Keep this to ordinary, safe preparation.
              </p>
              {errors.preparation && (
                <p id="working-preparation-error" className={styles.fieldError}>
                  {errors.preparation}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className="field-label" htmlFor="working-action">
                Action
              </label>
              <textarea
                id="working-action"
                className={`text-area ${styles.actionInput}`}
                ref={actionRef}
                value={draft.action}
                maxLength={WORKING_ACTION_MAX}
                onChange={(event) => updateField("action", event.target.value)}
                aria-invalid={Boolean(errors.action) || undefined}
                aria-describedby={
                  errors.action
                    ? "working-action-hint working-action-error"
                    : "working-action-hint"
                }
                placeholder="What will you actually do?"
              />
              <p id="working-action-hint" className={styles.fieldHint}>
                Use a form you can stop safely at any point.
              </p>
              {errors.action && (
                <p id="working-action-error" className={styles.fieldError}>
                  {errors.action}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className="field-label" htmlFor="working-closing">
                Closing
              </label>
              <textarea
                id="working-closing"
                className={`text-area ${styles.shortInput}`}
                ref={closingRef}
                value={draft.closing}
                maxLength={WORKING_CLOSING_MAX}
                onChange={(event) => updateField("closing", event.target.value)}
                aria-invalid={Boolean(errors.closing) || undefined}
                aria-describedby={
                  errors.closing
                    ? "working-closing-hint working-closing-error"
                    : "working-closing-hint"
                }
                placeholder="How will you end and return to ordinary attention?"
              />
              <p id="working-closing-hint" className={styles.fieldHint}>
                Use a closing you already know. The point is to end deliberately.
              </p>
              {errors.closing && (
                <p id="working-closing-error" className={styles.fieldError}>
                  {errors.closing}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className="field-label" htmlFor="working-reflection">
                Reflection <span className={styles.optional}>optional</span>
              </label>
              <textarea
                id="working-reflection"
                className={`text-area ${styles.shortInput}`}
                ref={reflectionRef}
                value={draft.reflection}
                maxLength={WORKING_REFLECTION_MAX}
                onChange={(event) => updateField("reflection", event.target.value)}
                aria-invalid={Boolean(errors.reflection) || undefined}
                aria-describedby={
                  errors.reflection
                    ? "working-reflection-hint working-reflection-error"
                    : "working-reflection-hint"
                }
                placeholder="What happened? Leave this blank if you will reflect later."
              />
              <p id="working-reflection-hint" className={styles.fieldHint}>
                Optional. You can add a later note in the Magical Record.
              </p>
              {errors.reflection && (
                <p id="working-reflection-error" className={styles.fieldError}>
                  {errors.reflection}
                </p>
              )}
            </div>

            <div className={styles.actions}>
              <button type="submit" className="button button--primary" disabled={saved}>
                {saved ? "Saved to record" : "Save to Magical Record"}
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={clearWorking}
              >
                Clear
              </button>
            </div>

            {problem && (
              <p className={styles.error} role="alert">
                {problem}
              </p>
            )}
          </form>
        </section>

        <section
          className={`panel ${styles.previewPanel}`}
          aria-labelledby="working-preview-title"
        >
          <p className="eyebrow">Preview</p>
          <h2 id="working-preview-title" className={styles.previewTitle}>
            The working
          </h2>

          {saved && (
            <div className={styles.saved} role="status">
              <p className="eyebrow">Saved</p>
              <h3 className={styles.savedTitle} ref={savedHeadingRef} tabIndex={-1}>
                In the Magical Record.
              </h3>
              <p className={styles.savedText}>
                The working is now a local record entry. Open the record to add a later
                note or to review it.
              </p>
              <Link to={PATHS.chaosRecord} className="button button--small">
                Open the record
              </Link>
            </div>
          )}

          {hasPreview ? (
            <>
              <h3 className={styles.previewBelief}>
                {preview.title || "Untitled working"}
              </h3>
              <p className={styles.previewDate}>
                {isValidDateInput(preview.date)
                  ? formatDate(preview.date)
                  : "No date yet"}
              </p>

              <dl className={styles.previewList}>
                {preview.intention && (
                  <div>
                    <dt>Intention</dt>
                    <dd>{preview.intention}</dd>
                  </div>
                )}
                {preview.preparation && (
                  <div>
                    <dt>Preparation</dt>
                    <dd>{preview.preparation}</dd>
                  </div>
                )}
                {preview.action && (
                  <div>
                    <dt>Action</dt>
                    <dd>{preview.action}</dd>
                  </div>
                )}
                {preview.closing && (
                  <div>
                    <dt>Closing</dt>
                    <dd>{preview.closing}</dd>
                  </div>
                )}
                {preview.reflection && (
                  <div>
                    <dt>Reflection</dt>
                    <dd>{preview.reflection}</dd>
                  </div>
                )}
              </dl>
            </>
          ) : (
            <div className={styles.empty}>
              <h3 className={styles.emptyTitle}>Nothing composed yet.</h3>
              <p className={styles.emptyText}>
                The sequence appears here as you write it. Nothing is saved until you
                choose Save to Magical Record.
              </p>
            </div>
          )}
        </section>
      </div>

      <p className={styles.note}>
        Nothing here is a guided exercise. Avoid breath-holding, hyperventilation, sleep
        deprivation, fasting, pain, or anything that could harm you or someone else. Stop
        whenever you choose. This is not medical, legal, financial, or relationship
        advice.
      </p>
    </div>
  );
}
