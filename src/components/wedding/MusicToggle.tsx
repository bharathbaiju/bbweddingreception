import { useCallback, useEffect, useRef, useState } from "react";
import { Music2, Pause } from "lucide-react";

/**
 * Ambient wedding score: "Divenire" (Ludovico Einaudi), performed by
 * Mari Samuelsen, Håkon Samuelsen & the Royal Liverpool Philharmonic
 * Orchestra. Trimmed to start partway in and loops with a short
 * fade-out/fade-in at the seam.
 */
const TRACK_SRC = "/audio/divenire.mp3";
const VOLUME = 0.55;

export function useAmbientMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio(TRACK_SRC);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = VOLUME;
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const start = useCallback(() => {
    const audio = getAudio();
    audio.play().catch(() => setPlaying(false));
    setPlaying(true);
  }, [getAudio]);

  useEffect(() => () => audioRef.current?.pause(), []);

  return { playing, start, stop, toggle: () => (playing ? stop() : start()) };
}

export function MusicToggle({
  playing,
  onToggle,
}: {
  playing: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={playing ? "Pause music" : "Play music"}
      className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card/85 text-gold-deep shadow-[var(--shadow-soft)] backdrop-blur transition-transform hover:scale-110"
    >
      {playing ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Music2 className="h-4 w-4" />
      )}
      {playing && (
        <span
          className="absolute inset-0 rounded-full border border-border"
          style={{ animation: "shimmer-pulse 2.4s ease-in-out infinite" }}
        />
      )}
    </button>
  );
}
