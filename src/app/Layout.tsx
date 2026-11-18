import { Suspense, useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Hexagram } from "../components/Hexagram";
import styles from "./Layout.module.css";
import { RouteErrorBoundary, RouteFallback } from "./RouteStates";

const SITE_NAME = "Thoth Tarot";

const NAV_ITEMS = [
  { to: "/", label: "Reading", end: true },
  { to: "/library", label: "Card Library" },
  { to: "/study", label: "Study" },
  { to: "/journal", label: "Journal" },
  { to: "/tradition", label: "The Tradition" },
];

const ROUTE_TITLES: Record<string, string> = {
  "/": `Reading · ${SITE_NAME}`,
  "/library": `Card Library · ${SITE_NAME}`,
  "/study": `Study · ${SITE_NAME}`,
  "/journal": `Journal · ${SITE_NAME}`,
  "/tradition": `The Tradition · ${SITE_NAME}`,
};

function titleForPath(pathname: string): string {
  if (pathname.startsWith("/cards/")) {
    return `Card Library · ${SITE_NAME}`;
  }

  return ROUTE_TITLES[pathname] ?? `Page not found · ${SITE_NAME}`;
}

export function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const previousPathname = useRef(pathname);

  // Route changes happen without a page load, so update the title and move
  // focus to the new content like a real navigation would.
  useEffect(() => {
    document.title = titleForPath(pathname);

    if (previousPathname.current === pathname) {
      return;
    }

    previousPathname.current = pathname;
    mainRef.current?.focus();
  }, [pathname]);

  function focusMainContent() {
    mainRef.current?.focus();
  }

  return (
    <div className={styles.shell}>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          // HashRouter treats a bare #anchor as a route, so focus the target directly.
          event.preventDefault();
          focusMainContent();
        }}
      >
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

      <main id="main-content" className={styles.main} tabIndex={-1} ref={mainRef}>
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
