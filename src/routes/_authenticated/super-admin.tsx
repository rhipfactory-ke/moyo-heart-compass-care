import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  Lock,
  LogOut,
  Plus,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/site/SiteChrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useMe, useSignOut } from "@/hooks/use-me";
import {
  getHospitals,
  addHospital,
  getClinicians,
  getPatients,
  getSymptomCheckins,
  type HospitalOrg,
  type ClinicianRecord,
  type PatientRecord,
  type WeeklySymptomCheckin,
} from "@/lib/store";

export const Route = createFileRoute("/_authenticated/super-admin")({
  head: () => ({
    meta: [
      { title: "MoyoDoc — Super Admin Intelligence Layer" },
      {
        name: "description",
        content: "Level 4 De-Identified Macro Population Intelligence & Platform Administration",
      },
    ],
  }),
  component: SuperAdminPage,
});

function SuperAdminPage() {
  const me = useMe();
  const signOut = useSignOut();

  const [hospitals, setHospitals] = useState<HospitalOrg[]>([]);
  const [clinicians, setClinicians] = useState<ClinicianRecord[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [symptoms, setSymptoms] = useState<WeeklySymptomCheckin[]>([]);
  const [activeTab, setActiveTab] = useState("hospitals");
  const [newModalOpen, setNewModalOpen] = useState(false);

  const [hName, setHName] = useState("");
  const [hCounty, setHCounty] = useState("");
  const [hLicense, setHLicense] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    const sync = () => {
      setHospitals(getHospitals());
      setClinicians(getClinicians());
      setPatients(getPatients());
      setSymptoms(getSymptomCheckins());
    };
    sync();
    window.addEventListener("moyodoc:store_updated", sync);
    return () => window.removeEventListener("moyodoc:store_updated", sync);
  }, []);

  const handleRegisterHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hName.trim() || !adminEmail.trim() || !adminPassword) return;
    addHospital({
      name: hName.trim(),
      county: hCounty.trim() || "Nairobi",
      licenseNumber: hLicense.trim() || undefined,
      adminName: adminName.trim() || "Hospital Administrator",
      adminEmail: adminEmail.trim(),
      adminPassword,
    });
    toast.success(
      `Enrolled ${hName.trim()} and provisioned Hospital Admin credentials (${adminEmail.trim()}).`,
    );
    setNewModalOpen(false);
    setHName("");
    setHCounty("");
    setHLicense("");
    setAdminName("");
    setAdminEmail("");
    setAdminPassword("");
  };

  // Compute live de-identified macro metrics from actual registered data
  const totalPatients = patients.length;
  const patientsWithReadings = patients.filter((p) => p.latestBp !== null);
  const inTargetCount = patientsWithReadings.filter(
    (p) => p.latestBp!.systolic < 140 && p.latestBp!.diastolic < 90,
  ).length;
  const stage1Count = patientsWithReadings.filter(
    (p) =>
      (p.latestBp!.systolic >= 140 && p.latestBp!.systolic < 160) ||
      (p.latestBp!.diastolic >= 90 && p.latestBp!.diastolic < 100),
  ).length;
  const stage2Count = patientsWithReadings.filter(
    (p) => p.latestBp!.systolic >= 160 || p.latestBp!.diastolic >= 100,
  ).length;

  const pct = (num: number, den: number) =>
    den > 0 ? `${((num / den) * 100).toFixed(1)}%` : "0%";

  const acknowledgedCount = patients.filter((p) => p.status === "ACKNOWLEDGED").length;
  const planAdjustedCount = patients.filter((p) => !!p.adjustedPlan).length;
  const elevatedEventsCount = patients.filter((p) => p.bucket === "OUT_OF_CONTROL").length;

  const headacheCount = symptoms.filter((s) => s.headache).length;
  const dizzinessCount = symptoms.filter((s) => s.dizziness).length;
  const chestCount = symptoms.filter((s) => s.chestDiscomfort).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-16 text-[#2C3E50]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-900 text-[10px] font-bold text-white">
                  SUPER ADMIN · PLATFORM GOVERNANCE
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="border border-emerald-300 bg-emerald-50 text-[11px] font-bold text-emerald-800">
              🔒 Zero-PHI Mode Active
            </Badge>
            {me.data?.name && (
              <span className="hidden text-xs font-semibold text-slate-700 md:inline">
                {me.data.name}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="mr-1 h-3.5 w-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-950">
          <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-700" />
          <div className="leading-relaxed">
            <span className="font-bold">Statutory Privacy Guardrail (Kenya DPA 2019):</span> As
            Super Admin, you enroll Partner Hospitals, provision Hospital Admin credentials, and
            monitor de-identified macro population health telemetry. Individual patient medical
            charts are strictly masked.
          </div>
        </div>

        {/* 4 Macro KPI Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Card className="rounded-xl border border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Enrolled Hospitals
              </div>
              <div className="mt-1 font-display text-3xl font-extrabold text-[#2C3E50]">
                {hospitals.length}
              </div>
              <div className="text-[11px] font-medium text-emerald-700">
                Active partner facilities
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Registered Specialists
              </div>
              <div className="mt-1 font-display text-3xl font-extrabold text-[#7A0000]">
                {clinicians.filter((c) => c.status === "ACTIVE").length}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Verified by Hospital Admins
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Total Cohort Monitored
              </div>
              <div className="mt-1 font-display text-3xl font-extrabold text-[#2C3E50]">
                {totalPatients}
              </div>
              <div className="text-[11px] font-medium text-emerald-700">
                Enrolled patients (De-identified)
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Loops Closed
              </div>
              <div className="mt-1 font-display text-3xl font-extrabold text-[#1E7E34]">
                {acknowledgedCount}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {planAdjustedCount} care plans titrated
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="bg-slate-200/60 p-1">
              <TabsTrigger value="hospitals" className="text-xs font-semibold">
                Enrolled Hospital Network ({hospitals.length})
              </TabsTrigger>
              <TabsTrigger value="macro-analytics" className="text-xs font-semibold">
                Macro Population Health Intelligence
              </TabsTrigger>
            </TabsList>

            <Button
              size="sm"
              onClick={() => setNewModalOpen(true)}
              className="gap-1.5 bg-[#7A0000] text-xs font-semibold text-white hover:bg-[#5E0000]"
            >
              <Plus className="h-4 w-4" />
              Enroll Partner Hospital
            </Button>
          </div>

          <TabsContent value="hospitals">
            <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-[#F8F9FA] text-[11px] font-semibold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Hospital Facility</th>
                      <th className="px-4 py-3">County</th>
                      <th className="px-4 py-3">License Number</th>
                      <th className="px-4 py-3">Hospital Admin Account</th>
                      <th className="px-4 py-3">Verified Specialists</th>
                      <th className="px-4 py-3">Enrolled Cohort</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {hospitals.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted-foreground">
                          <p className="font-semibold text-slate-700">
                            No partner hospitals enrolled yet.
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            Click "Enroll Partner Hospital" above to register a healthcare facility and provision its Hospital Admin login credentials.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      hospitals.map((h) => {
                        const hDocs = clinicians.filter(
                          (c) =>
                            c.hospitalName.toLowerCase() === h.name.toLowerCase() &&
                            c.status === "ACTIVE",
                        ).length;
                        const hPats = patients.filter(
                          (p) => p.hospitalName?.toLowerCase() === h.name.toLowerCase(),
                        ).length;
                        return (
                          <tr key={h.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3.5 font-bold text-[#2C3E50]">{h.name}</td>
                            <td className="px-4 py-3.5 text-slate-600">{h.county}</td>
                            <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                              {h.licenseNumber}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-slate-800">
                                {h.adminName || "Hospital Admin"}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {h.adminEmail || "—"}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-semibold text-slate-700">{hDocs}</td>
                            <td className="px-4 py-3.5 font-bold text-slate-800">{hPats}</td>
                            <td className="px-4 py-3.5">
                              <Badge className="bg-emerald-100 text-[10px] font-semibold text-emerald-800">
                                {h.status}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="macro-analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="flex items-center gap-2 font-display text-sm font-bold text-[#2C3E50]">
                      <Activity className="h-4 w-4 text-[#1E7E34]" />
                      Population Blood Pressure Control Status
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Live distribution across {patientsWithReadings.length} patients with recorded BP.
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-[10px] text-emerald-800">
                    {pct(inTargetCount, patientsWithReadings.length)} CONTROLLED
                  </Badge>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div>
                      <div className="font-bold text-emerald-900">
                        In Target Range (&lt;140/90 mmHg)
                      </div>
                      <div className="text-[11px] text-emerald-700">
                        {inTargetCount} patients in range
                      </div>
                    </div>
                    <div className="font-display text-2xl font-black text-emerald-800">
                      {pct(inTargetCount, patientsWithReadings.length)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div>
                      <div className="font-bold text-amber-900">
                        Stage 1 HTN (140–159 / 90–99 mmHg)
                      </div>
                      <div className="text-[11px] text-amber-700">
                        {stage1Count} patients
                      </div>
                    </div>
                    <div className="font-display text-2xl font-black text-amber-800">
                      {pct(stage1Count, patientsWithReadings.length)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-3">
                    <div>
                      <div className="font-bold text-rose-900">
                        Stage 2 / Crisis (≥160 / ≥100 mmHg)
                      </div>
                      <div className="text-[11px] text-rose-700">
                        {stage2Count} patients
                      </div>
                    </div>
                    <div className="font-display text-2xl font-black text-[#B71C1C]">
                      {pct(stage2Count, patientsWithReadings.length)}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="border-b pb-3">
                  <h3 className="flex items-center gap-2 font-display text-sm font-bold text-[#2C3E50]">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Reported Symptom Frequency ({symptoms.length} check-ins)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Live telemetry from weekly patient check-ins.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-[10px] font-bold uppercase text-slate-500">Headache</div>
                    <div className="mt-1 font-display text-2xl font-black text-[#7A0000]">
                      {pct(headacheCount, symptoms.length)}
                    </div>
                    <div className="text-[10px] text-slate-400">{headacheCount} reports</div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-[10px] font-bold uppercase text-slate-500">Dizziness</div>
                    <div className="mt-1 font-display text-2xl font-black text-amber-600">
                      {pct(dizzinessCount, symptoms.length)}
                    </div>
                    <div className="text-[10px] text-slate-400">{dizzinessCount} reports</div>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="text-[10px] font-bold uppercase text-slate-500">
                      Chest Discomfort
                    </div>
                    <div className="mt-1 font-display text-2xl font-black text-[#B71C1C]">
                      {pct(chestCount, symptoms.length)}
                    </div>
                    <div className="text-[10px] text-slate-400">{chestCount} reports</div>
                  </div>
                </div>
              </Card>

              <Card className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs md:col-span-2">
                <div className="border-b pb-3">
                  <h3 className="flex items-center gap-2 font-display text-sm font-bold text-[#2C3E50]">
                    <TrendingUp className="h-4 w-4 text-[#7A0000]" />
                    Escalation Outcomes & Clinician Loop Closure
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Live summary of alerts and documented clinical actions.
                  </p>
                </div>

                <div className="grid gap-3 text-xs sm:grid-cols-3">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                    <span className="font-medium">Patients in Out-of-Control Bucket</span>
                    <span className="font-bold">{elevatedEventsCount}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 text-emerald-900">
                    <span className="font-medium">Resolved via Clinician Acknowledge</span>
                    <span className="font-bold">{acknowledgedCount}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-sky-50 p-3 text-sky-900">
                    <span className="font-medium">Care Plans Adjusted</span>
                    <span className="font-bold">{planAdjustedCount}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={newModalOpen} onOpenChange={setNewModalOpen}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-[#2C3E50]">
              Enroll Partner Hospital & Provision Admin
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Register a healthcare institution and create its Hospital Admin login credentials.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterHospital} className="my-4 space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Hospital Facility Name *</label>
              <Input
                required
                placeholder="e.g. Nairobi Heart & Vascular Institute"
                value={hName}
                onChange={(e) => setHName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">County *</label>
                <Input
                  required
                  value={hCounty}
                  onChange={(e) => setHCounty(e.target.value)}
                  placeholder="e.g. Nairobi"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Facility License Ref</label>
                <Input
                  placeholder="e.g. MED-KE-074"
                  value={hLicense}
                  onChange={(e) => setHLicense(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A0000]">
                Hospital Admin Login Credentials
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Hospital Admin Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Jane Doe"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="bg-white text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Admin Login Email *</label>
                  <Input
                    required
                    type="email"
                    placeholder="e.g. admin@hospital.co.ke"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="bg-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Admin Password *</label>
                  <Input
                    required
                    type="password"
                    placeholder="Set password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="bg-white text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#7A0000] text-white hover:bg-[#5E0000]"
              >
                Enroll Facility & Create Admin
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
