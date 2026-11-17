import { Suspense } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Hexagram } from "../components/Hexagram";
import styles from "./Layout.module.css";
import { RouteErrorBoundary, RouteFallback } from "./RouteStates";

const NAV_ITEMS = [
  { to: "/", label: "Reading", end: true },
  { to: "/library", label: "Card Library" },
  { to: "/journal", label: "Journal" },
  { to: "/tradition", label: "The Tradition" },
];

export function Layout() {
  const { pathname } = useLocation();

  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <NavLink to="/" className={styles.brand}>
            <Hexagram className={styles.brandMark} decorative />
            <span className={styles.brandText}>
              <span className={styles.brandName}>Thoth</span>
              <span className={styles.brandSub}>Thelema · Golden Dawn</span>
            </span>
            <span className="visually-hidden"> home</span>
          </NavLink>

          <nav className={styles.nav} aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" className={styles.main}>
        <RouteErrorBoundary key={pathname}>
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </RouteErrorBoundary>
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <p className={styles.law}>
            “Do what thou wilt shall be the whole of the Law. Love is the law, love under
            will.”
          </p>
          <p className={styles.attribution}>
            Aleister Crowley, <cite>Liber AL vel Legis</cite>
          </p>
          <div className={styles.footerRule} />
          <p className={styles.footerMeta}>
            Card meanings are original summaries informed by{" "}
            <cite>The Book of Thoth</cite> and Golden Dawn correspondences. Thoth Tarot
            artwork by Lady Frieda Harris. Readings are for reflection, not medical,
            legal, or financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
