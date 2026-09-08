import { cn } from "@/lib/utils";

const links = [
  { href: "https://github.com/hoce1n", label: "GitHub" },
  { href: "https://www.linkedin.com/in/hocein/", label: "LinkedIn" },
  { href: "https://instagram.com/hoce1n", label: "Instagram" },
  { href: "https://t.me/hoce1n", label: "Telegram" },
] as const;

export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "relative z-20 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-6 text-xs font-medium text-muted-foreground",
        className,
      )}
      aria-label="Creator credits"
    >
      <span>built by hocein</span>
      <span aria-hidden="true">·</span>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-transparent underline-offset-2 transition-colors duration-[var(--motion-quick)] hover:text-foreground hover:decoration-current"
        >
          {link.label}
        </a>
      ))}
    </footer>
  );
}
