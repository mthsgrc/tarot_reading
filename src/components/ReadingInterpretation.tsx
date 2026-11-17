import { LENS_LABELS } from "../domain/reading/language";
import { ELEMENTS } from "../domain/reading/positions";
import type { ReadingInterpretation as ReadingInterpretationData } from "../domain/reading/types";
import { SEPHIRA_BY_ID } from "../domain/tree";
import styles from "./ReadingInterpretation.module.css";

interface ReadingInterpretationProps {
  interpretation: ReadingInterpretationData;
}

const LENS_SOURCES = {
  explicit: "chosen",
  inferred: "inferred from the question",
  default: "open",
} as const;

export function ReadingInterpretation({ interpretation }: ReadingInterpretationProps) {
  const { working } = interpretation;
  const elementLine = ELEMENTS.filter((element) => working.elements[element] > 0)
    .map((element) => `${element} ${working.elements[element]}`)
    .join(" · ");
  const sharedSephira = working.sephiraTouches[0];
  const repeatedNumbers = working.repeatedNumbers
    .map((group) => `${group.rank} (${group.cards.length})`)
    .join(" · ");

  return (
    <section className={`panel ${styles.section}`} aria-labelledby="interpretation-title">
      <header className={styles.head}>
        <p className="eyebrow">Interpretation</p>
        <h2 id="interpretation-title" className="section-title">
          The reading
        </h2>
        <p className={styles.headline}>{interpretation.headline}</p>
      </header>

      <div className={styles.overview}>
        {interpretation.overview.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section className={styles.block} aria-labelledby="notices-title">
        <h3 id="notices-title" className={styles.subhead}>
          What stands out
        </h3>
        <ul className={styles.notices}>
          {interpretation.notices.map((notice) => (
            <li key={notice.id} className={styles.notice}>
              <h4 className={styles.noticeTitle}>{notice.title}</h4>
              <p>{notice.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.block} aria-labelledby="positions-title">
        <h3 id="positions-title" className={styles.subhead}>
          The cards in their positions
        </h3>
        <ol className={styles.positions}>
          {interpretation.positions.map(({ drawn, body }) => (
            <li key={drawn.position.id} className={styles.position}>
              <div className={styles.positionHead}>
                <span className={styles.positionLabel}>{drawn.position.label}</span>
                <span className={styles.positionCard}>{drawn.card.name}</span>
                <span className={styles.orientation} data-orientation={drawn.orientation}>
                  {drawn.orientation === "shadow" ? "Shadow" : "Upright"}
                </span>
              </div>
              <p className={styles.positionBody}>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {interpretation.movement.length > 0 && (
        <section className={styles.block} aria-labelledby="movement-title">
          <h3 id="movement-title" className={styles.subhead}>
            How the spread moves
          </h3>
          <div className={styles.movement}>
            {interpretation.movement.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      <div className={styles.action}>
        <h3 className={styles.actionTitle}>One action</h3>
        <p className={styles.actionText}>{interpretation.action}</p>
      </div>

      <details className={styles.working}>
        <summary className={styles.workingSummary}>How this reading was built</summary>
        <div className={styles.workingBody}>
          <p className={styles.workingIntro}>
            This reading is assembled from the cards, their positions, and their
            traditional correspondences. It is not a prediction, and it does not know
            anything that is not in the draw.
          </p>

          <dl className={styles.factList}>
            <div>
              <dt>Lens</dt>
              <dd>
                {LENS_LABELS[working.lens]} ({LENS_SOURCES[working.lensSource]})
              </dd>
            </div>
            <div>
              <dt>Cards</dt>
              <dd>{working.total}</dd>
            </div>
            <div>
              <dt>Elements</dt>
              <dd>{elementLine || "none"}</dd>
            </div>
            <div>
              <dt>Arcana</dt>
              <dd>
                {working.kinds.major} major · {working.kinds.minor} minor ·{" "}
                {working.kinds.court} court
              </dd>
            </div>
            <div>
              <dt>Orientation</dt>
              <dd>
                {working.orientations.upright} upright · {working.orientations.shadow}{" "}
                shadow
              </dd>
            </div>
            <div>
              <dt>Shared Sephira</dt>
              <dd>
                {sharedSephira
                  ? `${SEPHIRA_BY_ID[sharedSephira.sephira].name} (${sharedSephira.cards.length} cards)`
                  : "none"}
              </dd>
            </div>
            <div>
              <dt>Repeated number</dt>
              <dd>{repeatedNumbers || "none"}</dd>
            </div>
          </dl>

          {working.resonances.length > 0 && (
            <div className={styles.resonances}>
              <h4>Card and station resonances</h4>
              <ul>
                {working.resonances.map((resonance) => (
                  <li key={`${resonance.drawn.position.id}-${resonance.kind}`}>
                    <strong>{resonance.drawn.card.name}</strong> in{" "}
                    {resonance.stationLabel}: {resonance.detail}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </details>

      <p className={styles.disclaimer}>A reading for reflection, not prediction.</p>
    </section>
  );
}
