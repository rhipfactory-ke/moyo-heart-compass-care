import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/SiteChrome";
import { PatientAppPreview } from "@/components/site/Previews";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/patients")({
  head: () =>
    seo(
      "For Patients | MoyoDoc Hypertension Care Kenya",
      "Understand your risk, track your blood pressure at home and stay connected to a cardiovascular specialist between clinic visits.",
    ),
  component: Patients,
});

function Patients() {
  return (
    <>
      <PageHero eyebrow="For patients" title="Take control of your blood pressure journey.">
        Whether you've been diagnosed or simply want to understand your risk, MoyoDoc keeps you and
        your specialist connected.
      </PageHero>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2">
        <PatientAppPreview />
        <div className="grid gap-6">
          {[
            ["My blood pressure trends", "See your readings over time in one place."],
            ["My medication check-in", "Confirm your daily medication with one tap."],
            ["My weekly symptom check-in", "A few simple questions every week."],
            ["My specialist connection", "Your specialist reviews what you share."],
            ["My latest care-plan update", "Get notified when your plan is reviewed or updated."],
          ].map(([t, b]) => (
            <div key={t}>
              <h3 className="text-lg font-bold">{t}</h3>
              <p className="text-muted-foreground">{b}</p>
            </div>
          ))}
          <Link to="/register" className="btn btn-primary w-fit">
            Check My Heart Health
          </Link>
        </div>
      </section>
    </>
  );
}
