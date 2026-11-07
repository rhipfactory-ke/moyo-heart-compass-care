import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/SiteChrome";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/legal")({
  head: () =>
    seo(
      "Privacy, Terms & Medical Disclaimer | MoyoDoc",
      "MoyoDoc privacy policy, terms of use and medical disclaimer.",
    ),
  component: Legal,
});

function Legal() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy, terms and medical disclaimer" />
      <section className="mx-auto grid max-w-3xl gap-10 px-5 py-16">
        <div>
          <h2 className="text-2xl font-bold">Privacy Policy</h2>
          <p className="mt-3 text-muted-foreground">
            Our full privacy policy will be published before launch.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Terms of Use</h2>
          <p className="mt-3 text-muted-foreground">
            Our terms of use will be published before launch.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Medical Disclaimer</h2>
          <p className="mt-3 text-muted-foreground">
            MoyoDoc supports hypertension management and communication between patients and
            healthcare professionals. It does not independently diagnose medical conditions,
            prescribe medication or replace professional medical advice. It does not provide
            emergency medical services. Always consult a qualified healthcare professional regarding
            your health.
          </p>
        </div>
      </section>
    </>
  );
}
