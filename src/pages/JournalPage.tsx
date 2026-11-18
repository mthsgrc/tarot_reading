import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { DEPTH_LABELS, LENS_LABELS } from "../domain/reading/language";
import { readSharedReading } from "../domain/reading/share";
import {
  JOURNAL_STORAGE_KEY,
  clearJournal,
  deleteJournalEntry,
  loadJournal,
} from "../lib/journalStorage";
import styles from "./JournalPage.module.css";

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

type PendingFocus = { kind: "entry"; index: number } | { kind: "empty" } | null;

export function JournalPage() {
  const [entries, setEntries] = useState(loadJournal);
  const [confirmClear, setConfirmClear] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const emptyHeadingRef = useRef<HTMLHeadingElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<PendingFocus>(null);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== null && event.key !== JOURNAL_STORAGE_KEY) {
        return;
      }

      setEntries(loadJournal());
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Wait for the list to re-render before moving focus, so the target exists
  // and a deleted entry cannot strand focus on the document body.
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

    const links =
      listRef.current?.querySelectorAll<HTMLAnchorElement>("[data-journal-open]");
    links?.[target.index]?.focus();
  }, [entries]);

  function handleDelete(id: string) {
    const index = entries.findIndex((entry) => entry.id === id);
    const remaining = deleteJournalEntry(id);
    if (!remaining) {
      setStorageError(true);
      return;
    }

    pendingFocus.current =
      remaining.length === 0
        ? { kind: "empty" }
        : { kind: "entry", index: Math.min(index, remaining.length - 1) };

    setEntries(remaining);
    setStorageError(false);
    setConfirmClear(false);
  }

  function handleClear() {
    if (!clearJournal()) {
      setStorageError(true);
      return;
    }

    pendingFocus.current = { kind: "empty" };
    setEntries([]);
    setConfirmClear(false);
    setStorageError(false);
  }

  function handleCancelClear() {
    setConfirmClear(false);
    clearButtonRef.current?.focus();
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className="eyebrow">Your journal</p>
        <h1 className={`display-title ${styles.title}`}>Readings you kept</h1>
        <p className="lede">
          Saved readings stay in this browser. Nothing is uploaded and no account is
          needed. Open one to return to the same cards, question, and interpretation.
        </p>
      </header>

      {entries.length === 0 ? (
        <section className={`panel ${styles.empty}`} aria-labelledby="journal-empty">
          <p className="eyebrow">The journal is empty</p>
          <h2
            id="journal-empty"
            className={styles.emptyTitle}
            ref={emptyHeadingRef}
            tabIndex={-1}
          >
            Nothing kept yet.
          </h2>
          <p className={styles.emptyText}>
            Draw a reading, reveal every card, then choose “Save to journal” in the
            synthesis panel. Your saved readings will collect here.
          </p>
          <Link to="/" className="button button--primary">
            Draw a reading
          </Link>
        </section>
      ) : (
        <>
          <div className={styles.toolbar}>
            <p className={styles.count} role="status" aria-live="polite">
              {entries.length} saved {entries.length === 1 ? "reading" : "readings"}
            </p>

            <div className={styles.clearArea}>
              <button
                type="button"
                className="button button--small button--ghost"
                aria-expanded={confirmClear}
                ref={clearButtonRef}
                onClick={() => setConfirmClear((open) => !open)}
              >
                Clear journal
              </button>

              {confirmClear && (
                <div
                  className={styles.confirm}
                  role="group"
                  aria-label="Confirm clearing the journal"
                >
                  <span>Clear every saved reading?</span>
                  <button
                    type="button"
                    className="button button--small"
                    onClick={handleClear}
                  >
                    Yes, clear all
                  </button>
                  <button
                    type="button"
                    className="button button--small button--ghost"
                    onClick={handleCancelClear}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {storageError && (
            <p className={styles.error} role="status">
              The journal could not be updated. Browser storage may be unavailable or
              full.
            </p>
          )}

          <ul className={styles.list} ref={listRef}>
            {entries.map((entry) => {
              const reading = readSharedReading(new URLSearchParams(entry.params));
              if (!reading) {
                return null;
              }

              const savedAt = DATE_FORMAT.format(new Date(entry.savedAt));
              const question = reading.question.trim();

              return (
                <li key={entry.id} className={`panel ${styles.entry}`}>
                  <div className={styles.entryHead}>
                    <div>
                      <p className="eyebrow">{reading.spread.name}</p>
                      <h2 className={styles.entryTitle}>
                        {question || "No question held"}
                      </h2>
                    </div>
                    <time className={styles.time} dateTime={entry.savedAt}>
                      {savedAt}
                    </time>
                  </div>

                  <ul className={styles.cardList}>
                    {reading.drawn.map(({ card, orientation }) => (
                      <li key={card.id}>
                        {card.name}
                        <span className={styles.cardMeta}>
                          {orientation === "shadow" ? "shadow" : "upright"}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className={styles.entryMeta}>
                    {reading.lens ? LENS_LABELS[reading.lens] : "Automatic lens"} ·{" "}
                    {DEPTH_LABELS[reading.depth]} depth
                  </p>

                  <div className={styles.actions}>
                    <Link
                      className="button button--small"
                      to={`/?${entry.params}&j=1`}
                      data-journal-open
                    >
                      Open reading
                    </Link>
                    <button
                      type="button"
                      className="button button--ghost button--small"
                      aria-label={`Delete the ${reading.spread.name} reading saved ${savedAt}`}
                      onClick={() => handleDelete(entry.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
