import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loadRecents, type RecentCard } from "@/lib/cards/storage";
import { themeDefinitions } from "@/lib/cards/themes";

export function RecentCards() {
  const [recents, setRecents] = useState<RecentCard[]>([]);

  useEffect(() => {
    setRecents(loadRecents());
  }, []);

  if (recents.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-medium tracking-[-0.02em]">Recently made</h2>
      <ul className="mt-4 grid gap-2">
        {recents.map((item) => (
          <li key={item.payload}>
            <Link
              to="/c"
              search={{ p: item.payload }}
              className="flex items-center gap-3 rounded-[16px] bg-card px-4 py-3 shadow-[var(--shadow-border)] transition-[box-shadow] duration-[var(--motion-quick)] hover:shadow-[var(--shadow-border-hover)]"
            >
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: themeDefinitions[item.theme]?.swatch ?? "#9d3d42" }}
                aria-hidden="true"
              />
              <span className="truncate text-sm">{item.question}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
