interface HexagramProps {
  className?: string;
  title?: string;
  decorative?: boolean;
}

export function Hexagram({
  className,
  title = "Hexagram",
  decorative = false,
}: HexagramProps) {
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
        opacity="0.45"
      />
      <path
        d="M50 6 88 72H12L50 6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M50 94 12 28h76L50 94Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="5.5" fill="currentColor" />
    </svg>
  );
}
