import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { CardDetailDialog } from "../components/CardDetailDialog";
import { Hexagram } from "../components/Hexagram";
import { ReadingInterpretation } from "../components/ReadingInterpretation";
import { SpreadBoard } from "../components/SpreadBoard";
import { SpreadPicker } from "../components/SpreadPicker";
import { DEFAULT_SPREAD, SPREADS, SPREAD_BY_ID } from "../data/spreads";
import { drawCards } from "../domain/deck";
import { formatReading } from "../domain/reading/format";
import { interpretReading } from "../domain/reading/interpret";
import {
  buildShareUrl,
  hasShareParams,
  readSharedReading,
} from "../domain/reading/share";
import { ELEMENT_COLORS, ELEMENT_GLYPHS } from "../domain/tree";
import type { DrawnCard, Element } from "../domain/types";
import styles from "./ReadingPage.module.css";

const ELEMENTS: readonly Element[] = ["Fire", "Water", "Air", "Earth"];

type CopyStatus = "idle" | "reading" | "link" | "error";

export function ReadingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shared] = useState(() => readSharedReading(searchParams));
  const [shareError, setShareError] = useState(
    () => !shared && hasShareParams(searchParams),
  );
  const [appliedShare, setAppliedShare] = useState(() => searchParams.toString());
  const [isShared, setIsShared] = useState(Boolean(shared));
  const [spreadId, setSpreadId] = useState<string>(
    shared?.spread.id ?? DEFAULT_SPREAD.id,
  );
  const [question, setQuestion] = useState(shared?.question ?? "");
  const [shadowEnabled, setShadowEnabled] = useState(shared?.shadow ?? false);
  const [drawn, setDrawn] = useState<DrawnCard[]>(shared?.drawn ?? []);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");

  const spread = SPREAD_BY_ID.get(spreadId) ?? DEFAULT_SPREAD;
  const isReading = drawn.length > 0;
  const revealedCount = drawn.filter((drawnCard) => drawnCard.revealed).length;
  const allRevealed = isReading && revealedCount === drawn.length;
  const selectedCard = openIndex === null ? null : (drawn[openIndex] ?? null);

  const elementBalance = useMemo(() => {
    const counts: Record<Element, number> = {
      Fire: 0,
      Water: 0,
      Air: 0,
      Earth: 0,
    };

    drawn.forEach((drawnCard) => {
      counts[drawnCard.card.element] += 1;
    });

    return counts;
  }, [drawn]);

  const interpretation = useMemo(
    () => (allRevealed ? interpretReading({ spread, drawn, question }) : null),
    [allRevealed, spread, drawn, question],
  );

  const summaryText = useMemo(
    () => (interpretation ? formatReading(interpretation, { spread, question }) : ""),
    [interpretation, spread, question],
  );

  // A different hash can arrive without a reload, so apply new share links too.
  useEffect(() => {
    const key = searchParams.toString();
    if (key === appliedShare) {
      return;
    }

    // The URL is an external store, so applying a new link needs state updates.
    // oxlint-disable-next-line react/set-state-in-effect
    setAppliedShare(key);

    const next = readSharedReading(searchParams);
    if (!next) {
      if (hasShareParams(searchParams)) {
        setShareError(true);
      }
      return;
    }

    setSpreadId(next.spread.id);
    setQuestion(next.question);
    setShadowEnabled(next.shadow);
    setDrawn(next.drawn);
    setOpenIndex(null);
    setIsShared(true);
    setShareError(false);
    setCopyStatus("idle");
  }, [searchParams, appliedShare]);

  function clearShareLink() {
    setSearchParams({}, { replace: true });
  }

  function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDrawn(drawCards(spread, { shadow: shadowEnabled }));
    setOpenIndex(null);
    setIsShared(false);
    setShareError(false);
    setCopyStatus("idle");
    clearShareLink();
  }

  function handleReveal(index: number) {
    setDrawn((previous) =>
      previous.map((drawnCard, cardIndex) =>
        cardIndex === index ? { ...drawnCard, revealed: true } : drawnCard,
      ),
    );
  }

  function handleRevealAll() {
    setDrawn((previous) =>
      previous.map((drawnCard) => ({ ...drawnCard, revealed: true })),
    );
  }

  function handleNewReading() {
    setDrawn([]);
    setOpenIndex(null);
    setIsShared(false);
    setShareError(false);
    setCopyStatus("idle");
    clearShareLink();
  }

  async function handleCopy() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(summaryText);
      setCopyStatus("reading");
    } catch {
      setCopyStatus("error");
    }
  }

  async function handleCopyLink() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }

      const url = buildShareUrl(window.location.href, {
        spread,
        drawn,
        question,
        shadow: shadowEnabled,
      });

      await navigator.clipboard.writeText(url);
      setCopyStatus("link");
    } catch {
      setCopyStatus("error");
    }
  }

  if (isReading) {
    return (
      <div className={`container ${styles.page}`}>
        <section className={styles.reading} aria-labelledby="reading-title">
          <div className={styles.readingHead}>
            <div>
              <p className="eyebrow">{isShared ? "Shared reading" : "Your reading"}</p>
              <h1 id="reading-title" className={`section-title ${styles.readingTitle}`}>
                {spread.name}
              </h1>
              <p className={styles.readingSub}>
                {spread.subtitle} · {spread.positions.length} cards
              </p>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className="button button--primary button--small"
                onClick={handleRevealAll}
                disabled={allRevealed}
              >
                Reveal all
              </button>
              <button
                type="button"
                className="button button--ghost button--small"
                onClick={handleNewReading}
              >
                New reading
              </button>
            </div>
          </div>

          {question.trim() && (
            <blockquote className={styles.question}>“{question.trim()}”</blockquote>
          )}

          <p className={styles.description}>{spread.description}</p>

          <div className={styles.statusRow}>
            <p className={styles.progress} role="status" aria-live="polite">
              {revealedCount} of {drawn.length} cards revealed.
            </p>
            <p className={styles.tip}>
              {allRevealed
                ? "Select any card to read its full entry."
                : "Reveal one at a time, or turn them all."}
            </p>
          </div>

          <SpreadBoard
            spread={spread}
            drawn={drawn}
            onReveal={handleReveal}
            onOpen={setOpenIndex}
          />

          {allRevealed ? (
            <>
              <section
                className={`panel ${styles.summary}`}
                aria-labelledby="pattern-title"
              >
                <div className={styles.summaryHead}>
                  <div>
                    <p className="eyebrow">Synthesis</p>
                    <h2 id="pattern-title" className="section-title">
                      The pattern
                    </h2>
                  </div>
                  <div className={styles.copyActions}>
                    <button
                      type="button"
                      className="button button--small"
                      onClick={handleCopy}
                    >
                      {copyStatus === "reading" ? "Copied" : "Copy reading"}
                    </button>
                    <button
                      type="button"
                      className="button button--ghost button--small"
                      onClick={handleCopyLink}
                    >
                      {copyStatus === "link" ? "Link copied" : "Copy link"}
                    </button>
                  </div>
                </div>

                <ol className={styles.summaryList}>
                  {drawn.map((drawnCard, index) => (
                    <li key={drawnCard.position.id}>
                      <button
                        type="button"
                        className={styles.summaryItem}
                        onClick={() => setOpenIndex(index)}
                      >
                        <span className={styles.summaryPosition}>
                          {drawnCard.position.label}
                        </span>
                        <span className={styles.summaryName}>{drawnCard.card.name}</span>
                        <span className={styles.summaryMeta}>
                          {drawnCard.orientation === "shadow" ? "Shadow" : "Upright"}
                        </span>
                        <span className={styles.summaryKeywords}>
                          {drawnCard.card.keywords.slice(0, 3).join(" · ")}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>

                <div className={styles.summaryGrid}>
                  <div className={styles.balance}>
                    <h3 className={styles.summaryTitle}>Elemental balance</h3>
                    {ELEMENTS.map((element) => {
                      const count = elementBalance[element];
                      const proportion = drawn.length > 0 ? count / drawn.length : 0;

                      return (
                        <div key={element} className={styles.elementRow}>
                          <span className={styles.elementName}>
                            <span aria-hidden="true">{ELEMENT_GLYPHS[element]}</span>
                            {element}
                          </span>
                          <span className={styles.elementTrack} aria-hidden="true">
                            <span
                              className={styles.elementFill}
                              style={{
                                width: `${proportion * 100}%`,
                                background: ELEMENT_COLORS[element],
                              }}
                            />
                          </span>
                          <span className={styles.elementCount}>
                            {count} {count === 1 ? "card" : "cards"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.prompt}>
                    <h3 className={styles.summaryTitle}>Hold the question</h3>
                    <p>
                      Read each card in its position first, then look for repeated
                      elements, suits, and numbers. A dominant element describes the
                      weather of the reading, not a fixed verdict.
                    </p>
                    <p className={styles.promptNote}>
                      Shadow cards are not “bad.” They show where a current is blocked,
                      excessive, or asking for honest attention.
                    </p>
                  </div>
                </div>

                <p className={styles.copyStatus} role="status" aria-live="polite">
                  {copyStatus === "reading" && "Reading copied to the clipboard."}
                  {copyStatus === "link" &&
                    "Link copied to the clipboard. It includes your question."}
                  {copyStatus === "error" &&
                    "The clipboard is unavailable in this browser. Copying is disabled."}
                </p>
              </section>

              {interpretation && (
                <ReadingInterpretation interpretation={interpretation} />
              )}
            </>
          ) : (
            <p className={styles.waiting}>
              The synthesis appears when every card in the spread is revealed.
            </p>
          )}
        </section>

        <CardDetailDialog drawn={selectedCard} onClose={() => setOpenIndex(null)} />
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <Hexagram className={styles.heroMark} title="Thelemic hexagram" />
        <p className="eyebrow">Thelema · Golden Dawn · Thoth Tarot</p>
        <h1 className={`display-title ${styles.title}`}>
          The cards are a mirror,
          <br />
          not a verdict.
        </h1>
        <p className="lede">
          Choose a spread, hold a real question, and draw. Every card carries its
          Qabalistic path, elemental current, and shadow, so you can read the pattern
          rather than collect predictions.
        </p>
        <ul className={styles.heroStats}>
          <li>
            <strong>78</strong>
            <span>Thoth cards</span>
          </li>
          <li>
            <strong>6</strong>
            <span>spreads</span>
          </li>
          <li>
            <strong>22</strong>
            <span>Tree paths</span>
          </li>
        </ul>
      </header>

      {shareError && (
        <p className={styles.shareError} role="status">
          That shared link could not be read. Check that the whole link was copied, or
          draw a new reading below.
        </p>
      )}

      <div className={styles.setupGrid}>
        <section className={`panel ${styles.setupPanel}`} aria-labelledby="setup-title">
          <div className={styles.panelHead}>
            <p className="eyebrow">The draw</p>
            <h2 id="setup-title" className="section-title">
              Set the question
            </h2>
          </div>

          <form onSubmit={handleStart}>
            <SpreadPicker
              spreads={SPREADS}
              selectedId={spread.id}
              onChange={setSpreadId}
            />

            <div className={styles.questionBlock}>
              <label className="field-label" htmlFor="reading-question">
                Question <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                id="reading-question"
                className="text-area"
                maxLength={500}
                placeholder="What is actually being asked here?"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
              />
              <p className={styles.help}>
                An open question works best: “What do I need to see about this situation?”
                rather than “Will they come back?”
              </p>
            </div>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={shadowEnabled}
                onChange={(event) => setShadowEnabled(event.target.checked)}
              />
              <span>
                <strong>Include shadow cards</strong>
                <span className={styles.checkboxNote}>
                  Upright is the default. Turn this on to let each card appear in its
                  shadow or inverted orientation.
                </span>
              </span>
            </label>

            <div className={styles.submitRow}>
              <button type="submit" className="button button--primary">
                Draw the cards
              </button>
              <p className={styles.submitNote}>
                No account. No storage. The draw happens in your browser.
              </p>
            </div>
          </form>
        </section>

        <aside className={styles.guide} aria-labelledby="guide-title">
          <p className="eyebrow">Method</p>
          <h2 id="guide-title" className={styles.guideTitle}>
            Before you draw
          </h2>
          <ol className={styles.guideList}>
            <li>
              <span className={styles.guideNumber}>01</span>
              <div>
                <strong>Ask something you can act on.</strong>
                <p>
                  A question about what to notice, choose, or change gives the cards
                  something to work with.
                </p>
              </div>
            </li>
            <li>
              <span className={styles.guideNumber}>02</span>
              <div>
                <strong>Read the positions as grammar.</strong>
                <p>
                  A card means differently as a root, an obstacle, or a potential. The
                  spread supplies the sentence.
                </p>
              </div>
            </li>
            <li>
              <span className={styles.guideNumber}>03</span>
              <div>
                <strong>Look for what repeats.</strong>
                <p>
                  Elements, suits, numbers, and courts are the deck’s underlying pattern
                  language.
                </p>
              </div>
            </li>
          </ol>
          <div className={styles.guideNote}>
            <strong>Not a prediction machine.</strong>
            <p>
              Use a reading to reflect, not to replace medical, legal, financial, or
              relationship advice.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
