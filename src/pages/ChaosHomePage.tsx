import { Link } from "react-router-dom";
import { CHAOS_TOOLS } from "../app/chaosTools";
import { PATHS } from "../app/paths";
import { ChaosStar } from "../components/ChaosStar";
import styles from "./ChaosHomePage.module.css";

export function ChaosHomePage() {
  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <ChaosStar className={styles.star} decorative />
        <p className="eyebrow">Chaos Magic</p>
        <h1 className={`display-title ${styles.title}`}>Belief is a tool.</h1>
        <p className="lede">
          No fixed pantheon. No required correspondences. Use what works, record what
          happens, and discard the rest.
        </p>
      </header>

      <section className={styles.toolkit} aria-labelledby="chaos-toolkit">
        <div className={styles.toolkitIntro}>
          <p className="eyebrow">The toolkit</p>
          <h2 id="chaos-toolkit" className={styles.panelTitle}>
            Eight tools, one experiment.
          </h2>
          <p className={styles.text}>
            The Chaos current is arriving in small, tested pieces. Open what is ready;
            everything else stays listed so you can see the shape of the whole.
          </p>
        </div>

        <ul className={styles.toolGrid}>
          {CHAOS_TOOLS.map((tool, index) => {
            const available = tool.status === "available";

            return (
              <li key={tool.id} className={`panel ${styles.toolCard}`}>
                <div className={styles.toolMeta}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span
                    className={
                      available ? `${styles.status} ${styles.statusReady}` : styles.status
                    }
                  >
                    {available ? "Available" : "Next"}
                  </span>
                </div>
                <h3 className={styles.toolTitle}>
                  {available ? (
                    <Link to={tool.path} className={styles.toolLink}>
                      {tool.title}
                    </Link>
                  ) : (
                    tool.title
                  )}
                </h3>
                <p className={styles.toolText}>{tool.description}</p>
                {available ? (
                  <Link to={tool.path} className={styles.toolAction}>
                    Open {tool.title} <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <p className={styles.toolPending}>In the works</p>
                )}
              </li>
            );
          })}
        </ul>

        <p className={styles.note}>
          Nothing here is uploaded. Records will stay in this browser, and every working
          is an experiment to review rather than a promise to believe.
        </p>
      </section>

      <nav className={styles.actions} aria-label="Other paths">
        <Link className="button button--primary" to={PATHS.thelema}>
          Visit the Thelema current
        </Link>
        <Link className="button button--ghost" to={PATHS.home}>
          Choose another system
        </Link>
      </nav>
    </div>
  );
}
