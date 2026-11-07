import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/site/SiteChrome";
import { ProviderDashboardPreview } from "@/components/site/Previews";
import { ProviderInvite } from "@/components/site/Sections";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/providers/")({
  head: () =>
    seo(
      "For Healthcare Providers | MoyoDoc Clinician Platform",
      "A connected platform for Kenyan cardiologists and internists to monitor hypertension patients between visits, see risk-sorted panels and act on persistent trends.",
    ),
  component: Providers,
});

function Providers() {
  return (
    <>
      <PageHero
        eyebrow="The clinician platform"
        title="Better visibility of your patients between clinic visits."
      >
        A risk-sorted patient panel, trend-based alerts and documented clinical actions — in one
        place.
      </PageHero>
      <section className="mx-auto max-w-5xl px-5 py-16">
        <ProviderDashboardPreview />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Illustrative demo. All figures shown are sample data.
        </p>
        <div className="mt-8 text-center">
          <Link to="/providers/apply" className="btn btn-primary">
            Join the MoyoDoc Provider Network
          </Link>
        </div>
      </section>
      <ProviderInvite />
    </>
  );
}
