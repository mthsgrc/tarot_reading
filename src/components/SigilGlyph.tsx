import { useId } from "react";
import styles from "./SigilGlyph.module.css";

interface SigilGlyphProps {
  paths: readonly string[];
  label: string;
  className?: string;
}

/** Renders the deterministic paths from the domain layer; it owns no rules. */
export function SigilGlyph({ paths, label, className }: SigilGlyphProps) {
  const titleId = useId();

  return (
    <svg
      className={`${styles.glyph} ${className ?? ""}`}
      viewBox="0 0 100 100"
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>{label}</title>
      <circle
        className={styles.ring}
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
      />
      {paths.map((path, index) => (
        <path
          key={index}
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth={index === 0 ? 2 : 1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={index === 0 ? 1 : 0.48}
        />
      ))}
      <circle cx="50" cy="50" r="1.8" fill="currentColor" />
    </svg>
  );
}
