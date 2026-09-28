import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfettiBurst } from "./ConfettiBurst";

const REVEAL_THRESHOLD = 0.35;
const BRUSH_RADIUS = 52;

/** Paints the gold-foil scratch layer onto the given canvas. */
function paintFoil(canvas: HTMLCanvasElement, label: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;

  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#8a5a24");
  gradient.addColorStop(0.35, "#e9c876");
  gradient.addColorStop(0.55, "#fdf6e3");
  gradient.addColorStop(0.8, "#dcb567");
  gradient.addColorStop(1, "#7c5222");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.16)";
  for (let i = 0; i < 45; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.beginPath();
    ctx.arc(x, y, 1 + Math.random() * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(70,45,15,0.85)";
  const fontSize = Math.max(14, Math.round(width * 0.055));
  ctx.font = `${fontSize}px Georgia, 'Times New Roman', serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, width / 2, height / 2 - fontSize * 0.7);
  ctx.font = `${Math.max(11, Math.round(fontSize * 0.5))}px Georgia, serif`;
  ctx.fillText("✦ scratch to reveal ✦", width / 2, height / 2 + fontSize * 0.6);
}

export function ScratchReveal({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const revealedRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);
  const [burst, setBurst] = useState(0);

  const size = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    paintFoil(canvas, label);
  }, [label]);

  useEffect(() => {
    size();
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      if (!revealedRef.current) size();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [size]);

  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setFading(true);
    setBurst((n) => n + 1);
    window.setTimeout(() => setGone(true), 500);
  }, []);

  const checkProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || revealedRef.current) return;
    const sampleSize = 24;
    const sample = document.createElement("canvas");
    sample.width = sampleSize;
    sample.height = sampleSize;
    const sctx = sample.getContext("2d");
    if (!sctx) return;
    sctx.drawImage(canvas, 0, 0, sampleSize, sampleSize);
    const data = sctx.getImageData(0, 0, sampleSize, sampleSize).data;
    let clear = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i]! < 40) clear++;
    if (clear / (sampleSize * sampleSize) > REVEAL_THRESHOLD) reveal();
  }, [reveal]);

  const scratchAt = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || revealedRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const r = BRUSH_RADIUS * (canvas.width / rect.width);

    ctx.globalCompositeOperation = "destination-out";
    const last = lastPointRef.current;
    if (last) {
      // stroke a thick line from the last point so a fast swipe leaves one
      // continuous cleared band instead of separated dots
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = r * 2;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    lastPointRef.current = { x, y };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    lastPointRef.current = null;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    scratchAt(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    scratchAt(e.clientX, e.clientY);
    checkProgress();
  };
  const onPointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    checkProgress();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      reveal();
    }
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      {children}
      <ConfettiBurst trigger={burst} icon="sparkle" count={16} />
      {!gone && (
        <canvas
          ref={canvasRef}
          role="button"
          tabIndex={0}
          aria-label={`Scratch to reveal ${label} details`}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="absolute inset-0 h-full w-full cursor-pointer touch-none rounded-[inherit]"
          style={{ opacity: fading ? 0 : 1, transition: "opacity 500ms ease" }}
        />
      )}
      {!gone && (
        <span
          className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/70 px-2.5 py-1 text-[0.58rem] tracking-[0.16em] text-gold-deep uppercase opacity-0 transition-opacity duration-500"
          style={{ opacity: fading ? 0 : 1 }}
        >
          <Sparkles className="h-3 w-3" /> Scratch me
        </span>
      )}
    </div>
  );
}
