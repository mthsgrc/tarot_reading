import { MAJOR_CARDS } from "../data/cards/majors";
import { SEPHIROTH } from "../domain/tree";
import type { Sephira } from "../domain/types";
import styles from "./TreeOfLifeDiagram.module.css";

const NODE_POSITIONS: Record<Sephira, { x: number; y: number }> = {
  kether: { x: 110, y: 24 },
  chokmah: { x: 46, y: 72 },
  binah: { x: 174, y: 72 },
  chesed: { x: 46, y: 138 },
  geburah: { x: 174, y: 138 },
  tiphareth: { x: 110, y: 184 },
  netzach: { x: 46, y: 238 },
  hod: { x: 174, y: 238 },
  yesod: { x: 110, y: 288 },
  malkuth: { x: 110, y: 334 },
};

interface TreeOfLifeDiagramProps {
  pathNumber?: number;
  sephira?: Sephira;
  className?: string;
}

export function TreeOfLifeDiagram({
  pathNumber,
  sephira,
  className,
}: TreeOfLifeDiagramProps) {
  const highlightedPath = pathNumber
    ? MAJOR_CARDS.find((card) => card.path.number === pathNumber)
    : undefined;

  const highlightedNodes = new Set<Sephira>();
  if (sephira) highlightedNodes.add(sephira);
  if (highlightedPath) {
    highlightedNodes.add(highlightedPath.path.from);
    highlightedNodes.add(highlightedPath.path.to);
  }

  const label = highlightedPath
    ? `${highlightedPath.name}: path ${highlightedPath.path.number} on the Tree of Life`
    : sephira
      ? `${sephira} on the Tree of Life`
      : "The Tree of Life";

  return (
    <svg
      className={`${styles.diagram} ${className ?? ""}`}
      viewBox="0 0 220 370"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>

      <g className={styles.paths}>
        {MAJOR_CARDS.map((card) => {
          const from = NODE_POSITIONS[card.path.from];
          const to = NODE_POSITIONS[card.path.to];
          const highlighted = card.path.number === pathNumber;

          return (
            <line
              key={card.id}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className={highlighted ? styles.pathHighlighted : styles.path}
            >
              <title>
                Path {card.path.number}: {card.name}
              </title>
            </line>
          );
        })}
      </g>

      <g className={styles.daath}>
        <circle cx="110" cy="132" r="10" />
        <text x="110" y="135">
          Da'ath
        </text>
      </g>

      <g>
        {SEPHIROTH.map((node) => {
          const position = NODE_POSITIONS[node.id];
          const highlighted = highlightedNodes.has(node.id);

          return (
            <g
              key={node.id}
              className={highlighted ? styles.nodeHighlighted : styles.node}
            >
              <circle cx={position.x} cy={position.y} r={highlighted ? 13 : 10} />
              <text
                x={position.x}
                y={position.y + (highlighted ? 26 : 23)}
                className={styles.nodeLabel}
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
