import { Link, Navigate, useSearchParams } from "react-router-dom";
import { PATHS, thelemaReadingPath } from "../app/paths";
import { ChaosStar } from "../components/ChaosStar";
import { Hexagram } from "../components/Hexagram";
import { hasShareParams } from "../domain/reading/share";
import styles from "./HomePage.module.css";

/**
 * The chooser is also the compatibility door for the old `#/?...` share
 * format. A link carrying a reading is sent straight to the Thelema route.
 */
export function HomePage() {
  const [searchParams] = useSearchParams();

  if (hasShareParams(searchParams)) {
    return <Navigate to={thelemaReadingPath(searchParams.toString())} replace />;
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className="eyebrow">Two currents · one practice</p>
        <h1 className={`display-title ${styles.title}`}>Choose a system.</h1>
        <p className="lede">
          Thoth Tarot reads the pattern through Thelema and the Golden Dawn. Chaos Magic
          treats belief as a tool. Both stay in this browser, with no account and no
          tracking.
        </p>
      </header>

      <section className={styles.paths} aria-label="Choose a system">
        <Link className={`${styles.path} ${styles.thelema}`} to={PATHS.thelema}>
          <Hexagram className={styles.mark} decorative />
          <p className={`eyebrow ${styles.pathEyebrow}`}>Thelema · Golden Dawn</p>
          <h2 className={styles.pathTitle}>Thoth Tarot</h2>
          <p className={styles.pathText}>
            Draw from all 78 cards, study the correspondences, and keep a journal of
            readings that explain their own pattern.
          </p>
          <span className={`button button--primary ${styles.cta}`}>
            Enter the Thelema current
          </span>
        </Link>

        <Link className={`${styles.path} ${styles.chaos}`} to={PATHS.chaos}>
          <ChaosStar className={styles.mark} decorative />
          <p className={`eyebrow ${styles.pathEyebrow}`}>Chaos Magic</p>
          <h2 className={styles.pathTitle}>Belief is a tool</h2>
          <p className={styles.pathText}>
            Sigils, gnosis, servitors, and experiments in temporary belief. Keep what
            works, record what happens, and discard the rest.
          </p>
          <span className={`button ${styles.cta}`}>Enter the Chaos current</span>
        </Link>
      </section>

      <p className={styles.note}>
        Existing shared readings still open. The old links now lead to their new home
        under the Thelema current.
      </p>
    </div>
  );
}
