import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cardPath } from "../app/paths";
import { CardImage } from "../components/CardImage";
import { ALL_CARDS } from "../data/cards";
import { cardTypeLabel } from "../domain/cardLabels";
import { ELEMENTS } from "../domain/reading/positions";
import type { Element, Suit } from "../domain/types";
import styles from "./LibraryPage.module.css";

type ArcanaFilter = "all" | "major" | "minor" | "court";

const SUITS: readonly Suit[] = ["Wands", "Cups", "Swords", "Disks"];

function searchableText(card: (typeof ALL_CARDS)[number]): string {
  const fields: string[] = [
    card.name,
    card.essence,
    card.upright,
    card.shadow,
    ...card.keywords,
    card.element,
  ];

  if (card.kind === "major") {
    fields.push(
      "major arcana",
      card.hebrewLetter,
      card.gdTitle,
      card.zodiac ?? "",
      card.planet ?? "",
      `path ${card.path.number}`,
    );
  }

  if (card.kind === "minor") {
    fields.push(card.suit, card.rank, card.sephira, card.lordTitle, card.decan ?? "");
  }

  if (card.kind === "court") {
    fields.push(
      card.suit,
      card.rank,
      "court card",
      card.courtElement,
      card.zodiacRange ?? "",
    );
  }

  return fields.join(" ").toLowerCase();
}

function searchWords(card: (typeof ALL_CARDS)[number]): readonly string[] {
  return searchableText(card)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

const CARD_SEARCH_WORDS: ReadonlyMap<string, readonly string[]> = new Map(
  ALL_CARDS.map((card) => [card.id, searchWords(card)]),
);

export function LibraryPage() {
  const [query, setQuery] = useState("");
  const [arcana, setArcana] = useState<ArcanaFilter>("all");
  const [suit, setSuit] = useState<Suit | "all">("all");
  const [element, setElement] = useState<Element | "all">("all");

  const filteredCards = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return ALL_CARDS.filter((card) => {
      if (arcana !== "all" && card.kind !== arcana) {
        return false;
      }

      if (suit !== "all" && (card.kind === "major" || card.suit !== suit)) {
        return false;
      }

      if (element !== "all" && card.element !== element) {
        return false;
      }

      if (tokens.length > 0) {
        const words = CARD_SEARCH_WORDS.get(card.id) ?? [];

        return tokens.every((token) =>
          words.some((word) => word === token || word.startsWith(token)),
        );
      }

      return true;
    });
  }, [arcana, element, query, suit]);

  const hasFilters =
    query.trim().length > 0 || arcana !== "all" || suit !== "all" || element !== "all";

  function resetFilters() {
    setQuery("");
    setArcana("all");
    setSuit("all");
    setElement("all");
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.hero}>
        <p className="eyebrow">The deck</p>
        <h1 className={`display-title ${styles.title}`}>Seventy-eight doors</h1>
        <p className="lede">
          Browse every card in the Thoth deck. Each entry gives the image, Qabalistic
          correspondences, an upright reading, and its shadow. Search by name, keyword,
          element, decan, or Hebrew letter.
        </p>
      </header>

      <section className={`panel ${styles.filters}`} aria-labelledby="filter-title">
        <h2 id="filter-title" className="visually-hidden">
          Search and filter the deck
        </h2>

        <div className={styles.filterGrid}>
          <div className={styles.searchField}>
            <label className="field-label" htmlFor="card-search">
              Search
            </label>
            <input
              id="card-search"
              className="text-input"
              type="search"
              placeholder="Name, keyword, correspondence…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="arcana-filter">
              Arcana
            </label>
            <select
              id="arcana-filter"
              className={`text-input ${styles.select}`}
              value={arcana}
              onChange={(event) => setArcana(event.target.value as ArcanaFilter)}
            >
              <option value="all">All cards</option>
              <option value="major">Major Arcana</option>
              <option value="minor">Minor Arcana</option>
              <option value="court">Court cards</option>
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="suit-filter">
              Suit
            </label>
            <select
              id="suit-filter"
              className={`text-input ${styles.select}`}
              value={suit}
              onChange={(event) => setSuit(event.target.value as Suit | "all")}
            >
              <option value="all">All suits</option>
              {SUITS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="element-filter">
              Element
            </label>
            <select
              id="element-filter"
              className={`text-input ${styles.select}`}
              value={element}
              onChange={(event) => setElement(event.target.value as Element | "all")}
            >
              <option value="all">All elements</option>
              {ELEMENTS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className={styles.filterFooter}>
            <button
              type="button"
              className="button button--small button--ghost"
              onClick={resetFilters}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      <div className={styles.resultsHead}>
        <p className={styles.resultCount} role="status" aria-live="polite">
          {filteredCards.length} {filteredCards.length === 1 ? "card" : "cards"}
        </p>
        <p className={styles.resultHint}>
          Element uses each card’s elemental attribution; court cards carry a sub-element.
        </p>
      </div>

      {filteredCards.length > 0 ? (
        <ul className={styles.grid}>
          {filteredCards.map((card) => (
            <li key={card.id}>
              <Link to={cardPath(card.id)} className={styles.cardLink}>
                <CardImage card={card} decorative />
                <span className={styles.cardType}>{cardTypeLabel(card)}</span>
                <span className={styles.cardName}>{card.name}</span>
                <span className={styles.cardKeywords}>
                  {card.keywords.slice(0, 3).join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className={`panel ${styles.empty}`}>
          <p className="eyebrow">No matches</p>
          <h2 className={styles.emptyTitle}>Nothing in the deck answers that.</h2>
          <p className={styles.emptyText}>
            Try a card name, a keyword like “will” or “grief”, or clear the filters to
            return to all 78 cards.
          </p>
          <button type="button" className="button" onClick={resetFilters}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
