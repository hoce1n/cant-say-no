import { Link } from "@tanstack/react-router";
import { PaperStage } from "@/components/paper-stage";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <PaperStage theme="blush">
      <SiteHeader />
      <main
        id="mainContent"
        className="mx-auto flex min-h-[70dvh] w-full max-w-lg flex-col items-center justify-center px-6 py-16 text-center"
      >
        <p className="font-display text-6xl font-medium tracking-[-0.05em] text-primary">404</p>
        <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.03em]">
          This card could not be found.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          The link may be incomplete, or the question never made it onto the paper.
        </p>
        <Button asChild className="mt-8">
          <Link to="/">Open the default card</Link>
        </Button>
      </main>
      <SiteFooter />
    </PaperStage>
  );
}
