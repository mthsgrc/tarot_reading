import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../app/paths";
import { SigilGlyph } from "../../components/SigilGlyph";
import {
  SIGIL_STATEMENT_MAX,
  buildSigil,
  normalizeSigilStatement,
  sigilSvgMarkup,
  type Sigil,
} from "../../domain/chaos/sigil";
import styles from "./SigilPage.module.css";

export function SigilPage() {
  const [statement, setStatement] = useState("");
  const [sigil, setSigil] = useState<Sigil | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState("");
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const statementRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (sigil) {
      resultHeadingRef.current?.focus();
    }
  }, [sigil]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = buildSigil(statement);

    if (!next) {
      setSigil(null);
      setError(
        "Use a statement with at least two consonants after vowels and repeats are removed.",
      );
      return;
    }

    setError(null);
    setDownloadStatus("");
    setSigil(next);
  }

  function handleDownload() {
    if (!sigil || typeof URL.createObjectURL !== "function") {
      return;
    }

    const blob = new Blob([sigilSvgMarkup(sigil)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `sigil-${sigil.letters.toLowerCase()}.svg`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setDownloadStatus("SVG prepared for download.");
  }

  function reset() {
    setStatement("");
    setSigil(null);
    setError(null);
    setDownloadStatus("");
    statementRef.current?.focus();
  }

  const normalized = normalizeSigilStatement(statement);

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <Link to={PATHS.chaos} className={styles.backLink}>
          <span aria-hidden="true">←</span> Toolkit
        </Link>
        <p className="eyebrow">Tool 01 · Sigil</p>
        <h1 className={`display-title ${styles.title}`}>Forge a sigil.</h1>
        <p className="lede">
          Write a present-tense statement. The forge removes vowels and repeated letters,
          then draws the surviving charge as a glyph. The same statement always produces
          the same shape.
        </p>
      </header>

      <div className={styles.workspace}>
        <section
          className={`panel ${styles.formPanel}`}
          aria-labelledby="sigil-form-title"
        >
          <h2 id="sigil-form-title" className={styles.panelTitle}>
            The statement
          </h2>
          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="sigil-statement">
              What are you encoding?
            </label>
            <textarea
              id="sigil-statement"
              className="text-area"
              ref={statementRef}
              value={statement}
              maxLength={SIGIL_STATEMENT_MAX}
              onChange={(event) => setStatement(event.target.value)}
              aria-describedby="sigil-hint"
              placeholder="I will finish the work that matters."
            />
            <p id="sigil-hint" className={styles.hint}>
              Present tense, positive, and specific. Vowels and repeated consonants are
              removed. Punctuation stays out of the glyph.
            </p>
            <div className={styles.formFooter}>
              <span className={styles.count} aria-hidden="true">
                {statement.length}/{SIGIL_STATEMENT_MAX}
              </span>
              <button
                type="submit"
                className="button button--primary"
                disabled={!normalized}
              >
                Forge sigil
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
          aria-labelledby="sigil-result-title"
        >
          {sigil ? (
            <>
              <h2
                id="sigil-result-title"
                className={styles.resultTitle}
                ref={resultHeadingRef}
                tabIndex={-1}
              >
                Your sigil
              </h2>
              <p className={styles.statement}>“{sigil.statement}”</p>
              <div className={styles.glyphWrap}>
                <SigilGlyph paths={sigil.paths} label={`Sigil for ${sigil.statement}`} />
              </div>
              <p className="eyebrow">Charge letters</p>
              <p className={styles.letters}>{sigil.letters.split("").join(" ")}</p>
              <div className={styles.actions}>
                <button type="button" className="button" onClick={handleDownload}>
                  Download SVG
                </button>
                <button type="button" className="button button--ghost" onClick={reset}>
                  Start another
                </button>
              </div>
              <p className={styles.status} role="status">
                {downloadStatus}
              </p>
            </>
          ) : (
            <div className={styles.empty}>
              <p className="eyebrow">Waiting for a statement</p>
              <h2 id="sigil-result-title" className={styles.resultTitle}>
                Nothing drawn yet.
              </h2>
              <p className={styles.emptyText}>
                The glyph appears here after you forge it. Keep the statement where you
                can see it while you work, or put it away once the sigil is made.
              </p>
            </div>
          )}
        </section>
      </div>

      <p className={styles.note}>
        A sigil is a creative focus object, not a prediction or a promise. Nothing here is
        uploaded or sent anywhere. If the statement is private, keep the downloaded file
        private too.
      </p>
    </div>
  );
}
