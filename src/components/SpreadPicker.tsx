import type { Spread } from "../domain/types";
import styles from "./SpreadPicker.module.css";

interface SpreadPickerProps {
  spreads: readonly Spread[];
  selectedId: string;
  onChange: (spreadId: string) => void;
}

export function SpreadPicker({ spreads, selectedId, onChange }: SpreadPickerProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Choose a spread</legend>
      <div className={styles.grid}>
        {spreads.map((spread) => {
          const selected = spread.id === selectedId;
          return (
            <label
              key={spread.id}
              className={`${styles.option} ${selected ? styles.selected : ""}`}
            >
              <input
                className="visually-hidden"
                type="radio"
                name="spread"
                value={spread.id}
                checked={selected}
                onChange={() => onChange(spread.id)}
              />
              <span className={styles.optionHead}>
                <span className={styles.optionName}>{spread.name}</span>
                <span className={styles.count}>{spread.positions.length} cards</span>
              </span>
              <span className={styles.subtitle}>{spread.subtitle}</span>
              <span className={styles.description}>{spread.description}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
