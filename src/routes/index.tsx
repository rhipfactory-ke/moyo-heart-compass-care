import { createFileRoute, Link } from "@tanstack/react-router";
import {
  HeartPulse,
  Activity,
  Network,
  Stethoscope,
  Users,
  ClipboardCheck,
  BellRing,
  RefreshCcw,
  Search,
  ShieldCheck,
  KeyRound,
  Lock,
  FileSearch,
  Eye,
  Target,
  CheckCircle2,
  Globe2,
  ArrowRight,
} from "lucide-react";
import heroImg from "@/assets/hero-patient.jpg";
import docImg from "@/assets/cardiologist.jpg";
import { PatientAppPreview, ProviderDashboardPreview } from "@/components/site/Previews";
import { seo } from "@/lib/seo";
import { stages, ProviderInvite, Loop } from "@/components/site/Sections";

export const Route = createFileRoute("/")({
  head: () =>
    seo(
      "MoyoDoc Kenya | Connected Hypertension & Cardiovascular Care",
      "Manage hypertension with MoyoDoc. Connect with cardiovascular specialists, track blood pressure readings and stay engaged with your care beyond clinic visits.",
    ),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <Solution />
      <Benefits />
      <ProviderInvite />
      <Loop />
      <Trust />
      <FinalCta />
      <StickyCta />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-soft-gradient overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:py-24 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Your heart health. Your care. Your connection.</p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] md:text-6xl">
            Don't let high blood pressure go unnoticed.{" "}
            <span className="text-primary">Don't manage it alone.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Whether you've been diagnosed with hypertension or simply want to understand your risk,
            MoyoDoc helps you take charge of your blood pressure journey.
          </p>
          <p className="mt-3 max-w-xl text-lg text-muted-foreground">
            Connect with cardiovascular specialists, track your readings and stay connected to your
            care — even between clinic visits.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn btn-primary px-7 py-4 text-base">
              Check My Heart Health <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/providers/apply" className="btn btn-outline px-7 py-4 text-base">
              I'm a Healthcare Provider
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            A healthier tomorrow starts with understanding your numbers.
          </p>
        </div>
        <div className="relative">
          <img
            src={heroImg}
            alt="Woman checking her blood pressure at home with a digital monitor"
            width={1024}
            height={1200}
            className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-float"
          />
          <div className="animate-float absolute -left-4 bottom-10 w-64 rounded-2xl border bg-card p-4 shadow-float md:-left-10">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-wine">BP trend · this month</p>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Illustration
              </span>
            </div>
            <svg viewBox="0 0 200 50" className="mt-2 h-12 w-full text-primary" fill="none">
              <path
                d="M0 14 L30 18 L60 12 L90 24 L120 28 L150 32 L200 36"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="animate-pulse-line"
              />
            </svg>
          </div>
          <div className="animate-float absolute -right-2 top-8 w-60 rounded-2xl border bg-card p-4 shadow-float [animation-delay:1.5s] md:-right-6">
            <p className="flex items-center gap-2 text-xs font-semibold text-wine">
              <Stethoscope className="h-4 w-4 text-primary" /> Your specialist
            </p>
            <p className="mt-1.5 text-sm">"I've reviewed your readings this week. Keep going."</p>
          </div>
        </div>
      </div>
      <div className="border-y bg-card">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:grid-cols-3">
          {[
            [Network, "Specialist-connected care"],
            [Activity, "Home blood pressure monitoring"],
            [RefreshCcw, "Ongoing care between visits"],
          ].map(([I, t]) => {
            const Icon = I as typeof Network;
            return (
              <div
                key={t as string}
                className="flex items-center justify-center gap-3 text-sm font-semibold text-wine"
              >
                <Icon className="h-5 w-5 text-primary" />
                {t as string}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const cards = [
    {
      icon: HeartPulse,
      tag: "For the undiagnosed",
      title: "Feeling fine doesn't mean your BP is fine.",
      body: "High blood pressure can go unnoticed for years. Understanding your cardiovascular risk is an important first step.",
      cta: "Understand My Risk",
    },
    {
      icon: Activity,
      tag: "For the diagnosed",
      title: "Your care shouldn't stop at the clinic.",
      body: "Keeping track of your readings, medication and progress matters long after your appointment ends.",
      cta: "Manage My Blood Pressure",
    },
    {
      icon: Network,
      tag: "For those struggling",
      title: "You deserve support between visits.",
      body: "When your readings and progress aren't visible to your healthcare provider, important opportunities for follow-up can be missed.",
      cta: "Find Specialist Support",
    },
  ];
  return (
    <section className="bg-blush">
      <div className="mx-auto max-w-7xl px-5 py-24">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-extrabold md:text-5xl">
            High blood pressure doesn't always announce itself.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            You can feel perfectly fine and still have high blood pressure.
          </p>
          <p className="mt-3 text-lg text-muted-foreground">
            And if you've already been diagnosed, seeing your doctor occasionally may not be enough
            to keep your condition on track.
          </p>
          <p className="mt-3 text-lg font-semibold text-wine">
            The real challenge? What happens between visits.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.title}
              className="card-lift flex flex-col rounded-3xl bg-card p-7 shadow-soft"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush">
                <c.icon className="h-6 w-6 text-primary" />
              </span>
              <p className="eyebrow mt-6 text-[10px]">{c.tag}</p>
              <h3 className="mt-2 text-xl font-bold">{c.title}</h3>
              <p className="mt-3 flex-1 text-muted-foreground">{c.body}</p>
              <Link
                to="/register"
                className="mt-6 inline-flex items-center gap-2 font-semibold text-primary hover:gap-3 transition-all"
              >
                {c.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solution() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-5 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Introducing MoyoDoc</p>
          <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
            More than monitoring. A connected approach to blood pressure care.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            MoyoDoc brings you and your cardiovascular specialist together in one continuous care
            journey.
          </p>
          <p className="mt-3 text-lg text-muted-foreground">
            From understanding your risk to monitoring your blood pressure and receiving specialist
            follow-up, your care stays connected.
          </p>
        </div>
        <div className="mt-14 grid items-center gap-8 lg:grid-cols-[1fr_auto_1.4fr]">
          <PatientAppPreview />
          <div className="hidden lg:flex flex-col items-center gap-2 text-primary">
            <RefreshCcw className="h-10 w-10" />
            <span className="eyebrow text-[10px]">Care loop</span>
          </div>
          <ProviderDashboardPreview />
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stages.map((s, i) => (
            <div key={s.title} className="card-lift rounded-3xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-extrabold text-coral">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/register" className="btn btn-primary px-8 py-4">
            Start My MoyoDoc Journey
          </Link>
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    [
      "Know where you stand",
      "Understand your cardiovascular risk through a structured health assessment.",
    ],
    [
      "Keep your readings together",
      "Track your blood pressure over time and see your trends in one place.",
    ],
    [
      "Make medication tracking easier",
      "Confirm your medication intake with a simple daily check-in.",
    ],
    [
      "Stay connected to your specialist",
      "Your specialist can review your submitted information and document follow-up actions.",
    ],
    [
      "Build healthier routines",
      "Use lifestyle check-ins to keep track of your health goals and progress.",
    ],
  ];
  return (
    <section className="bg-sand">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <PatientAppPreview />
        </div>
        <div className="order-1 lg:order-2">
          <h2 className="text-3xl font-extrabold md:text-5xl">
            Take control of your blood pressure journey.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            A little consistency can make a meaningful difference. MoyoDoc helps you stay informed,
            engaged and connected to your specialist.
          </p>
          <ul className="mt-8 grid gap-5">
            {items.map(([t, b]) => (
              <li key={t} className="flex gap-4">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-health" />
                <div>
                  <p className="font-display font-bold text-wine">{t}</p>
                  <p className="text-muted-foreground">{b}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to="/register" className="btn btn-primary">
              Get Started with MoyoDoc
            </Link>
            <span className="text-sm text-muted-foreground">
              Your health journey. Better connected.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const items = [
    [Users, "Your consent matters", "Explicit consent and transparent information-sharing."],
    [KeyRound, "Controlled access", "Role-based access to patient information."],
    [Lock, "Secure information", "Encryption of information at rest and in transit."],
    [FileSearch, "Accountability", "Audit trails for information access and clinical actions."],
  ] as const;
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-5 py-24">
        <div className="max-w-3xl">
          <ShieldCheck className="h-10 w-10 text-primary" />
          <h2 className="mt-4 text-3xl font-extrabold md:text-5xl">
            Your health information deserves protection.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Your health information is personal. MoyoDoc is designed with privacy and responsible
            access at its core.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([I, t, b]) => (
            <div key={t} className="card-lift rounded-3xl border bg-card p-6">
              <I className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-lg font-bold">{t}</h3>
              <p className="mt-2 text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          These are product design commitments that guide how MoyoDoc is being built.
        </p>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-brand-gradient">
      <svg
        viewBox="0 0 1200 200"
        className="absolute inset-x-0 top-1/2 w-full -translate-y-1/2 text-on-dark/10"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 100 H420 L460 40 L500 160 L540 70 L570 100 H1200"
          stroke="currentColor"
          strokeWidth="4"
        />
      </svg>
      <div className="relative mx-auto max-w-3xl px-5 py-24 text-center">
        <h2 className="text-3xl font-extrabold text-on-dark md:text-5xl">
          Your blood pressure deserves more than an occasional check.
        </h2>
        <p className="mt-6 text-lg text-on-dark/80">
          Whether you're taking your first step towards understanding your cardiovascular health or
          looking for better support in managing hypertension, MoyoDoc is here to help you stay
          connected to your care.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/register" className="btn btn-light px-7 py-4">
            Start My Heart Health Journey
          </Link>
          <Link to="/providers/apply" className="btn btn-ghost-light px-7 py-4">
            I'm a Cardiovascular Specialist
          </Link>
        </div>
        <p className="mt-6 text-sm text-on-dark/70">
          Don't wait for a warning sign to start paying attention.
        </p>
      </div>
    </section>
  );
}

function StickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:hidden">
      <Link to="/register" className="btn btn-primary w-full max-w-sm shadow-float">
        Check My Heart Health
      </Link>
    </div>
  );
}
