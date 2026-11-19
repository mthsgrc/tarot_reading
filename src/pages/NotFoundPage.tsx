import { Link } from "react-router-dom";
import { PATHS } from "../app/paths";
import styles from "./NotFoundPage.module.css";

export function NotFoundPage() {
  return (
    <div className={`container ${styles.page}`}>
      <section className={`panel ${styles.panel}`}>
        <p className="eyebrow">404 · The path turns back</p>
        <h1 className={styles.title}>No path opens here.</h1>
        <p className={styles.text}>
          The page you asked for is not part of this app. Return to the chooser, browse
          the Thoth deck, or enter the Chaos current.
        </p>
        <div className={styles.actions}>
          <Link className="button button--primary" to={PATHS.home}>
            Return home
          </Link>
          <Link className="button" to={PATHS.library}>
            Browse the deck
          </Link>
          <Link className="button button--ghost" to={PATHS.chaos}>
            Enter Chaos
          </Link>
        </div>
      </section>
    </div>
  );
}
