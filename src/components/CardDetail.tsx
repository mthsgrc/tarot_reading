import { useId } from "react";
import { ELEMENT_GLYPHS, SEPHIRA_BY_ID } from "../domain/tree";
import type { Orientation, Sephira, TarotCard } from "../domain/types";
import { CardImage } from "./CardImage";
import { TreeOfLifeDiagram } from "./TreeOfLifeDiagram";
import styles from "./CardDetail.module.css";

interface CardDetailProps {
  card: TarotCard;
  orientation?: Orientation;
  positionLabel?: string;
  positionHint?: string;
  headingId?: string;
  headingLevel?: "h1" | "h2";
}

interface Correspondence {
  label: string;
  value: string;
}

function getCorrespondences(card: TarotCard): Correspondence[] {
  const items: Correspondence[] = [
    {
      label: card.kind === "court" ? "Elemental nature" : "Element",
      value: `${ELEMENT_GLYPHS[card.element]} ${card.element}`,
    },
  ];

  if (card.kind === "major") {
    const from = SEPHIRA_BY_ID[card.path.from];
    const to = SEPHIRA_BY_ID[card.path.to];

    items.push(
      { label: "Hebrew letter", value: `${card.hebrewLetter} ${card.hebrewLetterChar}` },
      { label: "Golden Dawn title", value: card.gdTitle },
      {
        label: "Tree path",
        value: `${card.path.number} · ${from.name} → ${to.name}`,
      },
    );

    if (card.zodiac) {
      items.push({ label: "Zodiac", value: card.zodiac });
    }

    if (card.planet) {
      items.push({ label: "Planet", value: card.planet });
    }
  }

  if (card.kind === "minor") {
    const sephira = SEPHIRA_BY_ID[card.sephira];
    items.push(
      { label: "Sephira", value: `${sephira.name} — ${sephira.title}` },
      { label: "Lord of the card", value: card.lordTitle },
    );

    if (card.decan) {
      items.push({ label: "Decan", value: card.decan });
    }
  }

  if (card.kind === "court") {
    items.push({ label: "Composition", value: card.courtElement });

    if (card.zodiacRange) {
      items.push({ label: "Zodiac range", value: card.zodiacRange });
    }
  }

  return items;
}

function getTreeHighlight(card: TarotCard): {
  pathNumber?: number;
  sephira?: Sephira;
} {
  if (card.kind === "major") {
    return { pathNumber: card.path.number };
  }

  if (card.kind === "minor") {
    return { sephira: card.sephira };
  }

  return {};
}

export function CardDetail({
  card,
  orientation,
  positionLabel,
  positionHint,
  headingId,
  headingLevel: Heading = "h2",
}: CardDetailProps) {
  const detailId = useId();
  const essenceId = `${detailId}-essence`;
  const uprightId = `${detailId}-upright`;
  const shadowId = `${detailId}-shadow`;
  const symbolismId = `${detailId}-symbolism`;
  const correspondences = getCorrespondences(card);
  const treeHighlight = getTreeHighlight(card);
  const hasTreeHighlight =
    treeHighlight.pathNumber !== undefined || treeHighlight.sephira !== undefined;

  return (
    <article className={styles.detail}>
      <header className={styles.header}>
        <p className="eyebrow">
          {card.kind === "major"
            ? `Major Arcana · Atu ${card.number}`
            : card.kind === "minor"
              ? `${card.suit} · ${card.rank}`
              : `Court card · ${card.suit} · ${card.rank}`}
        </p>
        <Heading id={headingId} className={styles.name}>
          {card.name}
        </Heading>
        <ul className={styles.keywords} aria-label="Keywords">
          {card.keywords.map((keyword) => (
            <li key={keyword} className={styles.keyword}>
              {keyword}
            </li>
          ))}
        </ul>
      </header>

      <div className={styles.visual}>
        <div className={styles.imageFrame}>
          <CardImage
            card={card}
            loading="eager"
            className={orientation === "shadow" ? styles.shadowImage : undefined}
          />
        </div>

        {orientation && (
          <p className={styles.orientation}>
            <span
              className={
                orientation === "shadow" ? styles.shadowBadge : styles.uprightBadge
              }
            >
              {orientation === "shadow" ? "Shadow" : "Upright"}
            </span>
            <span>{positionLabel ? `in the ${positionLabel} position` : "as drawn"}</span>
          </p>
        )}

        {hasTreeHighlight && (
          <div className={styles.treeCard}>
            <TreeOfLifeDiagram
              pathNumber={treeHighlight.pathNumber}
              sephira={treeHighlight.sephira}
              className={styles.treeDiagram}
            />
            <p className={styles.treeCaption}>
              {treeHighlight.pathNumber
                ? `Path ${treeHighlight.pathNumber} on the Tree of Life`
                : "Its Sephira on the Tree of Life"}
            </p>
          </div>
        )}
      </div>

      <div className={styles.body}>
        {orientation && positionLabel && (
          <div className={styles.readingContext}>
            <span className={styles.contextLabel}>In this reading</span>
            <p>
              <strong>{positionLabel}</strong>
              {positionHint ? ` — ${positionHint}` : ""}
            </p>
          </div>
        )}

        <dl className={styles.correspondences}>
          {correspondences.map((item) => (
            <div key={item.label} className={styles.correspondence}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>

        <section className={styles.section} aria-labelledby={essenceId}>
          <h3 id={essenceId} className={styles.sectionTitle}>
            Essence
          </h3>
          <p className={styles.prose}>{card.essence}</p>
        </section>

        <div className={styles.meanings}>
          <section
            className={`${styles.meaning} ${
              orientation === "upright" ? styles.activeMeaning : ""
            }`}
            aria-labelledby={uprightId}
          >
            <h3 id={uprightId} className={styles.meaningTitle}>
              Upright
            </h3>
            <p>{card.upright}</p>
          </section>
          <section
            className={`${styles.meaning} ${
              orientation === "shadow" ? styles.activeMeaning : ""
            }`}
            aria-labelledby={shadowId}
          >
            <h3 id={shadowId} className={styles.meaningTitle}>
              Shadow
            </h3>
            <p>{card.shadow}</p>
          </section>
        </div>

        <section className={styles.section} aria-labelledby={symbolismId}>
          <h3 id={symbolismId} className={styles.sectionTitle}>
            Symbolism
          </h3>
          <ul className={styles.symbolism}>
            {card.symbolism.map((symbol) => (
              <li key={symbol}>{symbol}</li>
            ))}
          </ul>
        </section>

        <footer className={styles.footer}>
          <p className={styles.sourceNote}>
            Original study summary informed by <cite>The Book of Thoth</cite> and Golden
            Dawn correspondences.
          </p>
          <a
            className={styles.sourceLink}
            href={card.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Read the source material <span aria-hidden="true">↗</span>
          </a>
        </footer>
      </div>
    </article>
  );
}
