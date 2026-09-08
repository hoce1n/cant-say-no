import {
  TEXT_LIMITS,
  isDifficulty,
  isTheme,
  type Card,
  type Difficulty,
  type Theme,
} from "./types";
import { defaultCard } from "./templates";
import { DEFAULT_THEME } from "./themes";

type SharePayload = {
  q: string;
  y: string;
  n: string;
  s: string;
  t: Theme;
  d: Difficulty;
};

function clip(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(token: string): Uint8Array {
  const padded = token.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((token.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function cardFromFields(input: {
  question?: string;
  yesLabel?: string;
  noLabel?: string;
  successMessage?: string;
  theme?: string;
  difficulty?: string;
  pageTitle?: string;
}): Card {
  return {
    id: "custom",
    pageTitle: clip(input.pageTitle ?? "A question for you", TEXT_LIMITS.pageTitle) || defaultCard.pageTitle,
    question: clip(input.question ?? "", TEXT_LIMITS.question) || defaultCard.question,
    responseOptionsLabel: "Response options",
    yesLabel: clip(input.yesLabel ?? "", TEXT_LIMITS.yesLabel) || defaultCard.yesLabel,
    noLabel: clip(input.noLabel ?? "", TEXT_LIMITS.noLabel) || defaultCard.noLabel,
    successMessage: clip(input.successMessage ?? "", TEXT_LIMITS.successMessage) || defaultCard.successMessage,
    theme: isTheme(input.theme) ? input.theme : DEFAULT_THEME,
    difficulty: isDifficulty(input.difficulty) ? input.difficulty : "classic",
    kicker: "A custom question",
  };
}

export function encodeShare(card: Card): string {
  const payload: SharePayload = {
    q: clip(card.question, TEXT_LIMITS.question),
    y: clip(card.yesLabel, TEXT_LIMITS.yesLabel),
    n: clip(card.noLabel, TEXT_LIMITS.noLabel),
    s: clip(card.successMessage, TEXT_LIMITS.successMessage),
    t: isTheme(card.theme) ? card.theme : DEFAULT_THEME,
    d: isDifficulty(card.difficulty) ? card.difficulty : "classic",
  };
  return toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

export function decodeShare(token: string | undefined): Card | null {
  if (!token) return null;
  try {
    const json = new TextDecoder().decode(fromBase64Url(token));
    const raw = JSON.parse(json) as Partial<SharePayload>;
    if (typeof raw.q !== "string") return null;
    return cardFromFields({
      question: raw.q,
      yesLabel: typeof raw.y === "string" ? raw.y : undefined,
      noLabel: typeof raw.n === "string" ? raw.n : undefined,
      successMessage: typeof raw.s === "string" ? raw.s : undefined,
      theme: raw.t,
      difficulty: raw.d,
    });
  } catch {
    return null;
  }
}

export function customCardPath(card: Card): string {
  return `/c?p=${encodeShare(card)}`;
}
