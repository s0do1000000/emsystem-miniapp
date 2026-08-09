type StrokeProps = {
  className?: string;
  width?: number;
};

/**
 * The single tapered stroke is EmSystem's signature device: it echoes one
 * hair-stroke of microblading. Used as a divider, an underline beneath
 * labels, and an animated accent under headlines.
 */
export default function Stroke({ className = "", width = 120 }: StrokeProps) {
  return (
    <svg
      viewBox="0 0 120 8"
      width={width}
      height={8}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        className="stroke-draw"
        d="M2 6.2C22 2.1 46 1 66 2.6C86 4.2 102 6.6 118 5.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        pathLength={1}
      />
    </svg>
  );
}
