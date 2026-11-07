import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/site/SiteChrome";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/register")({
  head: () =>
    seo(
      "Check My Heart Health | MoyoDoc Patient Registration",
      "Register with MoyoDoc, give consent and complete a short cardiovascular health intake to start your connected blood pressure care journey.",
    ),
  component: Register,
});

const steps = ["Your details", "Consent", "Health intake", "Done"];

function Register() {
  const [step, setStep] = useState(0);
  const next = (e: React.FormEvent) => {
    e.preventDefault();
    setStep((s) => s + 1);
  };
  return (
    <>
      <PageHero eyebrow="Patient registration" title="Check my heart health">
        A healthier tomorrow starts with understanding your numbers.
      </PageHero>
      <section className="mx-auto max-w-2xl px-5 pb-24">
        <ol className="mb-8 grid grid-cols-4 gap-2">
          {steps.map((s, i) => (
            <li key={s} className="text-center">
              <div className={`h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
              <p
                className={`mt-2 text-xs font-semibold ${i <= step ? "text-primary" : "text-muted-foreground"}`}
              >
                {s}
              </p>
            </li>
          ))}
        </ol>
        <div className="rounded-3xl border bg-card p-8 shadow-soft">
          {step === 0 && (
            <form className="grid gap-5" onSubmit={next}>
              <label className="grid gap-1.5 text-sm font-medium">
                Full name
                <input required className="field" />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Phone number
                <input required type="tel" className="field" />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Email (optional)
                <input type="email" className="field" />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                County
                <input required className="field" />
              </label>
              <button className="btn btn-primary">Continue</button>
            </form>
          )}
          {step === 1 && (
            <form className="grid gap-5" onSubmit={next}>
              <h2 className="text-xl font-bold">Your consent matters</h2>
              <p className="text-muted-foreground">
                MoyoDoc shares your health information only with the specialist you choose to
                connect with, and only with your explicit consent.
              </p>
              <label className="flex items-start gap-3 text-sm">
                <input required type="checkbox" className="mt-1 accent-primary" />I consent to
                MoyoDoc collecting and processing my health information to support my care.
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input required type="checkbox" className="mt-1 accent-primary" />I understand
                MoyoDoc does not diagnose conditions, prescribe medication or provide emergency
                services.
              </label>
              <button className="btn btn-primary">I agree, continue</button>
            </form>
          )}
          {step === 2 && (
            <form className="grid gap-5" onSubmit={next}>
              <h2 className="text-xl font-bold">A few questions about your heart health</h2>
              <Choice
                name="dx"
                q="Have you been diagnosed with high blood pressure?"
                opts={["Yes", "No", "Not sure"]}
              />
              <Choice
                name="meds"
                q="Are you currently taking blood pressure medication?"
                opts={["Yes", "No"]}
              />
              <Choice
                name="fam"
                q="Does anyone in your close family have high blood pressure or heart disease?"
                opts={["Yes", "No", "Not sure"]}
              />
              <Choice
                name="monitor"
                q="Do you have a home blood pressure monitor?"
                opts={["Yes", "No"]}
              />
              <button className="btn btn-primary">Submit intake</button>
            </form>
          )}
          {step === 3 && (
            <div className="text-center" role="status">
              <CheckCircle2 className="mx-auto h-12 w-12 text-health" />
              <h2 className="mt-4 text-2xl font-bold">
                Thank you — your intake has been received.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Next, you'll receive a plain-language summary of your cardiovascular risk and can
                explore enlisted specialists. This summary is not a medical diagnosis.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                If you have severe symptoms such as chest pain or difficulty breathing, seek
                emergency care immediately.
              </p>
              <Link to="/" className="btn btn-outline mt-6">
                Back to home
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function Choice({ name, q, opts }: { name: string; q: string; opts: string[] }) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{q}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {opts.map((o) => (
          <label
            key={o}
            className="cursor-pointer rounded-full border px-4 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-blush has-[:checked]:text-primary"
          >
            <input required type="radio" name={name} value={o} className="sr-only" />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
