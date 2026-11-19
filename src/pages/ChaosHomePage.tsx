import { Link } from "react-router-dom";
import { PATHS } from "../app/paths";
import { ChaosStar } from "../components/ChaosStar";
import styles from "./ChaosHomePage.module.css";

const TOOLS = [
  "Sigil Forge",
  "Gnosis timer",
  "Servitor workshop",
  "Paradigm shift",
  "Cut-up oracle",
  "Magical record",
  "Working composer",
];

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

      <section className={`panel ${styles.panel}`} aria-labelledby="chaos-toolkit">
        <p className="eyebrow">The toolkit</p>
        <h2 id="chaos-toolkit" className={styles.panelTitle}>
          This current is being assembled.
        </h2>
        <p className={styles.text}>
          The Chaos system is arriving in small, tested pieces. The first tools will
          include:
        </p>
        <ul className={styles.toolList}>
          {TOOLS.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
        <p className={styles.note}>
          Nothing here is uploaded. Records will stay in this browser.
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
