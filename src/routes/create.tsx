import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PaperStage } from "@/components/paper-stage";
import { RecentCards } from "@/components/recent-cards";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Studio } from "@/components/studio";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [{ title: "Create a card — Can't Say No" }],
  }),
  component: CreatePage,
});

function CreatePage() {
  return (
    <PaperStage theme="blush">
      <SiteHeader />
      <main id="mainContent" className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to the default card
        </Link>
        <header className="mb-8 max-w-xl">
          <h1 className="font-display text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
            Create your card
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Choose the question, the labels, and the paper. Your finished card gets a shareable
            link — no account, no expiry tricks.
          </p>
        </header>
        <Studio />
        <RecentCards />
      </main>
      <SiteFooter />
    </PaperStage>
  );
}
