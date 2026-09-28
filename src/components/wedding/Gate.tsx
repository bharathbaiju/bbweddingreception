import { useState } from "react";
import { Monogram } from "./Monogram";
import { ConfettiBurst } from "./ConfettiBurst";
import { COUPLE } from "@/lib/wedding-data";

/** Opening monogram curtain. Tapping the seal opens the invitation. */
export function Gate({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);
  const [burst, setBurst] = useState(0);

  const open = () => {
    if (opening) return;
    setOpening(true);
    setBurst((n) => n + 1);
    window.setTimeout(onOpen, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <ConfettiBurst trigger={burst} icon="sparkle" count={30} />
      {["left", "right"].map((side) => (
        <div
          key={side}
          className="absolute top-0 h-full w-1/2"
          style={{
            [side]: 0,
            background:
              side === "left"
                ? "linear-gradient(100deg, oklch(0.94 0.05 86), oklch(0.985 0.025 90))"
                : "linear-gradient(260deg, oklch(0.94 0.05 86), oklch(0.985 0.025 90))",
            boxShadow: "inset 0 0 120px oklch(0.8 0.09 82 / 0.4)",
            animation: opening
              ? `veil-open-${side} 1.5s cubic-bezier(0.76, 0, 0.24, 1) forwards`
              : undefined,
          }}
        />
      ))}

      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-all duration-700"
        style={{ opacity: opening ? 0 : 1, transform: opening ? "scale(1.12)" : "none" }}
      >
        <p className="eyebrow mb-6">Together with their families</p>

        <button
          type="button"
          onClick={open}
          aria-label="Open the invitation"
          className="group relative"
        >
          <span
            className="absolute -inset-6 rounded-full"
            style={{
              background: "radial-gradient(circle, oklch(0.9 0.09 88 / 0.55), transparent 70%)",
              animation: "shimmer-pulse 3.6s ease-in-out infinite",
            }}
          />
          <Monogram
            animate
            className="relative h-48 w-48 transition-transform duration-700 group-hover:scale-105 sm:h-60 sm:w-60"
          />
        </button>

        <p className="mt-8 font-display text-4xl tracking-[0.12em] sm:text-6xl">
          <span className="text-gold">
            {COUPLE.groom} &amp; {COUPLE.bride}
          </span>
        </p>
        <p className="mt-3 text-sm tracking-[0.35em] text-muted-foreground uppercase">
          24 · 10 · 2026
        </p>

        <button type="button" onClick={open} className="btn-gold mt-10">
          Open our invitation
        </button>
        <p className="mt-4 text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Tap the monogram
        </p>
      </div>
    </div>
  );
}
