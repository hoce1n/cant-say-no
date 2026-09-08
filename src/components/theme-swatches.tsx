import { themeDefinitions } from "@/lib/cards/themes";
import { THEMES, type Theme } from "@/lib/cards/types";
import { cn } from "@/lib/utils";

export function ThemeSwatches({
  value,
  onChange,
}: {
  value: Theme;
  onChange: (theme: Theme) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Paper theme">
      {THEMES.map((theme) => {
        const def = themeDefinitions[theme];
        const selected = value === theme;
        return (
          <button
            key={theme}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(theme)}
            className={cn(
              "flex h-11 items-center gap-2 rounded-[12px] bg-card px-3 text-sm font-medium shadow-[var(--shadow-border)]",
              "transition-[box-shadow,transform] duration-[var(--motion-quick)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected && "shadow-[var(--shadow-border-hover)] ring-1 ring-foreground/20",
            )}
          >
            <span
              className="size-3.5 rounded-full"
              style={{ backgroundColor: def.swatch }}
              aria-hidden="true"
            />
            {def.label}
          </button>
        );
      })}
    </div>
  );
}
