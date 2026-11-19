import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../app/paths";
import { localDateString } from "../../domain/chaos/date";
import {
  SERVITOR_MAX_RECORDS,
  SERVITOR_NAME_MAX,
  SERVITOR_FORM_MAX,
  SERVITOR_TASK_MAX,
  hasServitorErrors,
  isReviewDue,
  normalizeServitorDraft,
  validateServitorDraft,
  type Servitor,
  type ServitorDraft,
  type ServitorErrors,
} from "../../domain/chaos/servitor";
import {
  SERVITOR_STORAGE_KEY,
  createStoredServitor,
  deleteStoredServitor,
  loadServitors,
  restoreStoredServitor,
  retireStoredServitor,
} from "../../lib/servitorStorage";
import styles from "./ServitorsPage.module.css";

const EMPTY_DRAFT: ServitorDraft = {
  name: "",
  task: "",
  form: "",
  reviewOn: "",
};

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const FIELD_ORDER = ["name", "task", "form", "reviewOn"] as const;

type PendingFocus = { kind: "servitor"; id: string } | { kind: "empty" } | null;

function formatTimestamp(value: string): string {
  return DATE_FORMAT.format(new Date(value));
}

function formatReviewDate(value: string): string {
  return DATE_FORMAT.format(new Date(`${value}T00:00:00`));
}

export function ServitorsPage() {
  const [servitors, setServitors] = useState(loadServitors);
  const [draft, setDraft] = useState<ServitorDraft>({ ...EMPTY_DRAFT });
  const [errors, setErrors] = useState<ServitorErrors>({});
  const [feedback, setFeedback] = useState("");
  const [problem, setProblem] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const pendingFocus = useRef<PendingFocus>(null);
  const emptyHeadingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const taskRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLInputElement>(null);
  const reviewRef = useRef<HTMLInputElement>(null);
  const today = localDateString();
  const atCapacity = servitors.length >= SERVITOR_MAX_RECORDS;

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== null && event.key !== SERVITOR_STORAGE_KEY) {
        return;
      }

      setServitors(loadServitors());
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Wait for the list to update before focusing a new or adjacent record.
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) {
      return;
    }

    pendingFocus.current = null;

    if (target.kind === "empty") {
      emptyHeadingRef.current?.focus();
      return;
    }

    document.getElementById(`servitor-title-${target.id}`)?.focus();
  }, [servitors]);

  function focusField(field: keyof ServitorDraft) {
    switch (field) {
      case "name":
        nameRef.current?.focus();
        break;
      case "task":
        taskRef.current?.focus();
        break;
      case "form":
        formRef.current?.focus();
        break;
      case "reviewOn":
        reviewRef.current?.focus();
        break;
    }
  }

  function updateField(field: keyof ServitorDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFeedback("");
    setProblem("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateServitorDraft(draft);

    if (hasServitorErrors(nextErrors)) {
      setErrors(nextErrors);
      setFeedback("");
      setProblem("");
      const firstError = FIELD_ORDER.find((field) => nextErrors[field]);
      if (firstError) {
        focusField(firstError);
      }
      return;
    }

    const result = createStoredServitor(normalizeServitorDraft(draft));

    if (result.status === "saved") {
      setServitors(result.servitors);
      setDraft({ ...EMPTY_DRAFT });
      setErrors({});
      setFeedback("Servitor created.");
      setProblem("");
      setConfirmDeleteId(null);
      const newId = result.servitors[0]?.id;
      pendingFocus.current = newId ? { kind: "servitor", id: newId } : null;
      return;
    }

    if (result.status === "full") {
      setProblem(
        `This workshop holds ${SERVITOR_MAX_RECORDS} records. Delete one before creating another.`,
      );
      return;
    }

    if (result.status === "invalid") {
      setProblem("The servitor could not be created. Check the name and task.");
      focusField("name");
      return;
    }

    setProblem(
      "The servitor could not be saved. Browser storage may be unavailable or full.",
    );
  }

  function handleRetire(id: string) {
    const next = retireStoredServitor(id);

    if (!next) {
      setProblem(
        "The record could not be updated. Browser storage may be unavailable or full.",
      );
      return;
    }

    setServitors(next);
    setFeedback("Servitor retired.");
    setProblem("");
    setConfirmDeleteId(null);
  }

  function handleRestore(id: string) {
    const next = restoreStoredServitor(id);

    if (!next) {
      setProblem(
        "The record could not be updated. Browser storage may be unavailable or full.",
      );
      return;
    }

    setServitors(next);
    setFeedback("Servitor restored.");
    setProblem("");
    setConfirmDeleteId(null);
  }

  function handleDelete(id: string) {
    const index = servitors.findIndex((servitor) => servitor.id === id);
    const next = deleteStoredServitor(id);

    if (!next) {
      setProblem(
        "The record could not be deleted. Browser storage may be unavailable or full.",
      );
      return;
    }

    pendingFocus.current =
      next.length === 0
        ? { kind: "empty" }
        : { kind: "servitor", id: next[Math.min(index, next.length - 1)]!.id };

    setServitors(next);
    setFeedback("Servitor deleted.");
    setProblem("");
    setConfirmDeleteId(null);
  }

  function cancelDelete(id: string) {
    setConfirmDeleteId(null);
    document.getElementById(`servitor-delete-${id}`)?.focus();
  }

  function recordStatus(servitor: Servitor): "active" | "due" | "retired" {
    if (servitor.retiredAt) {
      return "retired";
    }

    return isReviewDue(servitor.reviewOn, today) ? "due" : "active";
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <Link to={PATHS.chaos} className={styles.backLink}>
          <span aria-hidden="true">←</span> Toolkit
        </Link>
        <p className="eyebrow">Tool 04 · Servitor</p>
        <h1 className={`display-title ${styles.title}`}>Give an intention a name.</h1>
        <p className="lede">
          A servitor is a named intention or attention device. Treat it as a creative
          fiction you can revise, not an external authority. Group egregores are outside
          this local workshop; these records are personal.
        </p>
      </header>

      <div className={styles.workspace}>
        <section
          className={`panel ${styles.formPanel}`}
          aria-labelledby="servitor-form-title"
        >
          <h2 id="servitor-form-title" className={styles.panelTitle}>
            Create a servitor
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label className="field-label" htmlFor="servitor-name">
                Name
              </label>
              <input
                id="servitor-name"
                className="text-input"
                ref={nameRef}
                value={draft.name}
                maxLength={SERVITOR_NAME_MAX}
                onChange={(event) => updateField("name", event.target.value)}
                aria-invalid={Boolean(errors.name) || undefined}
                aria-describedby={errors.name ? "servitor-name-error" : undefined}
                placeholder="The Doorkeeper"
                autoComplete="off"
              />
              {errors.name && (
                <p id="servitor-name-error" className={styles.fieldError}>
                  {errors.name}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className="field-label" htmlFor="servitor-task">
                Task
              </label>
              <textarea
                id="servitor-task"
                className={`text-area ${styles.taskInput}`}
                ref={taskRef}
                value={draft.task}
                maxLength={SERVITOR_TASK_MAX}
                onChange={(event) => updateField("task", event.target.value)}
                aria-invalid={Boolean(errors.task) || undefined}
                aria-describedby={
                  errors.task
                    ? "servitor-task-hint servitor-task-error"
                    : "servitor-task-hint"
                }
                placeholder="I notice the next small step and take it."
              />
              <p id="servitor-task-hint" className={styles.fieldHint}>
                One task, stated plainly. The record is a reminder, not a promise.
              </p>
              {errors.task && (
                <p id="servitor-task-error" className={styles.fieldError}>
                  {errors.task}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className="field-label" htmlFor="servitor-form">
                Form <span className={styles.optional}>optional</span>
              </label>
              <input
                id="servitor-form"
                className="text-input"
                ref={formRef}
                value={draft.form}
                maxLength={SERVITOR_FORM_MAX}
                onChange={(event) => updateField("form", event.target.value)}
                aria-invalid={Boolean(errors.form) || undefined}
                aria-describedby={
                  errors.form
                    ? "servitor-form-hint servitor-form-error"
                    : "servitor-form-hint"
                }
                placeholder="A brass key with no lock."
                autoComplete="off"
              />
              <p id="servitor-form-hint" className={styles.fieldHint}>
                A short image you can picture when you check in.
              </p>
              {errors.form && (
                <p id="servitor-form-error" className={styles.fieldError}>
                  {errors.form}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className="field-label" htmlFor="servitor-review">
                Review on <span className={styles.optional}>optional</span>
              </label>
              <input
                id="servitor-review"
                type="date"
                className="text-input"
                ref={reviewRef}
                value={draft.reviewOn}
                onChange={(event) => updateField("reviewOn", event.target.value)}
                aria-invalid={Boolean(errors.reviewOn) || undefined}
                aria-describedby={
                  errors.reviewOn
                    ? "servitor-review-hint servitor-review-error"
                    : "servitor-review-hint"
                }
              />
              <p id="servitor-review-hint" className={styles.fieldHint}>
                A due record is only a reminder to check in.
              </p>
              {errors.reviewOn && (
                <p id="servitor-review-error" className={styles.fieldError}>
                  {errors.reviewOn}
                </p>
              )}
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className="button button--primary"
                disabled={atCapacity}
                aria-describedby={atCapacity ? "servitor-capacity" : undefined}
              >
                Create servitor
              </button>
            </div>

            {atCapacity && (
              <p id="servitor-capacity" className={styles.capacity}>
                The workshop is full. Delete a record before creating another.
              </p>
            )}

            <p className={styles.feedback} role="status" aria-live="polite">
              {feedback}
            </p>
            {problem && (
              <p className={styles.error} role="alert">
                {problem}
              </p>
            )}
          </form>
        </section>

        <section
          className={`panel ${styles.listPanel}`}
          aria-labelledby="servitor-list-title"
        >
          {servitors.length === 0 ? (
            <div className={styles.empty}>
              <p className="eyebrow">Your records</p>
              <h2
                id="servitor-list-title"
                className={styles.emptyTitle}
                ref={emptyHeadingRef}
                tabIndex={-1}
              >
                No servitors yet.
              </h2>
              <p className={styles.emptyText}>
                Name one intention and give it a form. The record appears here and stays
                in this browser until you retire or delete it.
              </p>
            </div>
          ) : (
            <>
              <div className={styles.listHead}>
                <div>
                  <p className="eyebrow">Your records</p>
                  <h2 id="servitor-list-title" className={styles.listTitle}>
                    Servitors
                  </h2>
                </div>
                <p className={styles.count}>
                  {servitors.filter((servitor) => !servitor.retiredAt).length} active ·{" "}
                  {servitors.filter((servitor) => servitor.retiredAt).length} retired
                </p>
              </div>

              <ul className={styles.records}>
                {servitors.map((servitor) => {
                  const status = recordStatus(servitor);
                  const statusLabel =
                    status === "retired"
                      ? "Retired"
                      : status === "due"
                        ? "Review due"
                        : "Active";

                  return (
                    <li key={servitor.id} className={styles.record}>
                      <div className={styles.recordHead}>
                        <div>
                          <p className={styles.recordKicker}>
                            {servitor.form || "No form given"}
                          </p>
                          <h3
                            id={`servitor-title-${servitor.id}`}
                            className={styles.recordTitle}
                            tabIndex={-1}
                          >
                            {servitor.name}
                          </h3>
                        </div>
                        <span className={`${styles.status} ${styles[status]}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <p className={styles.task}>{servitor.task}</p>

                      <p className={styles.meta}>
                        <span>Created {formatTimestamp(servitor.createdAt)}</span>
                        {servitor.reviewOn && (
                          <>
                            {" "}
                            ·{" "}
                            <span>
                              Review{" "}
                              <time dateTime={servitor.reviewOn}>
                                {formatReviewDate(servitor.reviewOn)}
                              </time>
                            </span>
                          </>
                        )}
                        {servitor.retiredAt && (
                          <>
                            {" "}
                            · <span>Retired {formatTimestamp(servitor.retiredAt)}</span>
                          </>
                        )}
                      </p>

                      <div className={styles.recordActions}>
                        {servitor.retiredAt ? (
                          <button
                            type="button"
                            className="button button--small"
                            aria-label={`Restore ${servitor.name}`}
                            onClick={() => handleRestore(servitor.id)}
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="button button--small"
                            aria-label={`Retire ${servitor.name}`}
                            onClick={() => handleRetire(servitor.id)}
                          >
                            Retire
                          </button>
                        )}
                        <button
                          type="button"
                          id={`servitor-delete-${servitor.id}`}
                          className="button button--small button--ghost"
                          aria-label={`Delete ${servitor.name}`}
                          aria-expanded={confirmDeleteId === servitor.id}
                          onClick={() =>
                            setConfirmDeleteId((current) =>
                              current === servitor.id ? null : servitor.id,
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>

                      {confirmDeleteId === servitor.id && (
                        <div
                          id={`servitor-confirm-${servitor.id}`}
                          className={styles.confirm}
                          role="group"
                          aria-label={`Confirm deleting ${servitor.name}`}
                        >
                          <span>Delete this record permanently?</span>
                          <button
                            type="button"
                            className="button button--small"
                            onClick={() => handleDelete(servitor.id)}
                          >
                            Yes, delete
                          </button>
                          <button
                            type="button"
                            className="button button--small button--ghost"
                            onClick={() => cancelDelete(servitor.id)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      </div>

      <p className={styles.note}>
        Nothing is uploaded. Retire a record when its task is done, or delete it when you
        no longer need it. If a practice starts to feel compulsive or distressing, stop
        and talk to someone you trust.
      </p>
    </div>
  );
}
