import { useEffect, useState } from "react";
import { WEDDING_DATE } from "@/lib/wedding-data";

const units = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const;

function diff() {
  const ms = Math.max(0, WEDDING_DATE.getTime() - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000) % 24,
    minutes: Math.floor(ms / 60000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  };
}

export function Countdown() {
  const [t, setT] = useState(() => diff());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = window.setInterval(() => setT(diff()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
      {units.map((u) => (
        <div
          key={u.key}
          className="surface-card ornament-frame flex h-20 w-20 flex-col items-center justify-center sm:h-28 sm:w-28"
        >
          <span className="font-display text-3xl leading-none sm:text-5xl">
            <span className="text-gold">
              {mounted ? String(t[u.key]).padStart(2, "0") : "--"}
            </span>
          </span>
          <span className="mt-1 text-[0.55rem] tracking-[0.3em] text-muted-foreground uppercase sm:text-[0.62rem]">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
