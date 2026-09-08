import { useLayoutEffect, type ReactNode } from "react";
import type { Theme } from "@/lib/cards/types";
import { cn } from "@/lib/utils";

export function PaperStage({
  theme,
  children,
  className,
}: {
  theme: Theme;
  children: ReactNode;
  className?: string;
}) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    return () => {
      root.dataset.theme = "blush";
    };
  }, [theme]);

  return (
    <div
      data-theme={theme}
      className={cn("relative min-h-dvh bg-background text-foreground", className)}
    >
      <div className="paper-grain" aria-hidden="true" />
      {children}
    </div>
  );
}
