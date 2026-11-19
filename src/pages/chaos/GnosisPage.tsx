import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../app/paths";
import {
  DEFAULT_GNOSIS_MINUTES,
  GNOSIS_MINUTES,
  formatClock,
  gnosisSeconds,
  type GnosisMinutes,
} from "../../domain/chaos/gnosis";
import styles from "./GnosisPage.module.css";

type Phase = "idle" | "running" | "paused" | "complete";

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Ready",
  running: "In progress",
  paused: "Paused",
  complete: "Complete",
};

export function GnosisPage() {
  const [minutes, setMinutes] = useState<GnosisMinutes>(DEFAULT_GNOSIS_MINUTES);
  const [remainingMs, setRemainingMs] = useState(
    () => gnosisSeconds(DEFAULT_GNOSIS_MINUTES) * 1000,
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const endAtRef = useRef<number | null>(null);
  const completionRef = useRef<HTMLHeadingElement>(null);

  const durationMs = gnosisSeconds(minutes) * 1000;
  const secondsRemaining = Math.ceil(remainingMs / 1000);
  const elapsedMs = Math.max(0, durationMs - remainingMs);
  const canChangeDuration = phase === "idle" || phase === "complete";

  // Keep the deadline authoritative so a throttled background tab does not
  // stretch the timer; the interval only refreshes the displayed value.
  useEffect(() => {
    if (phase !== "running") {
      return;
    }

    function tick() {
      const endAt = endAtRef.current;
      if (endAt === null) {
        return;
      }

      const next = Math.max(0, endAt - Date.now());
      setRemainingMs(next);

      if (next === 0) {
        endAtRef.current = null;
        setPhase("complete");
      }
    }

    tick();
    const interval = window.setInterval(tick, 250);

    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "complete") {
      completionRef.current?.focus();
    }
  }, [phase]);

  function chooseMinutes(next: GnosisMinutes) {
    if (!canChangeDuration) {
      return;
    }

    endAtRef.current = null;
    setMinutes(next);
    setRemainingMs(gnosisSeconds(next) * 1000);
    setPhase("idle");
  }

  function startOrResume() {
    const nextRemaining = remainingMs > 0 ? remainingMs : durationMs;
    endAtRef.current = Date.now() + nextRemaining;
    setRemainingMs(nextRemaining);
    setPhase("running");
  }

  function pause() {
    if (endAtRef.current !== null) {
      setRemainingMs(Math.max(0, endAtRef.current - Date.now()));
    }

    endAtRef.current = null;
    setPhase("paused");
  }

  function reset() {
    endAtRef.current = null;
    setRemainingMs(durationMs);
    setPhase("idle");
  }

  function handlePrimary() {
    if (phase === "running") {
      pause();
      return;
    }

    startOrResume();
  }

  const primaryLabel =
    phase === "running"
      ? "Pause"
      : phase === "paused"
        ? "Resume"
        : phase === "complete"
          ? "Start again"
          : "Start";

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <Link to={PATHS.chaos} className={styles.backLink}>
          <span aria-hidden="true">←</span> Toolkit
        </Link>
        <p className="eyebrow">Tool 02 · Gnosis</p>
        <h1 className={`display-title ${styles.title}`}>Hold a single point.</h1>
        <p className="lede">
          In Chaos Magic, gnosis names a narrowed or absorbed state of attention. This
          tool only times a span; it does not induce a state or guide a technique. Use a
          practice you already know, breathe normally, and stop whenever you choose.
        </p>
      </header>

      <div className={styles.workspace}>
        <section className={`panel ${styles.setup}`} aria-labelledby="gnosis-setup-title">
          <h2 id="gnosis-setup-title" className={styles.panelTitle}>
            Set the span
          </h2>

          <fieldset className={styles.fieldset} disabled={!canChangeDuration}>
            <legend className="field-label">Minutes</legend>
            <div className={styles.presets}>
              {GNOSIS_MINUTES.map((option) => (
                <label
                  key={option}
                  className={
                    minutes === option
                      ? `${styles.preset} ${styles.presetSelected}`
                      : styles.preset
                  }
                >
                  <input
                    className={styles.radio}
                    type="radio"
                    name="gnosis-minutes"
                    value={option}
                    checked={minutes === option}
                    onChange={() => chooseMinutes(option)}
                  />
                  <span>{option} min</span>
                </label>
              ))}
            </div>
          </fieldset>

          <p className={styles.hint}>
            {canChangeDuration
              ? "Choose a length, start, and leave the rest of the page alone."
              : "Reset the timer to change the span. The countdown keeps its current length."}
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className="button button--primary"
              onClick={handlePrimary}
            >
              {primaryLabel}
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={reset}
              disabled={phase === "idle" && remainingMs === durationMs}
            >
              Reset
            </button>
          </div>

          <div className={styles.safety}>
            <h3 className={styles.safetyTitle}>Before you start</h3>
            <ul className={styles.safetyList}>
              <li>Breathe normally. Do not hold your breath or hyperventilate.</li>
              <li>Stop if you feel dizzy, panicked, or unwell.</li>
              <li>
                This timer is not medical, legal, financial, or relationship advice.
              </li>
            </ul>
          </div>
        </section>

        <section
          className={`panel ${styles.timerPanel} ${
            phase === "running" ? styles.timerPanelRunning : ""
          }`}
          aria-labelledby="gnosis-timer-title"
        >
          <p className="eyebrow" aria-live="polite">
            {PHASE_LABEL[phase]}
          </p>
          <h2 id="gnosis-timer-title" className={styles.timerTitle}>
            The countdown
          </h2>

          <p className={styles.clock} role="timer">
            {formatClock(secondsRemaining)}
          </p>
          <p className={styles.clockCaption}>
            {phase === "complete" ? "The span is complete." : "remaining"}
          </p>

          <progress
            className={styles.progress}
            max={durationMs}
            value={elapsedMs}
            aria-label="Elapsed time"
            aria-valuetext={`${formatClock(secondsRemaining)} remaining`}
          />

          <div className={styles.progressMeta}>
            <span>{minutes} min span</span>
            <span>{formatClock(Math.floor(elapsedMs / 1000))} elapsed</span>
          </div>

          {phase === "complete" && (
            <div className={styles.complete}>
              <h3 className={styles.completeTitle} ref={completionRef} tabIndex={-1}>
                Time.
              </h3>
              <p className={styles.completeText}>
                Stop, breathe, and notice what changed. What you make of the span is yours
                to record elsewhere, or to leave here.
              </p>
            </div>
          )}
        </section>
      </div>

      <p className={styles.note}>
        No sound is played. Nothing is uploaded, and leaving this page discards the timer.
        If you want a record, write it down after the span rather than during it.
      </p>
    </div>
  );
}
