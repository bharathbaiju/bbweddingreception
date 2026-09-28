import { useMemo } from "react";

/** Slow golden petals + dust drifting down the page. Purely decorative. */
export function Petals({ count = 18 }: { count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i * 97) % 100,
        size: 6 + ((i * 13) % 12),
        duration: 16 + ((i * 7) % 16),
        delay: -((i * 5) % 22),
        drift: ((i % 5) - 2) * 40,
        opacity: 0.25 + ((i % 4) * 0.12),
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20 overflow-hidden">
      {petals.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.62,
            background:
              "radial-gradient(circle at 30% 30%, oklch(0.97 0.06 92), oklch(0.78 0.13 84))",
            borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
            opacity: p.opacity,
            filter: "blur(0.3px)",
            animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
