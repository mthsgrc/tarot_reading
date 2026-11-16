import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <div className={`container ${styles.page}`}>
      <section className={`panel ${styles.panel}`}>
        <p className="eyebrow">404 · The path turns back</p>
        <h1 className={styles.title}>No card is laid here.</h1>
        <p className={styles.text}>
          The page you asked for is not part of this deck. Return to the reading table or
          browse the 78 cards.
        </p>
        <div className={styles.actions}>
          <Link className="button button--primary" to="/">
            Return to the reading
          </Link>
          <Link className="button" to="/library">
            Browse the deck
          </Link>
        </div>
      </section>
    </div>
  );
}
