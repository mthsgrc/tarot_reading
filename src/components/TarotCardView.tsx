import type { CSSProperties } from "react";
import type { DrawnCard } from "../domain/types";
import { CardBack, CardImage } from "./CardImage";
import styles from "./TarotCardView.module.css";

interface TarotCardViewProps {
  drawn: DrawnCard;
  dealIndex?: number;
  onReveal: () => void;
  onOpen: () => void;
}

export function TarotCardView({
  drawn,
  dealIndex = 0,
  onReveal,
  onOpen,
}: TarotCardViewProps) {
  const { card, position, orientation, revealed } = drawn;
  const isShadow = orientation === "shadow";

  const label = revealed
    ? `Open details for ${card.name}, ${isShadow ? "shadow" : "upright"}, in the ${position.label} position`
    : `Reveal the card in the ${position.label} position`;

  const style = {
    "--deal-delay": `${dealIndex * 80}ms`,
  } as CSSProperties;

  return (
    <div className={styles.slot} style={style}>
      <button
        type="button"
        className={styles.cardButton}
        onClick={revealed ? onOpen : onReveal}
        aria-label={label}
      >
        <span className={styles.perspective}>
          <span className={`${styles.inner} ${revealed ? styles.isFlipped : ""}`}>
            <span className={`${styles.face} ${styles.backFace}`}>
              <CardBack />
              <span className={styles.backSigil} aria-hidden="true">
                ✦
              </span>
            </span>
            <span className={`${styles.face} ${styles.frontFace}`}>
              <CardImage
                card={card}
                decorative
                loading={dealIndex < 3 ? "eager" : "lazy"}
                className={isShadow ? styles.shadowImage : undefined}
              />
              {isShadow && <span className={styles.shadowBadge}>Shadow</span>}
              <span className={styles.openHint} aria-hidden="true">
                Read meaning
              </span>
            </span>
          </span>
        </span>
      </button>

      <p className={styles.caption}>
        <span className={styles.captionName}>{revealed ? card.name : "Face down"}</span>
        {revealed && (
          <span className={styles.captionMeta}>{isShadow ? "Shadow" : "Upright"}</span>
        )}
      </p>
    </div>
  );
}
