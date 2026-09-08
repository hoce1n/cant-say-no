import type { Theme } from "./types";

export type ThemeDefinition = {
  label: string;
  colorScheme: "light" | "dark";
  swatch: string;
  confetti: readonly string[];
};

export const DEFAULT_THEME: Theme = "blush";

export const themeDefinitions: Record<Theme, ThemeDefinition> = {
  blush: {
    label: "Blush",
    colorScheme: "light",
    swatch: "#9d3d42",
    confetti: ["#9d3d42", "#c17b7e", "#2f6b4f", "#d4b59a", "#2c1f1a", "#f3ece4"],
  },
  sage: {
    label: "Sage",
    colorScheme: "light",
    swatch: "#3f6b54",
    confetti: ["#3f6b54", "#9d3d42", "#d4c4a8", "#243028", "#7a8f7a", "#e7eee4"],
  },
  linen: {
    label: "Linen",
    colorScheme: "light",
    swatch: "#6b5344",
    confetti: ["#6b5344", "#a14d4a", "#3d6a4f", "#c4a574", "#2a241c", "#efe6d6"],
  },
  dusk: {
    label: "Dusk",
    colorScheme: "dark",
    swatch: "#8fa3c4",
    confetti: ["#8fa3c4", "#c17b7e", "#6fbf97", "#ece8e1", "#3a4258", "#14161c"],
  },
  noir: {
    label: "Noir",
    colorScheme: "dark",
    swatch: "#d4c4b0",
    confetti: ["#d4c4b0", "#e07a86", "#5dba8d", "#f4efe8", "#3a3344", "#121015"],
  },
};

export function resolveTheme(theme: Theme | undefined): Theme {
  return theme ?? DEFAULT_THEME;
}
