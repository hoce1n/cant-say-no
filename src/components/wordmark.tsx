import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Wordmark({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      className={cn(
        "font-display text-[1.35rem] leading-none tracking-[-0.03em] text-foreground",
        className,
      )}
    >
      <span className="italic font-medium">Can't</span>
      <span className="font-medium"> Say No</span>
    </Link>
  );
}
