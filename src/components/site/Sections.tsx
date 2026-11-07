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
import docImg from "@/assets/cardiologist.jpg";

export const stages = [
  {
    icon: ClipboardCheck,
    title: "Understand your health",
    body: "Complete a structured cardiovascular health assessment and receive a plain-language summary of your risk.",
  },
  {
    icon: Search,
    title: "Find your specialist",
    body: "Explore enlisted cardiovascular practitioners and request to join their care network.",
  },
  {
    icon: Activity,
    title: "Monitor your blood pressure",
    body: "Record your readings through a connected Bluetooth BP monitor or enter them manually.",
  },
  {
    icon: CheckCircle2,
    title: "Stay on track",
    body: "Log your medication adherence and complete simple weekly symptom check-ins.",
  },
  {
    icon: Stethoscope,
    title: "Keep your specialist informed",
    body: "Your readings and health updates help your specialist understand what's happening between appointments.",
  },
  {
    icon: BellRing,
    title: "Close the care loop",
    body: "Receive notifications when your specialist reviews your information or updates your care plan.",
  },
];

export function ProviderInvite() {
  const items = [
    [
      Eye,
      "See the bigger picture.",
      "Access structured home blood pressure readings, medication adherence information and symptom updates.",
    ],
    [
      Target,
      "Know who needs attention.",
      "View a risk-sorted patient panel and receive alerts based on persistent trends rather than isolated readings.",
    ],
    [
      ClipboardCheck,
      "Take action with confidence.",
      "Review patient information, acknowledge alerts, document clinical actions and update care plans.",
    ],
    [
      Globe2,
      "Extend your clinical reach.",
      "Stay connected with patients beyond the walls of your practice.",
    ],
  ] as const;
  return (
    <section className="bg-brand-gradient text-on-dark">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-coral">For cardiovascular healthcare professionals</p>
          <h2 className="mt-4 text-3xl font-extrabold text-on-dark md:text-5xl">
            Your patients need you beyond the consultation room.
          </h2>
          <p className="mt-6 text-lg text-on-dark/80">
            Hypertension management is continuous. But keeping track of every patient's progress
            between appointments can be challenging.
          </p>
          <p className="mt-3 text-lg text-on-dark/80">
            MoyoDoc gives cardiovascular specialists a connected platform to monitor patient trends,
            identify disengagement and prioritize clinical follow-up.
          </p>
          <div className="mt-9 grid gap-6 sm:grid-cols-2">
            {items.map(([I, t, b]) => (
              <div key={t}>
                <I className="h-6 w-6 text-coral" />
                <p className="mt-3 font-display font-bold text-on-dark">{t}</p>
                <p className="mt-1 text-sm text-on-dark/75">{b}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/providers/apply" className="btn btn-light">
              Join the MoyoDoc Provider Network
            </Link>
            <Link to="/providers" className="btn btn-ghost-light">
              Explore the Clinician Platform
            </Link>
          </div>
          <p className="mt-4 text-sm text-on-dark/70">
            For cardiologists, internists and qualified cardiovascular practitioners in Kenya.
          </p>
        </div>
        <img
          src={docImg}
          alt="Cardiologist reviewing a digital patient dashboard on a tablet"
          loading="lazy"
          width={1024}
          height={1200}
          className="aspect-[4/5] w-full rounded-[2rem] object-cover shadow-float"
        />
      </div>
    </section>
  );
}

export const loopSteps = [
  ["Patient shares", "Home BP readings, medication updates and symptoms."],
  ["MoyoDoc organizes", "Information is structured into trends and actionable alerts."],
  ["Specialist reviews", "The healthcare provider reviews relevant patient updates."],
  [
    "Clinical action follows",
    "The specialist acknowledges, contacts, adjusts the plan or refers as appropriate.",
  ],
  ["Patient stays connected", "The patient receives feedback and continues their care journey."],
];

export function Loop() {
  return (
    <section className="bg-blush">
      <div className="mx-auto max-w-7xl px-5 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold md:text-5xl">
            Two sides. One connected care journey.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            MoyoDoc works by bringing patients and cardiovascular specialists into one shared
            clinical loop.
          </p>
        </div>
        <div className="relative mx-auto mt-16 hidden aspect-square max-w-xl md:block">
          <div className="absolute inset-[12%] rounded-full border-2 border-dashed border-coral" />
          <div className="absolute inset-[34%] grid place-items-center rounded-full bg-brand-gradient text-center shadow-float">
            <div>
              <HeartPulse className="mx-auto h-8 w-8 text-on-dark" />
              <p className="mt-1 font-display text-sm font-bold text-on-dark">Clinical loop</p>
            </div>
          </div>
          {loopSteps.map(([t, b], i) => {
            const a = (i / loopSteps.length) * 2 * Math.PI - Math.PI / 2;
            const x = 50 + 38 * Math.cos(a);
            const y = 50 + 38 * Math.sin(a);
            return (
              <div
                key={t}
                className="absolute w-44 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-3 text-center shadow-soft"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <p className="font-display text-xs font-extrabold uppercase tracking-wider text-primary">
                  {i + 1}. {t}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{b}</p>
              </div>
            );
          })}
        </div>
        <ol className="mt-10 grid gap-3 md:hidden">
          {loopSteps.map(([t, b], i) => (
            <li key={t} className="rounded-2xl bg-card p-4 shadow-soft">
              <p className="font-display text-sm font-extrabold uppercase tracking-wider text-primary">
                {i + 1}. {t}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{b}</p>
            </li>
          ))}
        </ol>
        <p className="mt-12 text-center font-display text-xl font-bold text-wine">
          Better visibility for specialists. Better-connected care for patients.
        </p>
      </div>
    </section>
  );
}
