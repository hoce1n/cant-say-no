import { Link } from "@tanstack/react-router";
import { Check, Copy, RotateCcw, Share2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { toast } from "sonner";
import { ConfettiBurst } from "@/components/confetti-burst";
import { Button } from "@/components/ui/button";
import { playDodge, playYes } from "@/lib/cards/audio";
import { difficultyConfig } from "@/lib/cards/experience";
import type { Card } from "@/lib/cards/types";
import { useFinePointer, usePrefersReducedMotion } from "@/hooks/use-media";
import { cn } from "@/lib/utils";

type QuestionCardProps = {
  card: Card;
  contained?: boolean;
  preview?: boolean;
  shareUrl?: string;
  className?: string;
};

type Point = { left: number; top: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function QuestionCard({
  card,
  contained = false,
  preview = false,
  shareUrl,
  className,
}: QuestionCardProps) {
  const stageRef = useRef<HTMLElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);
  const yesRef = useRef<HTMLButtonElement | null>(null);
  const pendingPointer = useRef<{ x: number; y: number } | null>(null);
  const pointerFrame = useRef(0);
  const attemptsRef = useRef(0);
  const tapTimer = useRef(0);

  const reducedMotion = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const config = difficultyConfig[card.difficulty];

  const [success, setSuccess] = useState(false);
  const [pos, setPos] = useState<Point | null>(null);
  const [noScale, setNoScale] = useState(1);
  const [yesScale, setYesScale] = useState(1);
  const [attempts, setAttempts] = useState(0);
  const [tapDodge, setTapDodge] = useState<"left" | "right" | null>(null);
  const [declined, setDeclined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const reset = useCallback(() => {
    attemptsRef.current = 0;
    setSuccess(false);
    setPos(null);
    setNoScale(1);
    setYesScale(1);
    setAttempts(0);
    setTapDodge(null);
    setDeclined(false);
    setCopied(false);
  }, []);

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    reset();
  }, [card.question, card.yesLabel, card.noLabel, card.theme, card.difficulty, card.successMessage, reset]);

  useEffect(() => {
    if (!preview || !success) return;
    const timer = window.setTimeout(() => reset(), 2400);
    return () => window.clearTimeout(timer);
  }, [preview, success, reset]);

  const boundsFor = useCallback(() => {
    if (contained && stageRef.current) return stageRef.current.getBoundingClientRect();
    return new DOMRect(0, 0, window.innerWidth, window.innerHeight);
  }, [contained]);

  const shrink = useCallback(() => {
    attemptsRef.current += 1;
    const next = attemptsRef.current;
    setAttempts(next);
    setNoScale(Math.max(config.minimumScale, 1 - next * config.shrinkStep));
    setYesScale(Math.min(config.yesMaxScale, 1 + next * config.yesGrowStep));
    playDodge();
  }, [config]);

  const moveNo = useCallback(
    (targetX: number, targetY: number) => {
      const btn = noRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const bounds = boundsFor();
      const pad = config.viewportPadding;
      const padTop = contained ? pad : 72;
      const maxX = Math.max(bounds.left + pad, bounds.right - rect.width - pad);
      const maxY = Math.max(bounds.top + padTop, bounds.bottom - rect.height - pad);
      const left = clamp(targetX, bounds.left + pad, maxX);
      const top = clamp(targetY, bounds.top + padTop, maxY);

      if (!pos) {
        setPos({ left: rect.left, top: rect.top });
        requestAnimationFrame(() => setPos({ left, top }));
        return;
      }
      setPos({ left, top });
    },
    [boundsFor, config.viewportPadding, contained, pos],
  );

  const dodgePointer = useCallback(
    (pointerX: number, pointerY: number) => {
      const btn = noRef.current;
      if (!btn || success) return;
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = centerX - pointerX;
      const distanceY = centerY - pointerY;
      const distance = Math.hypot(distanceX, distanceY);
      if (distance >= config.proximityDistance) return;

      const angle = distance === 0 ? Math.random() * Math.PI * 2 : Math.atan2(distanceY, distanceX);
      shrink();
      moveNo(rect.left + Math.cos(angle) * config.escapeDistance, rect.top + Math.sin(angle) * config.escapeDistance);
    },
    [config.escapeDistance, config.proximityDistance, moveNo, shrink, success],
  );

  const teleport = useCallback(() => {
    const btn = noRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const bounds = boundsFor();
    const pad = config.viewportPadding;
    const padTop = contained ? pad : 72;
    const spanX = Math.max(0, bounds.width - rect.width - pad * 2);
    const spanY = Math.max(0, bounds.height - rect.height - pad - padTop);
    shrink();
    moveNo(bounds.left + pad + Math.random() * spanX, bounds.top + padTop + Math.random() * spanY);
  }, [boundsFor, config.viewportPadding, contained, moveNo, shrink]);

  useEffect(() => {
    if (success || reducedMotion || !finePointer) return;
    const handleMove = (event: PointerEvent) => {
      pendingPointer.current = { x: event.clientX, y: event.clientY };
      if (pointerFrame.current) return;
      pointerFrame.current = requestAnimationFrame(() => {
        pointerFrame.current = 0;
        const pending = pendingPointer.current;
        if (pending) dodgePointer(pending.x, pending.y);
      });
    };
    document.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", handleMove);
      if (pointerFrame.current) cancelAnimationFrame(pointerFrame.current);
    };
  }, [dodgePointer, finePointer, reducedMotion, success]);

  function onNoClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (reducedMotion) {
      setDeclined(true);
      shrink();
      return;
    }
    if (finePointer || card.difficulty === "ruthless") {
      teleport();
      return;
    }
    shrink();
    const next = attemptsRef.current % 2 === 0 ? "left" : "right";
    setTapDodge(next);
    window.clearTimeout(tapTimer.current);
    tapTimer.current = window.setTimeout(() => setTapDodge(null), 240);
    if (attemptsRef.current >= 3) teleport();
  }

  function onYes() {
    setSuccess(true);
    setPos(null);
    playYes();
  }

  async function copyShare() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy. Select the link instead.");
    }
  }

  async function nativeShare() {
    if (!shareUrl || !navigator.share) return;
    try {
      await navigator.share({ title: card.pageTitle, text: card.question, url: shareUrl });
    } catch {
      /* user cancelled */
    }
  }

  const nervous = attempts >= 4 && !success;
  const floating = Boolean(pos) && !success;

  return (
    <section
      ref={(node) => {
        stageRef.current = node;
      }}
      className={cn("relative w-full", contained && "overflow-hidden", className)}
    >
      {success && !reducedMotion ? <ConfettiBurst theme={card.theme} /> : null}

      <div
        className={cn(
          "relative mx-auto w-full max-w-[34rem] bg-card px-6 py-8 text-center shadow-[var(--shadow-paper)] sm:px-10 sm:py-12",
          preview ? "rounded-[28px]" : "rounded-[32px]",
          contained ? "min-h-[22rem]" : "min-h-[20rem]",
        )}
      >
        {success ? (
          <div className="flex flex-col items-center gap-5 py-4" role="status" aria-live="polite">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Confirmed
            </p>
            <h2 className="font-display text-[clamp(1.8rem,5vw,2.7rem)] font-medium leading-[1.15] tracking-[-0.03em] text-balance">
              {card.successMessage}
            </h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
              {card.question}
            </p>
            {preview ? null : (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <Button type="button" variant="quiet" onClick={reset}>
                  <RotateCcw />
                  Ask again
                </Button>
                <Button asChild>
                  <Link to="/create">Make your own</Link>
                </Button>
                {shareUrl && canShare ? (
                  <Button type="button" variant="outline" onClick={() => void nativeShare()}>
                    <Share2 />
                    Share
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {card.kicker ? (
              <p className="stagger-item mb-4 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                {card.kicker}
              </p>
            ) : null}
            <h1
              id="question"
              className="stagger-item font-display text-[clamp(1.7rem,5vw,2.45rem)] font-medium leading-[1.2] tracking-[-0.03em] text-balance"
            >
              {card.question}
            </h1>
            <div
              className="stagger-item mt-8 flex w-full flex-wrap items-center justify-center gap-3"
              aria-label={card.responseOptionsLabel}
              style={{ animationDelay: "120ms" }}
            >
              <button
                ref={yesRef}
                id="yesBtn"
                type="button"
                onClick={onYes}
                style={{ transform: `scale(${yesScale})` }}
                className={cn(
                  "relative z-10 min-h-12 min-w-36 rounded-[14px] bg-yes px-6 text-base font-medium text-yes-foreground shadow-[var(--shadow-soft)]",
                  "transition-[transform,box-shadow,background-color] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
                  "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  "active:scale-[0.96]",
                )}
              >
                {card.yesLabel}
              </button>
              {!floating ? (
                <button
                  ref={noRef}
                  id="noBtn"
                  type="button"
                  onClick={onNoClick}
                  onPointerEnter={
                    finePointer && !reducedMotion
                      ? (event) => dodgePointer(event.clientX, event.clientY)
                      : undefined
                  }
                  style={{
                    transform: tapDodge
                      ? `translateX(${tapDodge === "left" ? "-0.75rem" : "0.75rem"}) scale(${noScale})`
                      : `scale(${noScale})`,
                  }}
                  className={cn(
                    "min-h-12 min-w-32 rounded-[14px] bg-no px-6 text-base font-medium text-no-foreground shadow-[var(--shadow-soft)]",
                    "transition-[transform,opacity,box-shadow] duration-[180ms] ease-[var(--ease-out)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                    declined && "opacity-60",
                  )}
                >
                  {card.noLabel}
                </button>
              ) : (
                <span className="invisible min-h-12 min-w-32 px-6" aria-hidden="true">
                  {card.noLabel}
                </span>
              )}
            </div>
            {nervous ? (
              <p className="mt-5 text-sm text-muted-foreground">The no button is getting nervous.</p>
            ) : null}
            {declined && reducedMotion ? (
              <p className="mt-5 text-sm text-muted-foreground">It tried. You can still say yes.</p>
            ) : null}
          </div>
        )}
      </div>

      {floating ? (
        <button
          ref={noRef}
          id="noBtn"
          type="button"
          onClick={onNoClick}
          onPointerEnter={
            finePointer && !reducedMotion
              ? (event) => dodgePointer(event.clientX, event.clientY)
              : undefined
          }
          style={{
            left: pos?.left,
            top: pos?.top,
            transform: `scale(${noScale})`,
          }}
          className={cn(
            "is-floating-no fixed z-20 min-h-12 min-w-32 rounded-[14px] bg-no px-6 text-base font-medium text-no-foreground shadow-[var(--shadow-soft)]",
            "transition-[left,top,transform,opacity] duration-[180ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          {card.noLabel}
        </button>
      ) : null}

      {shareUrl && !preview ? (
        <div className="mx-auto mt-4 w-full max-w-[34rem] rounded-[20px] bg-card px-4 py-4 shadow-[var(--shadow-border)] sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Your shareable link</p>
              <p className="text-xs text-muted-foreground">No account. Send it as-is.</p>
            </div>
            <Button type="button" size="sm" variant="quiet" onClick={() => void copyShare()}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <input
            aria-label="Shareable card link"
            readOnly
            value={shareUrl}
            className="mt-3 h-10 w-full truncate rounded-[12px] bg-background px-3 text-xs text-muted-foreground shadow-[var(--shadow-border)]"
            onFocus={(event) => event.currentTarget.select()}
          />
        </div>
      ) : null}
    </section>
  );
}
