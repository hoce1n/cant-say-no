import { useNavigate } from "@tanstack/react-router";
import { PenLine } from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { DifficultyPills } from "@/components/difficulty-pills";
import { QuestionCard } from "@/components/question-card";
import { ThemeSwatches } from "@/components/theme-swatches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cardFromFields, customCardPath, encodeShare } from "@/lib/cards/codec";
import { inspireCard } from "@/lib/cards/inspire";
import { saveRecent } from "@/lib/cards/storage";
import { defaultCard } from "@/lib/cards/templates";
import { TEXT_LIMITS, VIBES, type Difficulty, type Theme, type Vibe } from "@/lib/cards/types";
import { cn } from "@/lib/utils";

export function Studio({
  initial,
}: {
  initial?: {
    question?: string;
    yesLabel?: string;
    noLabel?: string;
    successMessage?: string;
    theme?: Theme;
    difficulty?: Difficulty;
  };
}) {
  const navigate = useNavigate();
  const [question, setQuestion] = useState(initial?.question ?? defaultCard.question);
  const [yesLabel, setYesLabel] = useState(initial?.yesLabel ?? defaultCard.yesLabel);
  const [noLabel, setNoLabel] = useState(initial?.noLabel ?? defaultCard.noLabel);
  const [successMessage, setSuccessMessage] = useState(
    initial?.successMessage ?? defaultCard.successMessage,
  );
  const [theme, setTheme] = useState<Theme>(initial?.theme ?? defaultCard.theme);
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initial?.difficulty ?? defaultCard.difficulty,
  );
  const [vibe, setVibe] = useState<Vibe>("romantic");
  const [inspiring, setInspiring] = useState(false);

  const card = useMemo(
    () =>
      cardFromFields({
        question,
        yesLabel,
        noLabel,
        successMessage,
        theme,
        difficulty,
      }),
    [question, yesLabel, noLabel, successMessage, theme, difficulty],
  );

  async function onInspire() {
    if (inspiring) return;
    setInspiring(true);
    try {
      const result = await inspireCard({
        data: { vibe, hint: question.slice(0, 180) },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setQuestion(result.card.question);
      setYesLabel(result.card.yesLabel);
      setNoLabel(result.card.noLabel);
      setSuccessMessage(result.card.successMessage);
      toast.success("A new draft is on the paper.");
    } catch {
      toast.error("Inspiration is taking a rest.");
    } finally {
      setInspiring(false);
    }
  }

  function onCreate(event: FormEvent) {
    event.preventDefault();
    const payload = encodeShare(card);
    saveRecent(card, payload);
    void navigate({ to: "/c", search: { p: payload } });
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-10">
      <form className="order-2 flex flex-col gap-5 lg:order-1" onSubmit={onCreate}>
        <div className="rounded-[24px] bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-medium tracking-[-0.02em]">Write it</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                The no button will run. The link will not need an account.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            <Field label="Question" htmlFor="question" count={`${question.length}/${TEXT_LIMITS.question}`}>
              <Textarea
                id="question"
                required
                maxLength={TEXT_LIMITS.question}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Yes" htmlFor="yes">
                <Input
                  id="yes"
                  required
                  maxLength={TEXT_LIMITS.yesLabel}
                  value={yesLabel}
                  onChange={(event) => setYesLabel(event.target.value)}
                />
              </Field>
              <Field label="No" htmlFor="no">
                <Input
                  id="no"
                  required
                  maxLength={TEXT_LIMITS.noLabel}
                  value={noLabel}
                  onChange={(event) => setNoLabel(event.target.value)}
                />
              </Field>
            </div>

            <Field
              label="If they say yes"
              htmlFor="success"
              count={`${successMessage.length}/${TEXT_LIMITS.successMessage}`}
            >
              <Textarea
                id="success"
                required
                maxLength={TEXT_LIMITS.successMessage}
                value={successMessage}
                onChange={(event) => setSuccessMessage(event.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-[24px] bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
          <p className="text-sm font-medium">Paper</p>
          <div className="mt-3">
            <ThemeSwatches value={theme} onChange={setTheme} />
          </div>
          <p className="mt-5 text-sm font-medium">How slippery is no</p>
          <div className="mt-3">
            <DifficultyPills value={difficulty} onChange={setDifficulty} />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Create shareable card
        </Button>

        <div className="rounded-[24px] bg-card p-5 shadow-[var(--shadow-border)] sm:p-6">
          <p className="text-sm font-medium">Need a better line?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a vibe. We'll draft a question, labels, and a yes message.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Vibe">
            {VIBES.map((item) => (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={vibe === item}
                onClick={() => setVibe(item)}
                className={cn(
                  "h-9 rounded-full px-3 text-sm capitalize text-muted-foreground shadow-[var(--shadow-border)]",
                  "transition-colors duration-[var(--motion-quick)]",
                  vibe === item && "bg-foreground text-background shadow-none",
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full"
            disabled={inspiring}
            onClick={() => void onInspire()}
          >
            <PenLine />
            {inspiring ? "Writing…" : "Inspire me"}
          </Button>
        </div>
      </form>

      <div className="order-1 lg:order-2 lg:sticky lg:top-6">
        <p className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Live preview
        </p>
        <QuestionCard card={card} contained preview />
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  count,
  children,
}: {
  label: string;
  htmlFor: string;
  count?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor}>{label}</Label>
        {count ? <span className="text-xs tabular-nums text-muted-foreground">{count}</span> : null}
      </div>
      {children}
    </div>
  );
}
