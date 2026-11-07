import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Inbox,
  Lock,
  LogOut,
  Printer,
  Search,
  ShieldAlert,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { usePatients, type PatientRecord } from "@/hooks/use-patients";
import { useBpReadings } from "@/hooks/use-bp-readings";
import { useMe, useSignOut } from "@/hooks/use-me";
import {
  getClinicians,
  getEnrollmentRequests,
  respondToEnrollmentRequest,
  addOrUpdatePatient,
  type ClinicianRecord,
  type IncomingEnrollment,
} from "@/lib/store";
import { Logo } from "@/components/site/SiteChrome";
import { BpChart } from "@/components/BpChart";
import { AdjustCarePlanModal } from "@/components/AdjustCarePlanModal";
import { EncounterPdfExport } from "@/components/EncounterPdfExport";
import { ClinicianProfileModal } from "@/components/ClinicianProfileModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/doctor")({
  head: () => ({
    meta: [
      { title: "MoyoDoc — Specialist Panel" },
      { name: "description", content: "Risk-prioritized hypertension patient panel for clinicians." },
    ],
  }),
  component: DoctorDashboardPage,
});

function DoctorDashboardPage() {
  const {
    patients,
    outOfControl,
    disengaged,
    stable,
    acknowledgePatient,
    adjustCarePlan,
    clearAllData,
  } = usePatients();

  const me = useMe();
  const signOut = useSignOut();

  const [clinicians, setClinicians] = useState<ClinicianRecord[]>([]);
  const [activeDoctor, setActiveDoctor] = useState<ClinicianRecord | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [adjustingPatient, setAdjustingPatient] = useState<PatientRecord | null>(null);
  const [exportingPatient, setExportingPatient] = useState<PatientRecord | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [enrollPatientModalOpen, setEnrollPatientModalOpen] = useState(false);
  const [loopBannerPatient, setLoopBannerPatient] = useState<string | null>(null);

  const [incomingRequests, setIncomingRequests] = useState<IncomingEnrollment[]>([]);
  const [inboxExpanded, setInboxExpanded] = useState(true);

  // Direct physician-initiated patient enrollment form
  const [newPatName, setNewPatName] = useState("");
  const [newPatAge, setNewPatAge] = useState("");
  const [newPatPhone, setNewPatPhone] = useState("");
  const [newPatPassword, setNewPatPassword] = useState("");
  const [newPatCounty, setNewPatCounty] = useState("");
  const [newPatConds, setNewPatConds] = useState<string[]>(["Hypertension"]);
  const [newPatRegimen, setNewPatRegimen] = useState("");
  const [newPatSys, setNewPatSys] = useState("");
  const [newPatDia, setNewPatDia] = useState("");

  useEffect(() => {
    const sync = () => {
      const cList = getClinicians();
      setClinicians(cList);
      setActiveDoctor((prev) => {
        if (me.data?.userId) {
          const loggedInDoc = cList.find((c) => c.id === me.data?.userId);
          if (loggedInDoc) return loggedInDoc;
        }
        if (prev && cList.some((c) => c.id === prev.id)) {
          return cList.find((c) => c.id === prev.id) || null;
        }
        return cList[0] || null;
      });
      setIncomingRequests(getEnrollmentRequests());
    };
    sync();
    window.addEventListener("moyodoc:store_updated", sync);
    return () => window.removeEventListener("moyodoc:store_updated", sync);
  }, [me.data?.userId]);

  const { readings: exportReadings } = useBpReadings(exportingPatient?.id);

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.conditions.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === "out") {
      return p.bucket === "OUT_OF_CONTROL" && p.status === "OPEN";
    }
    if (activeTab === "dis") {
      return p.bucket === "DISENGAGED";
    }
    if (activeTab === "stable") {
      return (
        p.bucket === "STABLE" ||
        (p.bucket === "OUT_OF_CONTROL" && p.status === "ACKNOWLEDGED")
      );
    }
    return true;
  });

  const handleAcknowledge = (patient: PatientRecord) => {
    acknowledgePatient(patient.id, activeDoctor?.name);
    setLoopBannerPatient(patient.name);
  };

  const handleAcceptEnrollment = (reqId: string, name: string) => {
    respondToEnrollmentRequest(reqId, "ACCEPTED");
    toast.success(`Enrolled ${name} to your cardiology panel!`);
  };

  const handleDeclineEnrollment = (reqId: string, name: string) => {
    respondToEnrollmentRequest(reqId, "DECLINED");
    toast.info(`Intake request from ${name} declined.`);
  };

  const handleDirectPatientEnroll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatName.trim() || !newPatPhone.trim() || !newPatPassword) return;
    const sys = parseInt(newPatSys, 10);
    const dia = parseInt(newPatDia, 10);

    addOrUpdatePatient({
      name: newPatName.trim(),
      age: parseInt(newPatAge, 10) || 50,
      phone: newPatPhone.trim(),
      password: newPatPassword,
      county: newPatCounty.trim() || "Nairobi",
      conditions: newPatConds,
      currentRegimen: newPatRegimen.trim() || undefined,
      takingMeds: !!newPatRegimen.trim(),
      specialistId: activeDoctor?.id,
      specialistName: activeDoctor?.name,
      hospitalName: activeDoctor?.hospitalName,
      baselineReading:
        !isNaN(sys) && !isNaN(dia) && sys > 0 && dia > 0
          ? { systolic: sys, diastolic: dia }
          : null,
    });

    toast.success(`Patient ${newPatName.trim()} enrolled to panel with login credentials!`);
    setEnrollPatientModalOpen(false);
    setNewPatName("");
    setNewPatAge("");
    setNewPatPhone("");
    setNewPatPassword("");
    setNewPatRegimen("");
    setNewPatSys("");
    setNewPatDia("");
  };

  const pendingCount = incomingRequests.filter((r) => r.status === "PENDING").length;
  const anyRevoked = patients.some((p) => !p.consent.doctorAccessGranted);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-16 text-[#2C3E50]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge
              variant="outline"
              className="border-slate-300 text-[10px] font-semibold text-slate-600"
            >
              Specialist Panel
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {clinicians.length > 1 && activeDoctor && (
              <select
                value={activeDoctor.id}
                onChange={(e) => {
                  const found = clinicians.find((c) => c.id === e.target.value);
                  if (found) setActiveDoctor(found);
                }}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#2C3E50]"
              >
                {clinicians.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.hospitalName})
                  </option>
                ))}
              </select>
            )}
            {activeDoctor ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#2C3E50]">{activeDoctor.name}</span>
                <Badge className="bg-[#7A0000]/10 text-[10px] font-bold text-[#7A0000]">
                  {activeDoctor.title}
                </Badge>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProfileModalOpen(true)}
                className="h-7 text-xs font-semibold text-[#7A0000]"
              >
                Set Up Clinician Profile
              </Button>
            )}
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

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#7A0000]">
              {activeDoctor
                ? `${activeDoctor.hospitalName.toUpperCase()} · ${activeDoctor.department.toUpperCase()}`
                : "SPECIALIST HYPERTENSION PANEL"}
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#2C3E50] sm:text-3xl">
              {activeDoctor ? `${activeDoctor.hospitalName} Patient Panel` : "Clinician Patient Panel"}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              A doctor-vetted view of who needs your attention. Prioritized by risk, then engagement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllData}
              className="text-xs text-slate-600 hover:text-rose-700"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear All Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEnrollPatientModalOpen(true)}
              className="border-[#7A0000]/30 text-xs font-semibold text-[#7A0000] hover:bg-[#FDF2F2]"
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Enroll Patient (Door 2)
            </Button>
            <Button
              size="sm"
              className="bg-[#7A0000] text-xs font-semibold text-white hover:bg-[#5E0000]"
              onClick={() => setProfileModalOpen(true)}
            >
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              {activeDoctor ? "Manage Practice Profile" : "Register Clinician Profile"}
            </Button>
          </div>
        </div>

        {loopBannerPatient && (
          <div className="relative flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-900 shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
              <div>
                <span className="font-bold">{loopBannerPatient}'s</span> alert acknowledged. Alert recorded for follow-up at next clinic appointment. Patient sent reassurance update.
              </div>
            </div>
            <button
              onClick={() => setLoopBannerPatient(null)}
              className="text-emerald-700 hover:text-emerald-900"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {anyRevoked && (
          <div className="relative flex items-center justify-between rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-950 shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="h-5 w-5 flex-shrink-0 text-[#B71C1C]" />
              <div>
                <span className="font-bold">Patient Sovereignty Active:</span> One or more patients have revoked clinician chart access from their companion settings. Longitudinal telemetry is masked in compliance with Kenya DPA 2019.
              </div>
            </div>
            <Badge className="bg-[#B71C1C] text-white">Access Blocked</Badge>
          </div>
        )}

        {incomingRequests.length > 0 && (
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div
              onClick={() => setInboxExpanded(!inboxExpanded)}
              className="flex cursor-pointer items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 transition hover:bg-slate-100/70"
            >
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4 text-[#7A0000]" />
                <span className="text-xs font-bold text-[#2C3E50]">
                  Incoming Patient Enrollment Requests (Door 2)
                </span>
                {pendingCount > 0 && (
                  <Badge className="bg-[#7A0000] text-[10px] font-bold text-white">
                    {pendingCount} Pending
                  </Badge>
                )}
              </div>
              <button type="button" className="text-slate-400 hover:text-slate-600">
                {inboxExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {inboxExpanded && (
              <div className="divide-y divide-slate-100 p-2">
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {req.patientName} ({req.age})
                        </span>
                        <Badge variant="outline" className="text-[10px] text-slate-600">
                          {req.diagnoses}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          · Requested {req.doctorName} at {req.requestedAt}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600">
                        <span className="font-semibold text-slate-700">Symptoms:</span>{" "}
                        {req.symptoms}
                      </p>
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        Caregiver: {req.caregiver} ({req.phone})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === "PENDING" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptEnrollment(req.id, req.patientName)}
                            className="h-7 rounded-lg bg-[#7A0000] px-3 text-xs font-bold text-white hover:bg-[#5E0000]"
                          >
                            Accept & Enroll
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeclineEnrollment(req.id, req.patientName)}
                            className="h-7 rounded-lg border-slate-200 px-2.5 text-xs text-slate-600"
                          >
                            Decline
                          </Button>
                        </>
                      ) : (
                        <Badge
                          className={
                            req.status === "ACCEPTED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }
                        >
                          {req.status === "ACCEPTED" ? "✓ Enrolled to Panel" : "Declined"}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Card className="rounded-xl border border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>Total enrolled</span>
                <Users className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 font-display text-3xl font-extrabold text-[#2C3E50]">
                {patients.length}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">active in panel</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-rose-200 bg-rose-50/50 shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs font-medium text-[#B71C1C]">
                <span>Out-of-Control</span>
                <AlertTriangle className="h-4 w-4 text-[#B71C1C]" />
              </div>
              <div className="mt-2 font-display text-3xl font-extrabold text-[#B71C1C]">
                {outOfControl.length}
              </div>
              <div className="mt-1 text-[11px] font-medium text-[#B71C1C]">
                require review & loop-close
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-amber-200 bg-amber-50/50 shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs font-medium text-amber-800">
                <span>Disengaged</span>
                <UserMinus className="h-4 w-4 text-amber-600" />
              </div>
              <div className="mt-2 font-display text-3xl font-extrabold text-amber-800">
                {disengaged.length}
              </div>
              <div className="mt-1 text-[11px] font-medium text-amber-700">
                no readings / 14+ days
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs font-medium text-emerald-800">
                <span>Stable</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 font-display text-3xl font-extrabold text-emerald-800">
                {stable.length}
              </div>
              <div className="mt-1 text-[11px] font-medium text-emerald-700">
                within target boundaries
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="h-10 bg-slate-200/70 p-1">
              <TabsTrigger
                value="all"
                className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#2C3E50]"
              >
                All patients ({patients.length})
              </TabsTrigger>
              <TabsTrigger
                value="out"
                className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#B71C1C]"
              >
                Out-of-Control ({outOfControl.length})
              </TabsTrigger>
              <TabsTrigger
                value="dis"
                className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-amber-800"
              >
                Disengaged ({disengaged.length})
              </TabsTrigger>
              <TabsTrigger
                value="stable"
                className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-emerald-800"
              >
                Stable ({stable.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search patient (e.g. Jane Doe) or condition…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 border-slate-200 bg-white pl-9 text-xs placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Main Patient Roster Table */}
        <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-[#F8F9FA] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Patient / Care Plan</th>
                  <th className="px-4 py-3">Latest BP</th>
                  <th className="px-4 py-3">Context / Overview</th>
                  <th className="px-4 py-3">Adherence & Routine</th>
                  <th className="px-4 py-3 text-right">Care Team Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-14 text-center text-xs text-muted-foreground">
                      <div className="mx-auto max-w-sm space-y-2">
                        <p className="font-semibold text-slate-700">
                          {patients.length === 0
                            ? "No patients enrolled in the panel yet."
                            : "No patients match the selected filter."}
                        </p>
                        {patients.length === 0 && (
                          <>
                            <p className="text-[11px] text-slate-400">
                              Enroll a patient directly using the button above, or register a patient through Door 1 (/register or /patient).
                            </p>
                            <div className="pt-2">
                              <Button
                                size="sm"
                                onClick={() => setEnrollPatientModalOpen(true)}
                                className="bg-[#7A0000] text-xs font-semibold text-white hover:bg-[#5E0000]"
                              >
                                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                                Enroll First Patient
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const isAcknowledged = patient.status === "ACKNOWLEDGED";
                    const isOut = patient.bucket === "OUT_OF_CONTROL";
                    const isDis = patient.bucket === "DISENGAGED";
                    const isRevoked = !patient.consent.doctorAccessGranted;

                    return (
                      <tr
                        key={patient.id}
                        className={`transition hover:bg-slate-50/70 ${
                          isRevoked ? "bg-rose-50/30 opacity-75" : ""
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-start gap-2.5">
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
                              {patient.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => !isRevoked && setSelectedPatient(patient)}
                                  className={`font-display font-semibold text-[#2C3E50] ${
                                    isRevoked
                                      ? "cursor-not-allowed text-slate-400"
                                      : "hover:text-[#7A0000] hover:underline"
                                  }`}
                                >
                                  {patient.name} · {patient.age}y
                                </button>
                                <Badge
                                  variant="secondary"
                                  className="border border-[#7A0000]/20 bg-[#FDF2F2] px-2 py-0 text-[10px] font-bold text-[#7A0000]"
                                >
                                  {patient.comorbidityBadge}
                                </Badge>
                                {isRevoked && (
                                  <Badge className="bg-[#B71C1C] text-[10px] text-white">
                                    <Lock className="mr-1 h-2.5 w-2.5" />
                                    Consent Revoked
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-0.5 text-xs text-muted-foreground">
                                {patient.caregiverContact ? (
                                  <span>Caregiver: {patient.caregiverContact}</span>
                                ) : (
                                  <span>Phone: {patient.phone}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          {isRevoked ? (
                            <div className="font-mono text-sm font-semibold text-slate-400">
                              *** / *** mmHg
                              <div className="text-[10px] text-rose-600">Masked by patient</div>
                            </div>
                          ) : patient.latestBp ? (
                            <>
                              <div className="font-display text-base font-bold text-[#2C3E50]">
                                {patient.latestBp.systolic}/{patient.latestBp.diastolic}
                                <span className="ml-1 text-xs font-normal text-slate-500">
                                  mmHg
                                </span>
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {patient.latestBp.measuredAt}
                              </div>
                            </>
                          ) : (
                            <div className="text-xs italic text-slate-400">No readings yet</div>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {isRevoked ? (
                            <div className="text-xs italic text-slate-400">
                              Data access restricted by patient consent hub.
                            </div>
                          ) : (
                            <>
                              <div className="text-xs font-medium text-[#2C3E50]">
                                {patient.contextNote}
                              </div>
                              <div className="mt-1">
                                {isAcknowledged ? (
                                  <Badge className="bg-emerald-100 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-100">
                                    <Check className="mr-1 h-3 w-3 text-emerald-600" />
                                    Acknowledged · Patient notified
                                  </Badge>
                                ) : isOut ? (
                                  <Badge className="bg-rose-100 text-[10px] font-semibold text-rose-800 hover:bg-rose-100">
                                    <AlertTriangle className="mr-1 h-3 w-3 text-rose-600" />
                                    Elevated BP Alert
                                  </Badge>
                                ) : isDis ? (
                                  <Badge className="bg-amber-100 text-[10px] font-semibold text-amber-800 hover:bg-amber-100">
                                    <Clock className="mr-1 h-3 w-3 text-amber-600" />
                                    Awaiting readings / Disengaged
                                  </Badge>
                                ) : (
                                  <Badge className="bg-emerald-50 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-50">
                                    Stable
                                  </Badge>
                                )}
                              </div>
                            </>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          {isRevoked ? (
                            <div className="text-xs text-slate-400">---</div>
                          ) : (
                            <>
                              <div className="text-xs font-semibold text-[#2C3E50]">
                                {patient.medicationAdherence}% meds ({patient.medsStreak}d streak)
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {patient.walksCompleted}/7 daily walks
                              </div>
                            </>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isOut && !isAcknowledged && !isRevoked && (
                              <Button
                                size="sm"
                                onClick={() => handleAcknowledge(patient)}
                                className="h-8 bg-[#7A0000] px-3 text-xs font-semibold text-white shadow-xs hover:bg-[#5E0000]"
                              >
                                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                Acknowledge
                              </Button>
                            )}

                            {isAcknowledged && (
                              <Badge className="border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-800">
                                ✓ Acknowledged
                              </Badge>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isRevoked}
                              onClick={() => setSelectedPatient(patient)}
                              className="h-8 border-slate-200 px-2.5 text-xs text-slate-700 hover:bg-slate-100"
                            >
                              Trend
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isRevoked || (isOut && !isAcknowledged)}
                              onClick={() => setAdjustingPatient(patient)}
                              className={`h-8 border-slate-200 px-2.5 text-xs font-semibold ${
                                isOut && !isAcknowledged
                                  ? "cursor-not-allowed opacity-50 text-slate-400"
                                  : "text-[#7A0000] hover:bg-[#FDF2F2]"
                              }`}
                              title={
                                isOut && !isAcknowledged
                                  ? "Please acknowledge alert first before adjusting care plan"
                                  : undefined
                              }
                            >
                              {patient.adjustedPlan ? "Update Plan" : "Adjust Plan"}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isRevoked}
                              onClick={() => setExportingPatient(patient)}
                              className="h-8 px-2 text-xs text-slate-500 hover:text-slate-800"
                              title="Export 30-Day Clinical PDF"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          {patient.adjustedPlan && !isRevoked && (
                            <div className="mt-1.5 text-right">
                              <Badge className="border border-sky-300 bg-sky-50 text-[10px] font-semibold text-sky-800">
                                Plan: {patient.adjustedPlan.split("·")[0]}
                              </Badge>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      {/* Door 2 Direct Patient Enrollment Modal */}
      <Dialog open={enrollPatientModalOpen} onOpenChange={setEnrollPatientModalOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-[#2C3E50]">
              Enroll Patient to Panel (Door 2)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Directly onboard a patient from your clinic consultation into MoyoDoc continuous care.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDirectPatientEnroll} className="my-3 space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs font-semibold">Patient Full Name *</Label>
                <Input
                  required
                  value={newPatName}
                  onChange={(e) => setNewPatName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Age *</Label>
                <Input
                  required
                  type="number"
                  min={18}
                  max={110}
                  value={newPatAge}
                  onChange={(e) => setNewPatAge(e.target.value)}
                  placeholder="e.g. 54"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Phone Number (Login ID) *</Label>
                <Input
                  required
                  value={newPatPhone}
                  onChange={(e) => setNewPatPhone(e.target.value)}
                  placeholder="e.g. +254 712 345 678"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Patient Login Password *</Label>
                <Input
                  required
                  type="password"
                  value={newPatPassword}
                  onChange={(e) => setNewPatPassword(e.target.value)}
                  placeholder="Set patient password"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">County *</Label>
              <Input
                required
                value={newPatCounty}
                onChange={(e) => setNewPatCounty(e.target.value)}
                placeholder="e.g. Nairobi"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Diagnoses</Label>
              <div className="flex flex-wrap gap-1.5">
                {["Hypertension", "Type 2 Diabetes", "CKD", "High Cholesterol", "Heart Failure"].map(
                  (c) => {
                    const active = newPatConds.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() =>
                          setNewPatConds((prev) =>
                            prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
                          )
                        }
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          active
                            ? "bg-[#7A0000] text-white"
                            : "border border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {active ? `✓ ${c}` : `+ ${c}`}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Prescribed Medication Regimen (optional)</Label>
              <Input
                value={newPatRegimen}
                onChange={(e) => setNewPatRegimen(e.target.value)}
                placeholder="e.g. Amlodipine 5mg OD"
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Clinic Systolic BP (optional)</Label>
                <Input
                  type="number"
                  min={50}
                  max={300}
                  value={newPatSys}
                  onChange={(e) => setNewPatSys(e.target.value)}
                  placeholder="e.g. 150"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Clinic Diastolic BP (optional)</Label>
                <Input
                  type="number"
                  min={30}
                  max={200}
                  value={newPatDia}
                  onChange={(e) => setNewPatDia(e.target.value)}
                  placeholder="e.g. 95"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEnrollPatientModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#7A0000] text-white hover:bg-[#5E0000]"
              >
                Enroll Patient
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          open={!!selectedPatient}
          onOpenChange={(open) => !open && setSelectedPatient(null)}
          onAcknowledge={handleAcknowledge}
          onExportPdf={() => {
            const p = selectedPatient;
            setSelectedPatient(null);
            setExportingPatient(p);
          }}
        />
      )}

      <AdjustCarePlanModal
        patient={adjustingPatient}
        open={!!adjustingPatient}
        onOpenChange={(open) => !open && setAdjustingPatient(null)}
        onPlanAdjusted={(patientId, planSummary) => {
          adjustCarePlan(patientId, planSummary, activeDoctor?.name);
        }}
      />

      <EncounterPdfExport
        patient={exportingPatient}
        readings={exportReadings}
        open={!!exportingPatient}
        onOpenChange={(open) => !open && setExportingPatient(null)}
      />

      <ClinicianProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        existingClinician={activeDoctor}
        onSaved={(doc) => setActiveDoctor(doc)}
      />
    </div>
  );
}

function PatientDetailModal({
  patient,
  open,
  onOpenChange,
  onAcknowledge,
  onExportPdf,
}: {
  patient: PatientRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcknowledge: (p: PatientRecord) => void;
  onExportPdf: () => void;
}) {
  const { readings } = useBpReadings(patient.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-xl font-bold text-[#2C3E50]">
              {patient.name} · {patient.age}y
            </DialogTitle>
            <Badge className="bg-[#FDF2F2] font-bold text-[#7A0000]">
              {patient.comorbidityBadge}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {patient.caregiverContact
              ? `Caregiver: ${patient.caregiverContact}`
              : `Phone: ${patient.phone}`}
          </DialogDescription>
        </DialogHeader>

        <div className="my-3 space-y-4">
          <div className="grid grid-cols-3 gap-2.5 rounded-xl bg-[#F8F9FA] p-3 text-center">
            <div>
              <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                Latest BP
              </div>
              <div className="font-display text-lg font-extrabold text-[#7A0000]">
                {patient.latestBp
                  ? `${patient.latestBp.systolic}/${patient.latestBp.diastolic}`
                  : "—"}{" "}
                <span className="text-[10px] font-normal">mmHg</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                Meds Adherence
              </div>
              <div className="font-display text-lg font-extrabold text-[#1E7E34]">
                {patient.medicationAdherence}%
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                Daily Walks
              </div>
              <div className="font-display text-lg font-extrabold text-[#2C3E50]">
                {patient.walksCompleted}/7 days
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 text-xs font-semibold text-[#2C3E50]">
              Longitudinal Blood Pressure Trend
            </div>
            <BpChart readings={readings} height={210} />
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <span className="font-semibold text-[#2C3E50]">Clinical Context:</span>{" "}
            {patient.contextNote}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-slate-300 text-xs text-[#2C3E50]"
              onClick={onExportPdf}
            >
              <Printer className="h-3.5 w-3.5 text-[#7A0000]" />
              Export 30-Day PDF
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link to="/doctor/patient/$patientId" params={{ patientId: patient.id }}>
                Full Patient View
              </Link>
            </Button>
            {patient.bucket === "OUT_OF_CONTROL" && patient.status !== "ACKNOWLEDGED" && (
              <Button
                size="sm"
                className="bg-[#7A0000] text-xs font-semibold text-white hover:bg-[#5E0000]"
                onClick={() => {
                  onAcknowledge(patient);
                  onOpenChange(false);
                }}
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Acknowledge & Notify Patient
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
