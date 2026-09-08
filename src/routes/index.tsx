import { createFileRoute, Link } from "@tanstack/react-router";
import { PaperStage } from "@/components/paper-stage";
import { QuestionCard } from "@/components/question-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TemplateGrid } from "@/components/template-grid";
import { Button } from "@/components/ui/button";
import { cardFromFields } from "@/lib/cards/codec";
import { defaultCard } from "@/lib/cards/templates";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { question?: string } => {
    if (typeof search.question !== "string") return {};
    return { question: search.question.slice(0, 180) };
  },
  head: () => ({
    meta: [{ title: "Can't Say No" }],
  }),
  component: Home,
});

function Home() {
  const { question } = Route.useSearch();
  const card = question ? cardFromFields({ question }) : defaultCard;

  return (
    <PaperStage theme={card.theme}>
      <SiteHeader />
      <main id="mainContent" className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
        <section className="mx-auto flex max-w-[34rem] flex-col items-center pt-4 sm:pt-8">
          <QuestionCard card={card} />
          <p className="mt-6 max-w-sm text-center text-sm leading-relaxed text-muted-foreground">
            Hover the no button. It will run. Then send someone a question of your own.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/create">Create a card</Link>
          </Button>
        </section>

        <section className="mt-16 sm:mt-20">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-medium tracking-[-0.03em]">
                Or send one of these
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Coffee, stars, a walk, a kitchen. Same trap. Different paper.
              </p>
            </div>
          </div>
          <TemplateGrid />
        </section>
      </main>
      <SiteFooter />
    </PaperStage>
  );
}
