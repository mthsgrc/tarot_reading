import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ChaosStar } from "../components/ChaosStar";
import { Hexagram } from "../components/Hexagram";
import { accentLabel, pickChaosAccent, type ChaosAccent } from "./chaosAccent";
import styles from "./Layout.module.css";
import { PATHS, systemForPath, type AppSystem } from "./paths";
import { RouteErrorBoundary, RouteFallback } from "./RouteStates";

const SITE_NAME = "Thoth Tarot";
const UMBRELLA_NAME = "Two Currents";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const THELEMA_NAV: NavItem[] = [
  { to: PATHS.thelema, label: "Reading", end: true },
  { to: PATHS.library, label: "Card Library" },
  { to: PATHS.study, label: "Study" },
  { to: PATHS.journal, label: "Journal" },
  { to: PATHS.tradition, label: "The Tradition" },
];

const CHAOS_NAV: NavItem[] = [
  { to: PATHS.chaos, label: "Toolkit", end: true },
  { to: PATHS.thelema, label: "Thelema" },
  { to: PATHS.home, label: "Systems", end: true },
];

const HOME_NAV: NavItem[] = [
  { to: PATHS.thelema, label: "Thelema" },
  { to: PATHS.chaos, label: "Chaos" },
];

const ROUTE_TITLES: Record<string, string> = {
  [PATHS.home]: `Choose a system · ${UMBRELLA_NAME}`,
  [PATHS.thelema]: `Reading · ${SITE_NAME}`,
  [PATHS.library]: `Card Library · ${SITE_NAME}`,
  [PATHS.study]: `Study · ${SITE_NAME}`,
  [PATHS.journal]: `Journal · ${SITE_NAME}`,
  [PATHS.tradition]: `The Tradition · ${SITE_NAME}`,
  [PATHS.chaos]: `Chaos Magic · ${UMBRELLA_NAME}`,
  [PATHS.chaosSigil]: `Sigil Forge · ${UMBRELLA_NAME}`,
  [PATHS.chaosGnosis]: `Gnosis Timer · ${UMBRELLA_NAME}`,
  [PATHS.chaosCutUp]: `Cut-up Oracle · ${UMBRELLA_NAME}`,
  [PATHS.chaosServitors]: `Servitor Workshop · ${UMBRELLA_NAME}`,
  [PATHS.chaosParadigms]: `Paradigm Shift · ${UMBRELLA_NAME}`,
  [PATHS.chaosRecord]: `Magical Record · ${UMBRELLA_NAME}`,
  [PATHS.chaosWorking]: `Working Composer · ${UMBRELLA_NAME}`,
  [PATHS.chaosSources]: `Sources & Context · ${UMBRELLA_NAME}`,
  // Legacy routes redirect immediately, but a matching title avoids a flash.
  "/library": `Card Library · ${SITE_NAME}`,
  "/study": `Study · ${SITE_NAME}`,
  "/journal": `Journal · ${SITE_NAME}`,
  "/tradition": `The Tradition · ${SITE_NAME}`,
};

function titleForPath(pathname: string): string {
  const exactTitle = ROUTE_TITLES[pathname];
  if (exactTitle) {
    return exactTitle;
  }

  if (pathname.startsWith(`${PATHS.thelema}/cards/`) || pathname.startsWith("/cards/")) {
    return `Card Library · ${SITE_NAME}`;
  }

  if (pathname.startsWith(`${PATHS.chaos}/`)) {
    return `Chaos Magic · ${UMBRELLA_NAME}`;
  }

  return `Page not found · ${UMBRELLA_NAME}`;
}

const NAV_BY_SYSTEM: Record<AppSystem, NavItem[]> = {
  home: HOME_NAV,
  thelema: THELEMA_NAV,
  chaos: CHAOS_NAV,
};

const BRAND_BY_SYSTEM: Record<AppSystem, { to: string; name: string; sub: string }> = {
  home: { to: PATHS.home, name: UMBRELLA_NAME, sub: "Thelema · Chaos" },
  thelema: {
    to: PATHS.thelema,
    name: "Thoth",
    sub: "Thelema · Golden Dawn",
  },
  chaos: { to: PATHS.chaos, name: "Chaos", sub: "Belief is a tool" },
};

function ThelemaFooter() {
  return (
    <>
      <p className={styles.law}>
        “Do what thou wilt shall be the whole of the Law. Love is the law, love under
        will.”
      </p>
      <p className={styles.attribution}>
        Aleister Crowley, <cite>Liber AL vel Legis</cite>
      </p>
      <div className={styles.footerRule} />
      <p className={styles.footerMeta}>
        Card meanings are original summaries informed by <cite>The Book of Thoth</cite>{" "}
        and Golden Dawn correspondences. Thoth Tarot artwork by Lady Frieda Harris.
        Readings are for reflection, not medical, legal, or financial advice.
      </p>
    </>
  );
}

function ChaosFooter() {
  return (
    <>
      <p className={styles.law}>
        Belief is a tool. Use what works, record what happens, discard the rest.
      </p>
      <p className={styles.attribution}>
        Chaos Magic · after Austin Osman Spare and Peter J. Carroll
      </p>
      <div className={styles.footerRule} />
      <p className={styles.footerMeta}>
        Sigils, gnosis, servitors, and paradigm experiments are creative and reflective
        practices, not medical, legal, financial, or crisis advice. Nothing is uploaded;
        your records stay in this browser.
      </p>
    </>
  );
}

function HomeFooter() {
  return (
    <>
      <p className={styles.law}>Two currents, one practice.</p>
      <p className={styles.attribution}>Thelema · Golden Dawn · Chaos Magic</p>
      <div className={styles.footerRule} />
      <p className={styles.footerMeta}>
        Choose a system at any time. Readings and records stay in this browser. Nothing is
        uploaded and no account tracks your work.
      </p>
    </>
  );
}

const FOOTER_BY_SYSTEM: Record<AppSystem, ComponentType> = {
  home: HomeFooter,
  thelema: ThelemaFooter,
  chaos: ChaosFooter,
};

export function Layout() {
  const { pathname } = useLocation();
  const system = systemForPath(pathname);
  const mainRef = useRef<HTMLElement>(null);
  const previousPathname = useRef(pathname);
  const [accent, setAccent] = useState<ChaosAccent>(() => pickChaosAccent());

  const brand = BRAND_BY_SYSTEM[system];
  const navItems = NAV_BY_SYSTEM[system];
  const Footer = FOOTER_BY_SYSTEM[system];

  // The Chaos palette is global to the document so the body background and
  // native controls follow the shell. One accent stays put across routes.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.system = system;
    root.dataset.accent = accent;

    return () => {
      delete root.dataset.system;
      delete root.dataset.accent;
    };
  }, [accent, system]);

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

  function rerollAccent() {
    setAccent((current) => pickChaosAccent(Math.random, current));
  }

  return (
    <div className={`${styles.shell} ${styles[system]}`} data-system={system}>
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
          <NavLink to={brand.to} className={styles.brand}>
            {system === "home" ? (
              <span className={styles.brandMarks}>
                <Hexagram
                  className={`${styles.brandMark} ${styles.thelemaMark}`}
                  decorative
                />
                <ChaosStar
                  className={`${styles.brandMark} ${styles.chaosMark}`}
                  decorative
                />
              </span>
            ) : system === "chaos" ? (
              <ChaosStar className={styles.brandMark} decorative />
            ) : (
              <Hexagram className={styles.brandMark} decorative />
            )}
            <span className={styles.brandText}>
              <span className={styles.brandName}>{brand.name}</span>
              <span className={styles.brandSub}>{brand.sub}</span>
            </span>
            <span className="visually-hidden"> home</span>
          </NavLink>

          <div className={styles.headerActions}>
            {system === "chaos" && (
              <button
                type="button"
                className={styles.signalButton}
                onClick={rerollAccent}
                aria-label={`New signal. Current accent: ${accentLabel(accent)}`}
                title="Randomize the contrast accent"
              >
                <span className={styles.signalSwatch} aria-hidden="true" />
                New signal
              </button>
            )}

            <nav className={styles.nav} aria-label="Main navigation">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    isActive
                      ? `${styles.navLink} ${styles.navLinkActive}`
                      : styles.navLink
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
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
          <Footer />
        </div>
      </footer>
    </div>
  );
}
