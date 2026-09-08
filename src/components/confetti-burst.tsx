import { useEffect, useMemo } from "react";
import { confettiExperience } from "@/lib/cards/experience";
import { themeDefinitions } from "@/lib/cards/themes";
import type { Theme } from "@/lib/cards/types";

type Piece = {
  id: number;
  color: string;
  x: number;
  drift: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  round: boolean;
};

export function ConfettiBurst({ theme }: { theme: Theme }) {
  const pieces = useMemo(() => {
    const colors = themeDefinitions[theme].confetti;
    return Array.from({ length: confettiExperience.count }, (_, id) => {
      const size =
        confettiExperience.particleSize.minimum +
        Math.random() *
          (confettiExperience.particleSize.maximum - confettiExperience.particleSize.minimum);
      return {
        id,
        color: colors[Math.floor(Math.random() * colors.length)] ?? colors[0],
        x: Math.random() * 100,
        drift: (Math.random() - 0.5) * 260,
        size,
        duration: confettiExperience.durationMs * (0.7 + Math.random() * 0.6),
        delay: Math.random() * 180,
        rotation: 540 + Math.random() * 540,
        round: Math.random() > 0.72,
      } satisfies Piece;
    });
  }, [theme]);

  useEffect(() => {
    return undefined;
  }, []);

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="confetti-piece"
          style={{
            backgroundColor: piece.color,
            borderRadius: piece.round ? "999px" : "2px",
            ["--confetti-x" as string]: `${piece.x}vw`,
            ["--confetti-drift" as string]: `${piece.drift}px`,
            ["--confetti-size" as string]: `${piece.size}px`,
            ["--confetti-duration" as string]: `${piece.duration}ms`,
            ["--confetti-delay" as string]: `${piece.delay}ms`,
            ["--confetti-rotation" as string]: `${piece.rotation}deg`,
          }}
        />
      ))}
    </div>
  );
}
