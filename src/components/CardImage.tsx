import { useState } from "react";
import { cardBackBase, cardImageBase } from "../domain/deck";
import type { TarotCard } from "../domain/types";
import styles from "./CardImage.module.css";

interface CardImageProps {
  card: TarotCard;
  className?: string;
  fileName?: string;
  loading?: "eager" | "lazy";
  decorative?: boolean;
}

export function CardImage({
  card,
  className,
  fileName = "card",
  loading = "lazy",
  decorative = false,
}: CardImageProps) {
  const [failed, setFailed] = useState(false);
  const base = cardImageBase(card);
  const alt = decorative ? "" : `${card.name} from the Thoth Tarot`;

  if (failed) {
    return (
      <div
        className={`${styles.frame} ${styles.placeholder} ${className ?? ""}`}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : alt}
      >
        <span className={styles.placeholderGlyph}>✦</span>
        <span className={styles.placeholderName}>{card.name}</span>
      </div>
    );
  }

  return (
    <picture className={`${styles.frame} ${className ?? ""}`}>
      <source srcSet={`${base}.avif`} type="image/avif" />
      <source srcSet={`${base}.webp`} type="image/webp" />
      <img
        className={styles.image}
        src={`${base}.webp`}
        alt={alt}
        width={278}
        height={408}
        loading={loading}
        decoding="async"
        data-file={fileName}
        onError={() => setFailed(true)}
      />
    </picture>
  );
}

interface CardBackProps {
  className?: string;
}

export function CardBack({ className }: CardBackProps) {
  const base = cardBackBase();

  return (
    <picture className={`${styles.frame} ${styles.backFrame} ${className ?? ""}`}>
      <source srcSet={`${base}.avif`} type="image/avif" />
      <img
        className={styles.image}
        src={`${base}.webp`}
        alt=""
        width={488}
        height={794}
        loading="eager"
        decoding="async"
        aria-hidden="true"
      />
    </picture>
  );
}
