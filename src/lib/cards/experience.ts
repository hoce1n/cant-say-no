import type { Difficulty } from "./types";

export type DodgeConfig = {
  proximityDistance: number;
  escapeDistance: number;
  minimumScale: number;
  shrinkStep: number;
  viewportPadding: number;
  yesGrowStep: number;
  yesMaxScale: number;
};

export const difficultyConfig: Record<Difficulty, DodgeConfig> = {
  gentle: {
    proximityDistance: 88,
    escapeDistance: 108,
    minimumScale: 0.7,
    shrinkStep: 0.07,
    viewportPadding: 16,
    yesGrowStep: 0.06,
    yesMaxScale: 1.35,
  },
  classic: {
    proximityDistance: 120,
    escapeDistance: 150,
    minimumScale: 0.45,
    shrinkStep: 0.12,
    viewportPadding: 16,
    yesGrowStep: 0.1,
    yesMaxScale: 1.55,
  },
  ruthless: {
    proximityDistance: 168,
    escapeDistance: 210,
    minimumScale: 0.32,
    shrinkStep: 0.16,
    viewportPadding: 12,
    yesGrowStep: 0.14,
    yesMaxScale: 1.8,
  },
};

export const confettiExperience = {
  count: 72,
  durationMs: 2600,
  particleSize: { minimum: 6, maximum: 12 },
} as const;

export const difficultyCopy: Record<Difficulty, { label: string; hint: string }> = {
  gentle: { label: "Gentle", hint: "It flinches, then gives you a chance." },
  classic: { label: "Classic", hint: "The original runaway." },
  ruthless: { label: "Ruthless", hint: "Good luck even hovering near it." },
};
