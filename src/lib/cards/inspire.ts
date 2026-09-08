import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { VIBES, type Vibe } from "./types";

const Input = z.object({
  vibe: z.enum(VIBES),
  hint: z.string().max(180).optional(),
});

const Output = z.object({
  question: z.string().min(1).max(180),
  yesLabel: z.string().min(1).max(40),
  noLabel: z.string().min(1).max(40),
  successMessage: z.string().min(1).max(180),
});

export type InspireResult =
  | { ok: true; card: z.infer<typeof Output> }
  | { ok: false; error: string };

export const inspireCard = createServerFn({ method: "POST" })
  .validator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<InspireResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "Inspiration is taking a rest." };
    }

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.95,
        max_tokens: 220,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You write short, sincere invitations someone would send to a person they like. Return JSON only.",
          },
          {
            role: "user",
            content: buildPrompt(data.vibe, data.hint),
          },
        ],
      }),
    });

    if (!res.ok) {
      return { ok: false, error: "Could not write a new question right now." };
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content ?? "";
    try {
      const parsed = Output.parse(JSON.parse(stripFences(text)));
      return { ok: true, card: parsed };
    } catch {
      return { ok: false, error: "That draft didn't land. Try again." };
    }
  });

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function buildPrompt(vibe: Vibe, hint: string | undefined): string {
  const hintLine = hint?.trim() ? `Hint from the sender: ${hint.trim()}\n` : "";
  return `${hintLine}Vibe: ${vibe}

Return JSON with keys: question, yesLabel, noLabel, successMessage.
Rules:
- No emojis, hashtags, or quotation marks wrapping the whole sentence
- Question is one specific invitation, max 90 characters
- yesLabel and noLabel are 2–18 characters, like spoken answers
- successMessage is warm, one sentence, max 90 characters
- Do not mention AI, apps, or buttons`;
}
