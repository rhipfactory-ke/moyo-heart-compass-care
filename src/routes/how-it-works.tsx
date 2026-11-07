import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/SiteChrome";
import { Loop, stages } from "@/components/site/Sections";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/how-it-works")({
  head: () =>
    seo(
      "How It Works | MoyoDoc Connected Care Loop",
      "From risk assessment to specialist follow-up: how MoyoDoc connects patients and cardiovascular specialists in one continuous care loop.",
    ),
  component: How,
});

function How() {
  return (
    <>
      <PageHero eyebrow="How it works" title="One continuous care journey, in six steps." />
      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-16 sm:grid-cols-2 lg:grid-cols-3">
        {stages.map((s, i) => (
          <div key={s.title} className="rounded-3xl border bg-card p-6">
            <span className="font-display text-sm font-extrabold text-coral">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
            <p className="mt-2 text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </section>
      <Loop />
      <div className="py-16 text-center">
        <Link to="/register" className="btn btn-primary">
          Start My MoyoDoc Journey
        </Link>
      </div>
    </>
  );
}
