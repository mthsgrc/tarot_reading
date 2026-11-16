import { Link, useParams } from "react-router-dom";
import { CardDetail } from "../components/CardDetail";
import { ALL_CARDS } from "../data/cards";
import { getCardById } from "../domain/deck";
import styles from "./CardPage.module.css";

export function CardPage() {
  const { cardId } = useParams();
  const card = cardId ? getCardById(cardId) : undefined;

  if (!card) {
    return (
      <div className={`container ${styles.page}`}>
        <section className={`panel ${styles.missing}`}>
          <p className="eyebrow">Unknown card</p>
          <h1 className={styles.missingTitle}>That card is not in the deck.</h1>
          <p className={styles.missingText}>
            The address may be mistyped, or the card may belong to a different Tarot
            tradition. Browse the complete Thoth deck to find the entry you want.
          </p>
          <Link className="button button--primary" to="/library">
            Browse the 78 cards
          </Link>
        </section>
      </div>
    );
  }

  const index = ALL_CARDS.findIndex((entry) => entry.id === card.id);
  const previous = ALL_CARDS[(index - 1 + ALL_CARDS.length) % ALL_CARDS.length];
  const next = ALL_CARDS[(index + 1) % ALL_CARDS.length];

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.topBar}>
        <Link to="/library" className={styles.backLink}>
          <span aria-hidden="true">←</span> Card library
        </Link>
        <p className={styles.deckPosition}>
          {index + 1} of {ALL_CARDS.length}
        </p>
      </div>

      <div className={`panel ${styles.panel}`}>
        <CardDetail card={card} headingId="card-page-title" headingLevel="h1" />
      </div>

      <nav className={styles.pager} aria-label="Browse adjacent cards">
        <Link to={`/cards/${previous.id}`} className={styles.pagerLink}>
          <span className={styles.pagerLabel}>← Previous</span>
          <strong>{previous.name}</strong>
        </Link>
        <Link
          to={`/cards/${next.id}`}
          className={`${styles.pagerLink} ${styles.pagerNext}`}
        >
          <span className={styles.pagerLabel}>Next →</span>
          <strong>{next.name}</strong>
        </Link>
      </nav>
    </div>
  );
}
