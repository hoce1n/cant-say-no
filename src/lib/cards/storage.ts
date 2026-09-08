import type { Card, Theme } from "./types";

const RECENTS_KEY = "csn:recents";
const SOUND_KEY = "csn:sound";
const MAX_RECENTS = 8;

export type RecentCard = {
  question: string;
  theme: Theme;
  payload: string;
  createdAt: number;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function loadRecents(): RecentCard[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentCard[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.question === "string" &&
        typeof item.payload === "string" &&
        typeof item.theme === "string" &&
        typeof item.createdAt === "number",
    );
  } catch {
    return [];
  }
}

export function saveRecent(card: Card, payload: string): void {
  if (!canUseStorage()) return;
  const next: RecentCard[] = [
    {
      question: card.question,
      theme: card.theme,
      payload,
      createdAt: Date.now(),
    },
    ...loadRecents().filter((item) => item.payload !== payload),
  ].slice(0, MAX_RECENTS);
  window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
}

export function loadSoundEnabled(): boolean {
  if (!canUseStorage()) return true;
  const raw = window.localStorage.getItem(SOUND_KEY);
  if (raw === "0") return false;
  return true;
}

export function saveSoundEnabled(enabled: boolean): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(SOUND_KEY, enabled ? "1" : "0");
}
