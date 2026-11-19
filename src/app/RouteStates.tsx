import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "./paths";
import styles from "./RouteStates.module.css";

export function RouteFallback() {
  return (
    <div className={`container ${styles.loading}`} role="status">
      <p className={styles.loadingText}>Loading…</p>
    </div>
  );
}

function RouteErrorState({ onReload }: { onReload: () => void }) {
  return (
    <div className={`container ${styles.errorPage}`}>
      <section
        className={`panel ${styles.errorPanel}`}
        aria-labelledby="route-error-title"
      >
        <p className="eyebrow">Page unavailable</p>
        <h1 id="route-error-title" className={styles.errorTitle}>
          This page did not load.
        </h1>
        <p className={styles.errorText}>
          A newer version may be available, or the connection dropped. Reload to fetch the
          current files, or return to the chooser.
        </p>
        <div className={styles.errorActions}>
          <button
            type="button"
            className="button button--primary"
            onClick={onReload}
            autoFocus
          >
            Reload the app
          </button>
          <Link to={PATHS.home} className="button">
            Return home
          </Link>
        </div>
      </section>
    </div>
  );
}

interface RouteErrorBoundaryProps {
  children: ReactNode;
  /** Injected by tests; production falls back to a full page reload. */
  reload?: () => void;
}

interface RouteErrorBoundaryState {
  failed: boolean;
}

export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("A route failed to load.", error, info.componentStack);
  }

  private reload = () => {
    if (this.props.reload) {
      this.props.reload();
      return;
    }

    window.location.reload();
  };

  render() {
    if (this.state.failed) {
      return <RouteErrorState onReload={this.reload} />;
    }

    return this.props.children;
  }
}
