import type { CSSProperties } from "react";
import type { DrawnCard, Spread } from "../domain/types";
import styles from "./SpreadBoard.module.css";
import { TarotCardView } from "./TarotCardView";

interface SpreadBoardProps {
  spread: Spread;
  drawn: readonly DrawnCard[];
  onReveal: (index: number) => void;
  onOpen: (index: number) => void;
}

export function SpreadBoard({ spread, drawn, onReveal, onOpen }: SpreadBoardProps) {
  // Row layouts auto-place their cards; the other layouts name grid areas per position.
  const usesNamedAreas = spread.layout !== "row";

  return (
    <div
      className={`${styles.board} ${styles[spread.layout]}`}
      aria-label={`${spread.name} spread`}
    >
      {drawn.map((drawnCard, index) => (
        <div
          key={drawnCard.position.id}
          className={styles.position}
          style={
            usesNamedAreas
              ? ({ "--grid-area": drawnCard.position.id } as CSSProperties)
              : undefined
          }
          title={drawnCard.position.hint}
        >
          <h3 className={styles.label}>{drawnCard.position.label}</h3>
          <span className="visually-hidden">{drawnCard.position.hint}</span>
          <TarotCardView
            drawn={drawnCard}
            dealIndex={index}
            onReveal={() => onReveal(index)}
            onOpen={() => onOpen(index)}
          />
        </div>
      ))}
    </div>
  );
}
