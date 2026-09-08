import { createFileRoute, notFound } from "@tanstack/react-router";
import { PaperStage } from "@/components/paper-stage";
import { QuestionCard } from "@/components/question-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCardById } from "@/lib/cards/templates";

export const Route = createFileRoute("/cards/$cardId")({
  loader: ({ params }) => {
    const card = getCardById(params.cardId);
    if (!card) throw notFound();
    return { card };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData?.card.pageTitle ?? "Can't Say No" }],
  }),
  component: CardPage,
});

function CardPage() {
  const { card } = Route.useLoaderData();

  return (
    <PaperStage theme={card.theme}>
      <SiteHeader />
      <main
        id="mainContent"
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-16 pt-6 sm:px-6 sm:pt-10"
        aria-labelledby="question"
      >
        <QuestionCard card={card} />
      </main>
      <SiteFooter />
    </PaperStage>
  );
}
