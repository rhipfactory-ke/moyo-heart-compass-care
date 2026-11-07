import {
  Bell,
  CheckCircle2,
  Pill,
  ClipboardList,
  UserRound,
  FileText,
  Users,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { SampleBadge } from "./SiteChrome";

function Trend({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 60" className={className} fill="none">
      <path
        d="M0 18 L25 22 L50 14 L75 26 L100 24 L125 32 L150 36 L175 40 L200 42"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="animate-pulse-line"
      />
    </svg>
  );
}

export function PatientAppPreview() {
  return (
    <div className="mx-auto w-full max-w-xs rounded-[2.2rem] border-8 border-wine bg-card p-4 shadow-float">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-bold text-wine">My MoyoDoc</p>
        <SampleBadge />
      </div>
      <div className="mt-3 rounded-2xl bg-blush p-3">
        <p className="text-xs font-semibold text-muted-foreground">
          My blood pressure trend · 14 days
        </p>
        <Trend className="mt-2 h-14 w-full text-primary" />
      </div>
      <div className="mt-3 grid gap-2 text-sm">
        <Row
          icon={<Pill className="h-4 w-4 text-health" />}
          title="Medication check-in"
          sub="Today's dose confirmed"
          done
        />
        <Row
          icon={<ClipboardList className="h-4 w-4 text-primary" />}
          title="Weekly symptom check-in"
          sub="Due Sunday"
        />
        <Row
          icon={<UserRound className="h-4 w-4 text-primary" />}
          title="My specialist"
          sub="Connected"
          done
        />
        <Row
          icon={<FileText className="h-4 w-4 text-primary" />}
          title="Latest care-plan update"
          sub="Reviewed by your specialist"
        />
      </div>
    </div>
  );
}

function Row({
  icon,
  title,
  sub,
  done,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border p-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-muted">{icon}</span>
      <span className="flex-1">
        <span className="block text-xs font-semibold text-wine">{title}</span>
        <span className="text-[11px] text-muted-foreground">{sub}</span>
      </span>
      {done && <CheckCircle2 className="h-4 w-4 text-health" />}
    </div>
  );
}

export function ProviderDashboardPreview() {
  const cohorts = [
    { label: "Total enrolled", value: "128", icon: Users, tone: "text-wine" },
    { label: "Out of control", value: "17", icon: TrendingUp, tone: "text-primary" },
    { label: "Drop-out risk", value: "9", icon: AlertTriangle, tone: "text-accent" },
    { label: "Stable", value: "102", icon: Minus, tone: "text-health" },
  ];
  const alerts = [
    { name: "Patient A.", note: "Persistent elevated readings · 7 days", trend: TrendingUp },
    { name: "Patient B.", note: "No readings submitted · 10 days", trend: Minus },
    { name: "Patient C.", note: "Improving trend after plan update", trend: TrendingDown },
  ];
  return (
    <div className="w-full rounded-3xl border bg-card p-5 text-card-foreground shadow-float">
      <div className="flex items-center justify-between">
        <p className="font-display font-bold text-wine">Clinician dashboard</p>
        <SampleBadge />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {cohorts.map((c) => (
          <div key={c.label} className="rounded-2xl bg-sand p-3">
            <c.icon className={`h-4 w-4 ${c.tone}`} />
            <p className={`mt-2 font-display text-2xl font-extrabold ${c.tone}`}>{c.value}</p>
            <p className="text-[11px] text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border p-3">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-wine">
          <Bell className="h-3.5 w-3.5" /> Alert queue
        </p>
        <div className="grid gap-2">
          {alerts.map((a) => (
            <div
              key={a.name}
              className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-xs"
            >
              <span>
                <span className="font-semibold text-wine">{a.name}</span>{" "}
                <span className="text-muted-foreground">— {a.note}</span>
              </span>
              <a.trend className="h-4 w-4 text-primary" />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Patient history and documented actions available per patient.
      </p>
    </div>
  );
}
