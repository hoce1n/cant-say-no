import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "@/components/not-found-page";
import { PaperStage } from "@/components/paper-stage";
import { QuestionCard } from "@/components/question-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { decodeShare } from "@/lib/cards/codec";

export const Route = createFileRoute("/c")({
  validateSearch: (search: Record<string, unknown>): { p?: string } => {
    if (typeof search.p !== "string") return {};
    return { p: search.p };
  },
  head: () => ({
    meta: [{ title: "A question for you — Can't Say No" }],
  }),
  component: CustomCardPage,
});

function CustomCardPage() {
  const { p } = Route.useSearch();
  const card = decodeShare(p);

  if (!card) return <NotFoundPage />;

  const shareUrl =
    typeof window === "undefined"
      ? `/c?p=${p ?? ""}`
      : window.location.href;

  return (
    <PaperStage theme={card.theme}>
      <SiteHeader />
      <main
        id="mainContent"
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-16 pt-6 sm:px-6 sm:pt-10"
        aria-labelledby="question"
      >
        <QuestionCard card={card} shareUrl={shareUrl} />
      </main>
      <SiteFooter />
    </PaperStage>
  );
}
