interface ChaosStarProps {
  className?: string;
  title?: string;
  decorative?: boolean;
}

const ARROWS = Array.from({ length: 8 }, (_, index) => index * 45);

/** An original eight-arrow chaos star, drawn for this app. */
export function ChaosStar({
  className,
  title = "Chaos star",
  decorative = false,
}: ChaosStarProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.35"
      />
      {ARROWS.map((angle) => (
        <g key={angle} transform={`rotate(${angle} 50 50)`}>
          <path d="M50 50V9" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M44 17 50 7l6 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
      <circle cx="50" cy="50" r="4.5" fill="currentColor" />
    </svg>
  );
}
