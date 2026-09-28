import { cn } from "@/lib/utils";

/** Hand-drawn B & B monogram inside a gold ring. */
export function Monogram({
  className,
  animate = false,
}: {
  className?: string;
  animate?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 220 220"
      className={cn("h-40 w-40", className)}
      role="img"
      aria-label="B and B monogram"
    >
      <defs>
        <linearGradient id="mg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.58 0.1 66)" />
          <stop offset="35%" stopColor="oklch(0.88 0.13 90)" />
          <stop offset="55%" stopColor="oklch(0.98 0.04 95)" />
          <stop offset="80%" stopColor="oklch(0.8 0.14 84)" />
          <stop offset="100%" stopColor="oklch(0.55 0.1 64)" />
        </linearGradient>
      </defs>

      <circle
        cx="110"
        cy="110"
        r="98"
        fill="none"
        stroke="url(#mg-gold)"
        strokeWidth="1.2"
        opacity="0.75"
      />
      <circle
        cx="110"
        cy="110"
        r="90"
        fill="none"
        stroke="url(#mg-gold)"
        strokeWidth="0.6"
        strokeDasharray="2 7"
        opacity="0.9"
        style={
          animate
            ? { transformOrigin: "110px 110px", animation: "ring-spin 40s linear infinite" }
            : undefined
        }
      />

      <g
        fill="url(#mg-gold)"
        fontFamily="Cormorant Garamond, Georgia, serif"
        textAnchor="middle"
        style={animate ? { animation: "float-slow 6s ease-in-out infinite" } : undefined}
      >
        <text x="66" y="142" fontSize="96" fontWeight="500">
          B
        </text>
        <text x="154" y="142" fontSize="96" fontWeight="500">
          B
        </text>

        <text
          x="110"
          y="130"
          fontSize="46"
          fontFamily="Great Vibes, cursive"
          opacity="0.95"
        >
          &amp;
        </text>
      </g>


      <path
        d="M52 178 q58 22 116 0"
        fill="none"
        stroke="url(#mg-gold)"
        strokeWidth="0.9"
        opacity="0.8"
      />
    </svg>
  );
}
