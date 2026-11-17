import { useState } from "react";
import { Link } from "react-router-dom";
import { readSharedReading } from "../domain/reading/share";
import { clearJournal, deleteJournalEntry, loadJournal } from "../lib/journalStorage";
import styles from "./JournalPage.module.css";

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function JournalPage() {
  const [entries, setEntries] = useState(loadJournal);
  const [confirmClear, setConfirmClear] = useState(false);
  const [storageError, setStorageError] = useState(false);

  function handleDelete(id: string) {
    const remaining = deleteJournalEntry(id);
    if (!remaining) {
      setStorageError(true);
      return;
    }

    setEntries(remaining);
    setStorageError(false);
    setConfirmClear(false);
  }

  function handleClear() {
    if (!clearJournal()) {
      setStorageError(true);
      return;
    }

    setEntries([]);
    setConfirmClear(false);
    setStorageError(false);
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
          <h2 id="journal-empty" className={styles.emptyTitle}>
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
                    onClick={() => setConfirmClear(false)}
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

          <ul className={styles.list}>
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

                  <div className={styles.actions}>
                    <Link className="button button--small" to={`/?${entry.params}&j=1`}>
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
