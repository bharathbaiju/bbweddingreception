import { useMemo } from "react";
import { Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Particle = {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
  duration: number;
  spin: number;
};

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360 + (Math.random() * 26 - 13);
    return {
      id: i,
      angle,
      distance: 70 + Math.random() * 90,
      size: 9 + Math.random() * 9,
      delay: Math.random() * 0.12,
      duration: 0.85 + Math.random() * 0.55,
      spin: Math.random() * 360,
    };
  });
}

/**
 * A one-shot burst of gold particles radiating from the center of its
 * (relatively/absolutely positioned) parent. Bump `trigger` to fire again —
 * renders nothing while `trigger` is 0.
 */
export function ConfettiBurst({
  trigger,
  count = 20,
  icon = "dot",
  className,
}: {
  trigger: number;
  count?: number;
  icon?: "dot" | "heart" | "sparkle";
  className?: string;
}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- regenerate only when a new burst fires
  const particles = useMemo(() => makeParticles(count), [trigger]);
  if (!trigger) return null;

  return (
    <div
      key={trigger}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-30 overflow-visible", className)}
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute left-1/2 top-1/2"
          style={{
            animation: `burst-fly ${p.duration}s cubic-bezier(0.15,0.7,0.3,1) ${p.delay}s forwards`,
            ["--tx" as string]: `${Math.cos((p.angle * Math.PI) / 180) * p.distance}px`,
            ["--ty" as string]: `${Math.sin((p.angle * Math.PI) / 180) * p.distance}px`,
            ["--spin" as string]: `${p.spin}deg`,
          }}
        >
          {icon === "heart" ? (
            <Heart
              className="text-gold-deep"
              style={{ width: p.size, height: p.size }}
              fill="currentColor"
            />
          ) : icon === "sparkle" ? (
            <Sparkles className="text-gold" style={{ width: p.size, height: p.size }} />
          ) : (
            <span
              className="block rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background:
                  "radial-gradient(circle at 30% 30%, oklch(0.97 0.06 92), oklch(0.72 0.14 82))",
              }}
            />
          )}
        </span>
      ))}
    </div>
  );
}
