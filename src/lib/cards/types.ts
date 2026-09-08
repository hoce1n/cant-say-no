export const THEMES = ["blush", "sage", "linen", "dusk", "noir"] as const;
export type Theme = (typeof THEMES)[number];

export const DIFFICULTIES = ["gentle", "classic", "ruthless"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const VIBES = ["romantic", "playful", "cozy", "cinematic", "bold"] as const;
export type Vibe = (typeof VIBES)[number];

export type Card = {
  id: string;
  pageTitle: string;
  question: string;
  responseOptionsLabel: string;
  yesLabel: string;
  noLabel: string;
  successMessage: string;
  theme: Theme;
  difficulty: Difficulty;
  kicker?: string;
};

export const TEXT_LIMITS = {
  question: 180,
  successMessage: 180,
  yesLabel: 40,
  noLabel: 40,
  pageTitle: 80,
} as const;

export function isTheme(value: string | undefined): value is Theme {
  return THEMES.includes(value as Theme);
}

export function isDifficulty(value: string | undefined): value is Difficulty {
  return DIFFICULTIES.includes(value as Difficulty);
}
