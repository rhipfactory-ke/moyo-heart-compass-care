import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/SiteChrome";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    seo(
      "About MoyoDoc | Specialist-led Hypertension Care",
      "MoyoDoc is a specialist-led cardiovascular care platform making hypertension care continuous, visible and actionable — starting in Kenya.",
    ),
  component: About,
});

function About() {
  return (
    <>
      <PageHero
        eyebrow="About MoyoDoc"
        title="Making hypertension care continuous, visible and actionable."
      >
        Your blood pressure journey doesn't end when you leave the clinic. MoyoDoc helps keep your
        care moving.
      </PageHero>
      <section className="mx-auto grid max-w-4xl gap-10 px-5 py-16 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Our focus</h2>
          <p className="mt-3 text-muted-foreground">
            MoyoDoc is a specialist-led cardiovascular care platform focused on continuous
            hypertension management — connecting patients with cardiovascular specialists between
            clinic visits.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Where we're starting</h2>
          <p className="mt-3 text-muted-foreground">
            We are launching in Kenya, with a vision to support connected cardiovascular care across
            Africa.
          </p>
        </div>
        <div className="md:col-span-2 rounded-3xl bg-blush p-8">
          <h2 className="text-2xl font-bold">Contact & support</h2>
          <p className="mt-3 text-muted-foreground">
            Contact details for patient support and provider enquiries will be published here soon.
          </p>
        </div>
      </section>
    </>
  );
}
