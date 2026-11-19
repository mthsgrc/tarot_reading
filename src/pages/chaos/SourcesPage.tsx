import { Link } from "react-router-dom";
import { CHAOS_TOOLS } from "../../app/chaosTools";
import { PATHS } from "../../app/paths";
import {
  CHAOS_CONTEXT_NOTES,
  CHAOS_FURTHER_READING,
  CHAOS_SAFETY_NOTES,
  CHAOS_SOURCE_LINKS,
  CHAOS_TOOL_CLAIMS,
} from "../../data/chaosSources";
import styles from "./SourcesPage.module.css";

export function SourcesPage() {
  const toolById = new Map(CHAOS_TOOLS.map((tool) => [tool.id, tool]));

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <Link to={PATHS.chaos} className={styles.backLink}>
          <span aria-hidden="true">←</span> Toolkit
        </Link>
        <p className="eyebrow">Tool 08 · Sources</p>
        <h1 className={`display-title ${styles.title}`}>Sources & context.</h1>
        <p className="lede">
          The history, the disputed claims, and the safety notes behind the toolkit. This
          page is a reference, not a practice. The app&apos;s copy is an original summary,
          not a quotation from the sources below.
        </p>
      </header>

      <section className={`panel ${styles.section}`} aria-labelledby="context-title">
        <p className="eyebrow">Context</p>
        <h2 id="context-title" className={styles.sectionTitle}>
          Context, not lineage.
        </h2>
        <p className={styles.sectionIntro}>
          Chaos magic is a modern current with several influences and no single
          authoritative story. These notes describe the framing this app uses; they do not
          settle historical or metaphysical disputes.
        </p>
        <div className={styles.cardGrid}>
          {CHAOS_CONTEXT_NOTES.map((note) => (
            <article key={note.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{note.title}</h3>
              <p className={styles.cardText}>{note.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`panel ${styles.section}`} aria-labelledby="claims-title">
        <p className="eyebrow">Tool claims</p>
        <h2 id="claims-title" className={styles.sectionTitle}>
          What each tool does, and does not do.
        </h2>
        <p className={styles.sectionIntro}>
          Each tool is a small, local object for attention and reflection. None of them
          proves an outcome, makes a belief true, or replaces professional advice.
        </p>
        <ul className={styles.toolList}>
          {CHAOS_TOOL_CLAIMS.map((claim) => {
            const tool = toolById.get(claim.id);
            if (!tool) {
              return null;
            }

            return (
              <li key={claim.id} className={styles.toolItem}>
                <h3 className={styles.toolTitle}>
                  <Link to={tool.path} className={styles.toolLink}>
                    {tool.title}
                  </Link>
                </h3>
                <dl className={styles.claimList}>
                  <div>
                    <dt>It does</dt>
                    <dd>{claim.does}</dd>
                  </div>
                  <div>
                    <dt>It does not</dt>
                    <dd>{claim.doesNot}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`panel ${styles.section}`} aria-labelledby="safety-title">
        <p className="eyebrow">Safety</p>
        <h2 id="safety-title" className={styles.sectionTitle}>
          Safety and scope.
        </h2>
        <p className={styles.sectionIntro}>
          These are the boundaries the app tries to keep. They matter more than any
          aesthetic or historical claim.
        </p>
        <div className={styles.cardGrid}>
          {CHAOS_SAFETY_NOTES.map((note) => (
            <article key={note.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{note.title}</h3>
              <p className={styles.cardText}>{note.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.referenceSection} aria-labelledby="sources-title">
        <div className={styles.referenceHead}>
          <p className="eyebrow">References</p>
          <h2 id="sources-title" className={styles.referenceTitle}>
            Sources
          </h2>
          <p className={styles.sectionIntro}>
            Starting points for the history and context, not endorsements of every claim.
            External links open in a new tab.
          </p>
        </div>
        <ul className={styles.sourceList}>
          {CHAOS_SOURCE_LINKS.map((source) => (
            <li key={source.href} className={styles.sourceItem}>
              <a
                className={styles.sourceLink}
                href={source.href}
                target="_blank"
                rel="noreferrer"
              >
                {source.title}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              <p className={styles.sourcePublisher}>{source.publisher}</p>
              <p className={styles.sourceNote}>{source.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.referenceSection} aria-labelledby="reading-title">
        <div className={styles.referenceHead}>
          <p className="eyebrow">Further reading</p>
          <h2 id="reading-title" className={styles.referenceTitle}>
            Books
          </h2>
          <p className={styles.sectionIntro}>
            Primary and practitioner texts. They are listed for context; the app does not
            reproduce their exercises or endorse their claims.
          </p>
        </div>
        <ul className={styles.readingList}>
          {CHAOS_FURTHER_READING.map((book) => (
            <li key={`${book.author}-${book.title}`} className={styles.readingItem}>
              <h3 className={styles.readingTitle}>{book.title}</h3>
              <p className={styles.readingMeta}>
                {book.author} · {book.year}
              </p>
              <p className={styles.readingNote}>{book.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className={styles.note}>
        This is an independent study project. It is not affiliated with the Ordo Templi
        Orientis, the Crowley estate, the Illuminates of Thanateros, or any publisher. The
        app makes no network calls at runtime; the links above are optional.
      </p>
    </div>
  );
}
