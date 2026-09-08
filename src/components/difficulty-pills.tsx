import { DIFFICULTIES, type Difficulty } from "@/lib/cards/types";
import { difficultyCopy } from "@/lib/cards/experience";
import { cn } from "@/lib/utils";

export function DifficultyPills({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}) {
  return (
    <div>
      <div
        className="grid grid-cols-3 gap-1 rounded-[16px] bg-card p-1 shadow-[var(--shadow-border)]"
        role="radiogroup"
        aria-label="How slippery is no"
      >
        {DIFFICULTIES.map((difficulty) => {
          const selected = value === difficulty;
          return (
            <button
              key={difficulty}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(difficulty)}
              className={cn(
                "h-10 rounded-[12px] text-sm font-medium text-muted-foreground transition-colors duration-[var(--motion-quick)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected && "bg-background text-foreground shadow-[var(--shadow-border)]",
              )}
            >
              {difficultyCopy[difficulty].label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{difficultyCopy[value].hint}</p>
    </div>
  );
}
