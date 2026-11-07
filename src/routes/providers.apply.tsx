import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/SiteChrome";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/providers/apply")({
  head: () =>
    seo(
      "Join the MoyoDoc Provider Network | MoyoDoc",
      "Cardiologists, internists and qualified cardiovascular practitioners in Kenya can apply to join the MoyoDoc provider network.",
    ),
  component: Apply,
});

const fields = [
  ["name", "Full name", "text"],
  ["title", "Professional title / specialty", "text"],
  ["reg", "Medical registration number", "text"],
  ["affiliation", "Hospital or practice affiliation", "text"],
  ["county", "County / location", "text"],
  ["email", "Work email", "email"],
  ["phone", "Phone number", "tel"],
] as const;

function Apply() {
  const [done, setDone] = useState(false);
  return (
    <>
      <PageHero eyebrow="For cardiovascular healthcare professionals" title="Apply to join MoyoDoc">
        For cardiologists, internists and qualified cardiovascular practitioners in Kenya.
      </PageHero>
      <section className="mx-auto max-w-2xl px-5 pb-24">
        {done ? (
          <div className="rounded-3xl border bg-card p-10 text-center shadow-soft" role="status">
            <CheckCircle2 className="mx-auto h-12 w-12 text-health" />
            <p className="mt-4 text-lg">
              Thank you for your interest in MoyoDoc. Your details have been received. Our team will
              be in touch regarding provider onboarding.
            </p>
          </div>
        ) : (
          <form
            className="grid gap-5 rounded-3xl border bg-card p-8 shadow-soft"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
              window.scrollTo({ top: 0 });
            }}
          >
            {fields.map(([id, label, type]) => (
              <label key={id} className="grid gap-1.5 text-sm font-medium">
                {label}
                <input required name={id} type={type} className="field" />
              </label>
            ))}
            <label className="grid gap-1.5 text-sm font-medium">
              Brief description of practice
              <textarea name="practice" rows={4} className="field" />
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input required type="checkbox" className="mt-1 accent-primary" />I consent to be
              contacted by the MoyoDoc team about provider onboarding.
            </label>
            <button className="btn btn-primary">Apply to Join MoyoDoc</button>
            <p className="text-xs text-muted-foreground">
              Submitting this form does not grant automatic approval. All applications go through
              verification and onboarding.
            </p>
          </form>
        )}
      </section>
    </>
  );
}
