import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../app/paths";
import {
  RECORD_KINDS,
  RECORD_MAX_ENTRIES,
  RECORD_TEXT_MAX,
  RECORD_TITLE_MAX,
  hasRecordErrors,
  isRecordKind,
  normalizeRecordDraft,
  recordKindLabel,
  sortRecordEntries,
  validateRecordDraft,
  type RecordDraft,
  type RecordErrors,
  type RecordKind,
} from "../../domain/chaos/record";
import { localDateString } from "../../domain/chaos/date";
import {
  RECORD_STORAGE_KEY,
  addStoredRecord,
  deleteStoredRecord,
  loadRecordEntries,
} from "../../lib/recordStorage";
import styles from "./RecordPage.module.css";

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const FIELD_ORDER = ["title", "kind", "date", "practice", "result"] as const;

type Filter = "all" | RecordKind;
type PendingFocus =
  { kind: "entry"; id: string } | { kind: "empty" } | { kind: "filter-empty" } | null;

function emptyDraft(): RecordDraft {
  return {
    title: "",
    kind: "note",
    date: localDateString(),
    practice: "",
    result: "",
  };
}

function formatRecordDate(value: string): string {
  return DATE_FORMAT.format(new Date(`${value}T00:00:00`));
}

export function RecordPage() {
  const [entries, setEntries] = useState(loadRecordEntries);
  const [draft, setDraft] = useState<RecordDraft>(emptyDraft);
  const [errors, setErrors] = useState<RecordErrors>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [feedback, setFeedback] = useState("");
  const [problem, setProblem] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const pendingFocus = useRef<PendingFocus>(null);
  const emptyHeadingRef = useRef<HTMLHeadingElement>(null);
  const filterEmptyHeadingRef = useRef<HTMLHeadingElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const kindRef = useRef<HTMLSelectElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const practiceRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLTextAreaElement>(null);

  const ordered = sortRecordEntries(entries);
  const filtered = ordered.filter((entry) => filter === "all" || entry.kind === filter);
  const atCapacity = entries.length >= RECORD_MAX_ENTRIES;

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== null && event.key !== RECORD_STORAGE_KEY) {
        return;
      }

      setEntries(loadRecordEntries());
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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

    if (target.kind === "filter-empty") {
      filterEmptyHeadingRef.current?.focus();
      return;
    }

    document.getElementById(`record-title-${target.id}`)?.focus();
  }, [entries, filter]);

  function focusField(field: keyof RecordDraft) {
    switch (field) {
      case "title":
        titleRef.current?.focus();
        break;
      case "kind":
        kindRef.current?.focus();
        break;
      case "date":
        dateRef.current?.focus();
        break;
      case "practice":
        practiceRef.current?.focus();
        break;
      case "result":
        resultRef.current?.focus();
        break;
    }
  }

  function updateField<K extends keyof RecordDraft>(field: K, value: RecordDraft[K]) {
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
    setFeedback("");
    setProblem("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateRecordDraft(draft);

    if (hasRecordErrors(nextErrors)) {
      setErrors(nextErrors);
      setFeedback("");
      setProblem("");
      const firstError = FIELD_ORDER.find((field) => nextErrors[field]);
      if (firstError) {
        focusField(firstError);
      }
      return;
    }

    const result = addStoredRecord(normalizeRecordDraft(draft));

    if (result.status === "saved") {
      setEntries(result.entries);
      setDraft(emptyDraft());
      setErrors({});
      setFilter("all");
      setFeedback("Entry added to the record.");
      setProblem("");
      setConfirmDeleteId(null);
      pendingFocus.current = { kind: "entry", id: result.entry.id };
      return;
    }

    if (result.status === "full") {
      setProblem(
        `The record holds ${RECORD_MAX_ENTRIES} entries. Delete one before adding another.`,
      );
      return;
    }

    if (result.status === "invalid") {
      setProblem("The entry could not be created. Check the title, date, and practice.");
      focusField("title");
      return;
    }

    setProblem(
      "The entry could not be saved. Browser storage may be unavailable or full.",
    );
  }

  function handleDelete(id: string) {
    const index = filtered.findIndex((entry) => entry.id === id);
    const next = deleteStoredRecord(id);

    if (!next) {
      setProblem(
        "The entry could not be deleted. Browser storage may be unavailable or full.",
      );
      return;
    }

    const nextOrdered = sortRecordEntries(next);
    const nextFiltered = nextOrdered.filter(
      (entry) => filter === "all" || entry.kind === filter,
    );

    pendingFocus.current =
      nextOrdered.length === 0
        ? { kind: "empty" }
        : nextFiltered.length === 0
          ? { kind: "filter-empty" }
          : {
              kind: "entry",
              id: nextFiltered[Math.min(index, nextFiltered.length - 1)]!.id,
            };

    setEntries(next);
    setFeedback("Entry deleted.");
    setProblem("");
    setConfirmDeleteId(null);
  }

  function cancelDelete(id: string) {
    setConfirmDeleteId(null);
    document.getElementById(`record-delete-${id}`)?.focus();
  }

  function changeFilter(value: string) {
    setFilter(value === "all" || isRecordKind(value) ? value : "all");
    setConfirmDeleteId(null);
    setFeedback("");
    setProblem("");
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <Link to={PATHS.chaos} className={styles.backLink}>
          <span aria-hidden="true">←</span> Toolkit
        </Link>
        <p className="eyebrow">Tool 06 · Record</p>
        <h1 className={`display-title ${styles.title}`}>Record the working.</h1>
        <p className="lede">
          The magical record turns experiments into something you can revisit. Write what
          you did and what changed without deciding in advance what it means. This is the
          shared local log the Working Composer uses.
        </p>
      </header>

      <section
        className={`panel ${styles.formPanel}`}
        aria-labelledby="record-form-title"
      >
        <h2 id="record-form-title" className={styles.panelTitle}>
          Add an entry
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.titleField}`}>
              <label className="field-label" htmlFor="record-title">
                Title
              </label>
              <input
                id="record-title"
                className="text-input"
                ref={titleRef}
                value={draft.title}
                maxLength={RECORD_TITLE_MAX}
                onChange={(event) => updateField("title", event.target.value)}
                aria-invalid={Boolean(errors.title) || undefined}
                aria-describedby={errors.title ? "record-title-error" : undefined}
                placeholder="A sigil for the next step"
                autoComplete="off"
              />
              {errors.title && (
                <p id="record-title-error" className={styles.fieldError}>
                  {errors.title}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className="field-label" htmlFor="record-kind">
                Kind
              </label>
              <select
                id="record-kind"
                className={styles.select}
                ref={kindRef}
                value={draft.kind}
                onChange={(event) => {
                  const value = event.target.value;
                  if (isRecordKind(value)) {
                    updateField("kind", value);
                  }
                }}
                aria-invalid={Boolean(errors.kind) || undefined}
                aria-describedby={errors.kind ? "record-kind-error" : undefined}
              >
                {RECORD_KINDS.map((kind) => (
                  <option key={kind.id} value={kind.id}>
                    {kind.label}
                  </option>
                ))}
              </select>
              {errors.kind && (
                <p id="record-kind-error" className={styles.fieldError}>
                  {errors.kind}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className="field-label" htmlFor="record-date">
                Date
              </label>
              <input
                id="record-date"
                type="date"
                className="text-input"
                ref={dateRef}
                value={draft.date}
                onChange={(event) => updateField("date", event.target.value)}
                aria-invalid={Boolean(errors.date) || undefined}
                aria-describedby={errors.date ? "record-date-error" : undefined}
              />
              {errors.date && (
                <p id="record-date-error" className={styles.fieldError}>
                  {errors.date}
                </p>
              )}
            </div>
          </div>

          <div className={styles.textAreas}>
            <div className={styles.field}>
              <label className="field-label" htmlFor="record-practice">
                What you did
              </label>
              <textarea
                id="record-practice"
                className={`text-area ${styles.textArea}`}
                ref={practiceRef}
                value={draft.practice}
                maxLength={RECORD_TEXT_MAX}
                onChange={(event) => updateField("practice", event.target.value)}
                aria-invalid={Boolean(errors.practice) || undefined}
                aria-describedby={
                  errors.practice
                    ? "record-practice-hint record-practice-error"
                    : "record-practice-hint"
                }
                placeholder="What did you actually do?"
              />
              <p id="record-practice-hint" className={styles.fieldHint}>
                Describe the action before interpreting it.
              </p>
              {errors.practice && (
                <p id="record-practice-error" className={styles.fieldError}>
                  {errors.practice}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className="field-label" htmlFor="record-result">
                What changed <span className={styles.optional}>optional</span>
              </label>
              <textarea
                id="record-result"
                className={`text-area ${styles.textArea}`}
                ref={resultRef}
                value={draft.result}
                maxLength={RECORD_TEXT_MAX}
                onChange={(event) => updateField("result", event.target.value)}
                aria-invalid={Boolean(errors.result) || undefined}
                aria-describedby={
                  errors.result
                    ? "record-result-hint record-result-error"
                    : "record-result-hint"
                }
                placeholder="What did you notice afterwards?"
              />
              <p id="record-result-hint" className={styles.fieldHint}>
                Leave this blank if nothing is clear yet.
              </p>
              {errors.result && (
                <p id="record-result-error" className={styles.fieldError}>
                  {errors.result}
                </p>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className="button button--primary"
              disabled={atCapacity}
              aria-describedby={atCapacity ? "record-capacity" : undefined}
            >
              Add to record
            </button>
          </div>

          {atCapacity && (
            <p id="record-capacity" className={styles.capacity}>
              The record is full at {RECORD_MAX_ENTRIES} entries. Delete one before adding
              another.
            </p>
          )}
        </form>
      </section>

      <section className={`panel ${styles.logPanel}`} aria-labelledby="record-list-title">
        <div className={styles.logHead}>
          <div>
            <p className="eyebrow">Your record</p>
            <h2 id="record-list-title" className={styles.logTitle}>
              Entries
            </h2>
            <p className={styles.count}>
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
              {filter !== "all" && ` · ${filtered.length} shown`}
            </p>
          </div>

          <div className={styles.filterArea}>
            <label className="field-label" htmlFor="record-filter">
              Filter by kind
            </label>
            <select
              id="record-filter"
              className={styles.select}
              value={filter}
              onChange={(event) => changeFilter(event.target.value)}
            >
              <option value="all">All kinds</option>
              {RECORD_KINDS.map((kind) => (
                <option key={kind.id} value={kind.id}>
                  {kind.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className={styles.feedback} role="status" aria-live="polite">
          {feedback}
        </p>
        {problem && (
          <p className={styles.error} role="alert">
            {problem}
          </p>
        )}

        {entries.length === 0 ? (
          <div className={styles.empty}>
            <p className="eyebrow">Nothing here</p>
            <h3 className={styles.emptyTitle} ref={emptyHeadingRef} tabIndex={-1}>
              Nothing recorded yet.
            </h3>
            <p className={styles.emptyText}>
              Add one working or observation. The entry appears here and stays in this
              browser until you delete it.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <p className="eyebrow">No matches</p>
            <h3 className={styles.emptyTitle} ref={filterEmptyHeadingRef} tabIndex={-1}>
              No entries with this kind.
            </h3>
            <p className={styles.emptyText}>
              Choose another kind, or show the whole record.
            </p>
            <button
              type="button"
              className="button button--small"
              onClick={() => changeFilter("all")}
            >
              Show all entries
            </button>
          </div>
        ) : (
          <ul className={styles.list}>
            {filtered.map((entry) => (
              <li key={entry.id}>
                <article
                  className={styles.entry}
                  aria-labelledby={`record-title-${entry.id}`}
                >
                  <div className={styles.entryHead}>
                    <span className={styles.kind}>{recordKindLabel(entry.kind)}</span>
                    <time className={styles.entryDate} dateTime={entry.date}>
                      {formatRecordDate(entry.date)}
                    </time>
                  </div>

                  <h3
                    id={`record-title-${entry.id}`}
                    className={styles.entryTitle}
                    tabIndex={-1}
                  >
                    {entry.title}
                  </h3>

                  <dl className={styles.entryBody}>
                    <div>
                      <dt>What you did</dt>
                      <dd>{entry.practice}</dd>
                    </div>
                    {entry.result && (
                      <div>
                        <dt>What changed</dt>
                        <dd>{entry.result}</dd>
                      </div>
                    )}
                  </dl>

                  <div className={styles.entryActions}>
                    <button
                      type="button"
                      id={`record-delete-${entry.id}`}
                      className="button button--small button--ghost"
                      aria-label={`Delete ${entry.title}`}
                      aria-expanded={confirmDeleteId === entry.id}
                      onClick={() =>
                        setConfirmDeleteId((current) =>
                          current === entry.id ? null : entry.id,
                        )
                      }
                    >
                      Delete
                    </button>
                  </div>

                  {confirmDeleteId === entry.id && (
                    <div
                      id={`record-confirm-${entry.id}`}
                      className={styles.confirm}
                      role="group"
                      aria-label={`Confirm deleting ${entry.title}`}
                    >
                      <span>Delete this entry permanently?</span>
                      <button
                        type="button"
                        className="button button--small"
                        onClick={() => handleDelete(entry.id)}
                      >
                        Yes, delete
                      </button>
                      <button
                        type="button"
                        className="button button--small button--ghost"
                        onClick={() => cancelDelete(entry.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className={styles.note}>
        A record is a reflective tool, not proof of causation. It stays in this browser;
        nothing is uploaded. Do not use it to replace medical, legal, financial, or
        relationship advice.
      </p>
    </div>
  );
}
