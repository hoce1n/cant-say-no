import { Link } from "@tanstack/react-router";
import { templates } from "@/lib/cards/templates";
import { themeDefinitions } from "@/lib/cards/themes";
import { cn } from "@/lib/utils";

export function TemplateGrid({ className }: { className?: string }) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {templates.map((card) => (
        <li key={card.id}>
          <Link
            to="/cards/$cardId"
            params={{ cardId: card.id }}
            className="group flex h-full flex-col rounded-[22px] bg-card px-5 py-5 shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-[var(--motion-fast)] ease-[var(--ease-out)] hover:shadow-[var(--shadow-border-hover)] hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {card.kicker}
              </p>
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: themeDefinitions[card.theme].swatch }}
                aria-hidden="true"
              />
            </div>
            <p className="mt-3 font-display text-xl font-medium leading-snug tracking-[-0.02em] text-balance">
              {card.question}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {card.yesLabel}
              <span className="mx-1.5 opacity-40">/</span>
              {card.noLabel}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
