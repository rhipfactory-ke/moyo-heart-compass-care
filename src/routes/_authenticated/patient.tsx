import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Bluetooth,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Edit3,
  FileText,
  Flame,
  Footprints,
  Heart,
  Lock,
  LogOut,
  Pill,
  Stethoscope,
  UserPlus,
  X,
} from "lucide-react";
import { usePatient, usePatients } from "@/hooks/use-patients";
import { useBpReadings } from "@/hooks/use-bp-readings";
import { useMe, useSignOut } from "@/hooks/use-me";
import { logPatientAdherence } from "@/lib/store";
import { BpChart } from "@/components/BpChart";
import { BpScanModal } from "@/components/BpScanModal";
import { WeeklySymptomsModal } from "@/components/WeeklySymptomsModal";
import { PrivacyConsentDialog } from "@/components/PrivacyConsentDialog";
import { SpecialistDirectoryModal } from "@/components/SpecialistDirectoryModal";
import { PatientConsentModal } from "@/components/PatientConsentModal";
import { RiskIntakeModal } from "@/components/RiskIntakeModal";
import { Logo } from "@/components/site/SiteChrome";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/patient")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      patientId: (search?.patientId as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "MoyoDoc — Patient Companion" },
      { name: "description", content: "Blood pressure tracking and cardiology continuity." },
    ],
  }),
  component: PatientDashboard,
});

function PatientDashboard() {
  const search = Route.useSearch();
  const me = useMe();
  const { patients } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(
    search?.patientId || me.data?.userId,
  );
  const { patient } = usePatient(selectedPatientId || me.data?.userId || search?.patientId);
  const { readings, last7DaysReadings, latestReading, logReading } = useBpReadings(patient?.id);
  const signOut = useSignOut();

  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"PHOTO" | "MANUAL" | "BLUETOOTH">("PHOTO");
  const [symptomsModalOpen, setSymptomsModalOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<"7" | "30">("7");

  const todayStr = new Date().toISOString().slice(0, 10);
  const [medsTaken, setMedsTaken] = useState(false);
  const [walkCompleted, setWalkCompleted] = useState(false);
  const [dismissedLoopBanner, setDismissedLoopBanner] = useState(false);
  const [dismissedPlanBanner, setDismissedPlanBanner] = useState(false);
  const [latestLogPill, setLatestLogPill] = useState<string | null>(null);

  useEffect(() => {
    if (patient) {
      setMedsTaken(patient.lastMedsLoggedDate === todayStr);
      setWalkCompleted(patient.lastWalkLoggedDate === todayStr);
      setDismissedLoopBanner(false);
      setDismissedPlanBanner(false);
    }
  }, [patient?.id, patient?.lastMedsLoggedDate, patient?.lastWalkLoggedDate, todayStr]);

  const handleSnapPhoto = () => {
    setModalMode("PHOTO");
    setPhotoModalOpen(true);
  };

  const handleManualEntry = () => {
    setModalMode("MANUAL");
    setPhotoModalOpen(true);
  };

  const handleBluetoothSync = () => {
    setModalMode("BLUETOOTH");
    setPhotoModalOpen(true);
  };

  const handleConfirmReading = (newReading: {
    systolic: number;
    diastolic: number;
    pulse: number;
    source: "PHOTO_OCR" | "MANUAL" | "BLUETOOTH";
    confidence: string;
  }) => {
    logReading(newReading);
    setLatestLogPill(
      `New monitor reading logged — ${newReading.systolic}/${newReading.diastolic} mmHg, Pulse ${newReading.pulse} bpm · Just now`,
    );
  };

  // Empty state if no patient registered yet
  if (!patient) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] pb-24 text-[#2C3E50]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3 sm:max-w-xl">
            <Logo />
            <Button
              size="sm"
              onClick={() => setIntakeOpen(true)}
              className="bg-[#7A0000] text-xs font-semibold text-white hover:bg-[#5E0000]"
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Register Patient
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-md px-4 py-12 sm:max-w-xl">
          <Card className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#7A0000]">
              <Heart className="h-7 w-7" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold text-[#2C3E50]">
              No Patient Profile Registered Yet
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Start by completing the Door 1 Cardiovascular Risk Intake or registering a patient profile to unlock home blood pressure logging, medication adherence streaks, and specialist connection.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => setIntakeOpen(true)}
                className="bg-[#7A0000] text-xs font-bold text-white hover:bg-[#5E0000]"
              >
                <Compass className="mr-1.5 h-4 w-4" />
                Complete Door 1 Intake Modal
              </Button>
              <Button asChild variant="outline" className="text-xs font-semibold">
                <Link to="/register">Open Full Registration Wizard</Link>
              </Button>
            </div>
          </Card>
        </main>

        <RiskIntakeModal
          open={intakeOpen}
          onOpenChange={setIntakeOpen}
          onComplete={(created) => setSelectedPatientId(created.id)}
        />
      </div>
    );
  }

  const displaySystolic = latestReading?.systolic ?? patient.latestBp?.systolic;
  const displayDiastolic = latestReading?.diastolic ?? patient.latestBp?.diastolic;
  const isHighBp =
    displaySystolic !== undefined &&
    displayDiastolic !== undefined &&
    (displaySystolic >= 140 || displayDiastolic >= 90);
  const chartData = timeRange === "7" ? last7DaysReadings : readings;
  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 text-[#2C3E50]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3 sm:max-w-xl">
          <Logo />

          <div className="flex items-center gap-2">
            {patients.length > 1 && (
              <select
                value={patient.id}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-[#2C3E50]"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIntakeOpen(true)}
              className="h-7 rounded-lg border-slate-200 px-2 text-[11px] font-semibold text-slate-700 hover:text-[#7A0000]"
            >
              <Compass className="mr-1 h-3 w-3 text-[#7A0000]" />
              Intake
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConsentOpen(true)}
              className="h-7 rounded-lg border-slate-200 px-2 text-[11px] font-semibold text-slate-700 hover:text-[#7A0000]"
            >
              <Lock className="mr-1 h-3 w-3 text-slate-600" />
              Consent
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7A0000] text-xs font-bold text-white shadow-sm">
              {initials}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-4 py-5 sm:max-w-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#2C3E50]">
              Hello, {patient.name.split(" ")[0]}
            </h1>
            <p className="text-xs text-muted-foreground">
              {patient.specialistName
                ? `Connected with ${patient.specialistName} (${patient.hospitalName || "MoyoDoc"})`
                : "Not connected to a specialist yet — tap Care team below to connect."}
            </p>
          </div>
          <Badge variant="outline" className="border-[#7A0000]/30 bg-[#FDF2F2] text-[10px] font-bold text-[#7A0000]">
            {patient.comorbidityBadge}
          </Badge>
        </div>

        {latestLogPill && (
          <div className="relative flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-900 shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span>{latestLogPill}</span>
            </div>
            <button
              onClick={() => setLatestLogPill(null)}
              className="text-emerald-700 hover:text-emerald-900"
              aria-label="Dismiss pill"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {patient.status === "ACKNOWLEDGED" && !dismissedLoopBanner && (
          <div className="relative flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900 shadow-sm transition-all animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
            <div className="flex-1 pr-4">
              <span className="font-semibold">
                {patient.acknowledgedBy || patient.specialistName || "Your specialist"}
              </span>{" "}
              reviewed your readings and acknowledged your alert — keep up the daily routine!
            </div>
            <button
              onClick={() => setDismissedLoopBanner(true)}
              className="text-emerald-700 hover:text-emerald-900"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {patient.adjustedPlan && !dismissedPlanBanner && (
          <div className="relative flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-3.5 text-xs text-sky-950 shadow-sm transition-all animate-in fade-in slide-in-from-top-2">
            <Pill className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-700" />
            <div className="flex-1 pr-4">
              <div className="font-bold text-sky-900">
                Care Plan Adjusted by {patient.adjustedBy || patient.specialistName || "Specialist"}:
              </div>
              <div className="mt-0.5 font-medium text-sky-800">{patient.adjustedPlan}</div>
            </div>
            <button
              onClick={() => setDismissedPlanBanner(true)}
              className="text-sky-700 hover:text-sky-900"
              aria-label="Dismiss care plan banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* 1. Daily Adherence Card */}
        <Card className="overflow-hidden rounded-2xl border-none bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Pill className="h-3.5 w-3.5 text-[#7A0000]" />
                Daily Adherence
              </div>
              <span className="text-[11px] font-medium text-slate-400">Today</span>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold text-[#2C3E50]">
                Took today's medication?
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = !medsTaken;
                  setMedsTaken(next);
                  const updated = logPatientAdherence(patient.id, { medsTaken: next });
                  toast.success(
                    next
                      ? `Medication logged: ${updated?.medsStreak ?? 1}-day streak!`
                      : "Today's medication log unchecked.",
                  );
                }}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-sm transition-all ${
                  medsTaken
                    ? "bg-[#1E7E34] hover:bg-[#186429]"
                    : "bg-[#7A0000] hover:bg-[#5E0000]"
                }`}
              >
                <Check className="h-4 w-4 stroke-[3]" />
                {medsTaken ? "Confirmed for Today" : "Yes, I took my dose"}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                {patient.medsStreak > 0 ? (
                  <span className="flex items-center gap-1 font-medium text-[#1E7E34]">
                    <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    {patient.medsStreak}-Day Streak · {patient.medicationAdherence}% weekly adherence
                  </span>
                ) : (
                  <span>One tap to record today's dose</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Lifestyle Empowerment Card */}
        <Card className="rounded-2xl border-none bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Footprints className="h-3.5 w-3.5 text-[#7A0000]" />
                Lifestyle Empowerment
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {patient.walksCompleted}/7 days this week
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <div className="text-xs font-semibold text-[#2C3E50]">
                  Completed 20-min walk / Low-sodium diet
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Track healthy habits alongside medication
                </div>
              </div>
              <Switch
                checked={walkCompleted}
                onCheckedChange={(val) => {
                  setWalkCompleted(val);
                  logPatientAdherence(patient.id, { walkCompleted: val });
                  toast.success(
                    val ? "Healthy lifestyle habit completed today!" : "Habit unchecked.",
                  );
                }}
                className="data-[state=checked]:bg-[#1E7E34]"
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. Blood Pressure Trend Card */}
        <Card className="rounded-2xl border-none bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Blood Pressure
              </div>
              <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setTimeRange("7")}
                  className={`rounded-md px-2 py-0.5 text-xs font-semibold transition ${
                    timeRange === "7"
                      ? "bg-white text-[#7A0000] shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  7 days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange("30")}
                  className={`rounded-md px-2 py-0.5 text-xs font-semibold transition ${
                    timeRange === "30"
                      ? "bg-white text-[#7A0000] shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  30 days
                </button>
              </div>
            </div>

            <div className="mb-3 flex items-baseline justify-between border-b border-slate-100 pb-3">
              <div>
                {displaySystolic !== undefined && displayDiastolic !== undefined ? (
                  <>
                    <span className="font-display text-3xl font-extrabold text-[#2C3E50]">
                      {displaySystolic}/{displayDiastolic}
                    </span>
                    <span className="ml-1 text-xs font-medium text-slate-500">mmHg</span>
                  </>
                ) : (
                  <span className="font-display text-xl font-bold text-slate-400">
                    No readings yet
                  </span>
                )}
              </div>
              {displaySystolic !== undefined && displayDiastolic !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {patient.latestBp?.measuredAt || "Latest"}
                  </span>
                  {isHighBp ? (
                    <Badge className="bg-[#B71C1C] text-[10px] font-semibold text-white hover:bg-[#B71C1C]">
                      Above target
                    </Badge>
                  ) : (
                    <Badge className="bg-[#1E7E34] text-[10px] font-semibold text-white hover:bg-[#1E7E34]">
                      In range
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <BpChart readings={chartData} height={200} />
          </CardContent>
        </Card>

        {/* 4. Action Section */}
        <div className="space-y-2.5">
          <Button
            size="lg"
            onClick={handleSnapPhoto}
            className="h-14 w-full rounded-2xl bg-[#7A0000] text-base font-bold text-white shadow-md transition-all hover:bg-[#5E0000] active:scale-[0.99]"
          >
            <Camera className="mr-2 h-5 w-5" />
            Snap BP Photo (AI Auto-Log)
          </Button>

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="outline"
              onClick={handleBluetoothSync}
              className="h-11 rounded-xl border-slate-200 bg-white text-xs font-semibold text-[#2C3E50] hover:bg-slate-50"
            >
              <Bluetooth className="mr-1.5 h-4 w-4 text-[#7A0000]" />
              Bluetooth
            </Button>

            <Button
              variant="outline"
              onClick={handleManualEntry}
              className="h-11 rounded-xl border-slate-200 bg-white text-xs font-semibold text-[#2C3E50] hover:bg-slate-50"
            >
              <Edit3 className="mr-1.5 h-4 w-4 text-[#7A0000]" />
              Manual entry
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => setSymptomsModalOpen(true)}
            className="h-auto w-full justify-between rounded-xl border-slate-200 bg-white p-3.5 text-left shadow-xs hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-[#7A0000]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#2C3E50]">Log Weekly Symptoms</div>
                <div className="text-[10px] text-muted-foreground">
                  Record headache, chest discomfort, or dizziness
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#7A0000]">Open &rarr;</span>
          </Button>

          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="font-medium underline hover:text-[#7A0000]"
            >
              Kenya DPA & Clinical Governance
            </button>
          </div>
        </div>
      </main>

      <RiskIntakeModal
        open={intakeOpen}
        onOpenChange={setIntakeOpen}
        existingPatient={patient}
      />

      <PatientConsentModal
        open={consentOpen}
        onOpenChange={setConsentOpen}
        patient={patient}
      />

      <SpecialistDirectoryModal
        open={directoryOpen}
        onOpenChange={setDirectoryOpen}
        patient={patient}
      />

      <PrivacyConsentDialog open={privacyOpen} onOpenChange={setPrivacyOpen} />

      <BpScanModal
        open={photoModalOpen}
        onOpenChange={setPhotoModalOpen}
        onConfirmReading={handleConfirmReading}
        initialMode={modalMode}
      />

      <WeeklySymptomsModal
        open={symptomsModalOpen}
        onOpenChange={setSymptomsModalOpen}
        patientId={patient.id}
      />

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 py-2 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-around sm:max-w-xl">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex flex-col items-center gap-1 text-[#7A0000]"
          >
            <Heart className="h-5 w-5 fill-[#7A0000]" />
            <span className="text-[10px] font-bold">Today</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTimeRange(timeRange === "7" ? "30" : "7");
              toast.info(
                `Switched BP chart to ${timeRange === "7" ? "30-day" : "7-day"} longitudinal view.`,
              );
            }}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600"
          >
            <Clock className="h-5 w-5" />
            <span className="text-[10px] font-medium">History ({timeRange}d)</span>
          </button>

          <button
            type="button"
            onClick={() => setDirectoryOpen(true)}
            className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600"
          >
            <Stethoscope className="h-5 w-5" />
            <span className="text-[10px] font-medium">Care team</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
