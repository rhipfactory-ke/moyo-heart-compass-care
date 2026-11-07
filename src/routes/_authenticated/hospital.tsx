import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, CheckCircle2, LogOut, Plus } from "lucide-react";
import { Logo } from "@/components/site/SiteChrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useMe, useSignOut } from "@/hooks/use-me";
import {
  getClinicians,
  saveClinicians,
  addOrUpdateClinician,
  getPatients,
  type ClinicianRecord,
  type PatientRecord,
} from "@/lib/store";

export const Route = createFileRoute("/_authenticated/hospital")({
  head: () => ({
    meta: [
      { title: "MoyoDoc — Hospital / Clinic Admin Portal" },
      { name: "description", content: "Level 3 Enterprise B2B Hospital Administration" },
    ],
  }),
  component: HospitalAdminPage,
});

function HospitalAdminPage() {
  const me = useMe();
  const signOut = useSignOut();

  const assignedHospital = me.data?.hospitalName || "";
  const [staffList, setStaffList] = useState<ClinicianRecord[]>([]);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<ClinicianRecord["role"]>("CARDIOLOGIST");
  const [newReg, setNewReg] = useState("");
  const [newDept, setNewDept] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [consultDays, setConsultDays] = useState<string[]>([]);
  const [consultFormat, setConsultFormat] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setStaffList(getClinicians());
      setPatients(getPatients());
    };
    sync();
    window.addEventListener("moyodoc:store_updated", sync);
    return () => window.removeEventListener("moyodoc:store_updated", sync);
  }, []);

  const toggleDay = (day: string) => {
    setConsultDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const toggleFormat = (fmt: string) => {
    setConsultFormat((prev) =>
      prev.includes(fmt) ? prev.filter((f) => f !== fmt) : [...prev, fmt],
    );
  };

  const handleToggleOnboardingRights = (id: string) => {
    const updated = staffList.map((s) => {
      if (s.id === id) {
        const next = !s.canOnboardPatients;
        toast.info(
          `${s.name}: Patient onboarding rights ${next ? "GRANTED" : "WITHDRAWN"}.`,
        );
        return { ...s, canOnboardPatients: next };
      }
      return s;
    });
    saveClinicians(updated);
  };

  const handleToggleStatus = (id: string) => {
    const updated = staffList.map((s) => {
      if (s.id === id) {
        const next: ClinicianRecord["status"] =
          s.status === "ACTIVE" ? "RESTRICTED" : "ACTIVE";
        toast.success(`${s.name}: Status updated to ${next}.`);
        return { ...s, status: next };
      }
      return s;
    });
    saveClinicians(updated);
  };

  const handleApproveClinician = (id: string, name: string) => {
    const updated = staffList.map((s) =>
      s.id === id ? { ...s, status: "ACTIVE" as const, canOnboardPatients: true } : s,
    );
    saveClinicians(updated);
    toast.success(`${name} verified & approved for active clinical panel access!`);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newReg.trim() || !newEmail.trim() || !newPassword) return;
    if (consultDays.length === 0 || consultFormat.length === 0) {
      toast.error("Please tick at least one consultation day and consultation format.");
      return;
    }

    addOrUpdateClinician({
      name: newName.trim(),
      role: newRole,
      title:
        newRole === "CARDIOLOGIST"
          ? "Consultant Cardiologist"
          : newRole === "PHYSICIAN"
            ? "Internal Medicine Physician"
            : newRole === "NURSE_COORDINATOR"
              ? "Nurse Coordinator"
              : "Cardiology Resident",
      kmpdcReg: newReg.trim(),
      hospitalName: assignedHospital || "Enrolled Hospital",
      department: newDept.trim() || "Cardiology Outpatient",
      email: newEmail.trim(),
      phone: newPhone.trim(),
      password: newPassword,
      consultDays,
      consultFormat,
      status: "ACTIVE",
    });

    toast.success(
      `${newName.trim()} onboarded to ${assignedHospital} with active login credentials.`,
    );
    setAddModalOpen(false);
    setNewName("");
    setNewReg("");
    setNewDept("");
    setNewEmail("");
    setNewPhone("");
    setNewPassword("");
    setConsultDays([]);
    setConsultFormat([]);
  };

  const hospitalStaff = assignedHospital
    ? staffList.filter(
        (s) => s.hospitalName.toLowerCase() === assignedHospital.toLowerCase(),
      )
    : staffList;

  const hospitalPatients = assignedHospital
    ? patients.filter(
        (p) => p.hospitalName?.toLowerCase() === assignedHospital.toLowerCase(),
      )
    : patients;

  const activeProviders = hospitalStaff.filter((s) => s.status === "ACTIVE").length;
  const pendingProviders = hospitalStaff.filter((s) => s.status === "PENDING");
  const outOfControlCount = hospitalPatients.filter(
    (p) => p.bucket === "OUT_OF_CONTROL" && p.status === "OPEN",
  ).length;
  const outOfControlRate =
    hospitalPatients.length > 0
      ? `${((outOfControlCount / hospitalPatients.length) * 100).toFixed(1)}%`
      : "0%";
  const acknowledgedCount = hospitalPatients.filter(
    (p) => p.status === "ACKNOWLEDGED",
  ).length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-16 text-[#2C3E50]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge className="bg-[#7A0000] text-[10px] font-bold text-white">
              HOSPITAL ADMIN PORTAL
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {assignedHospital && (
              <Badge variant="outline" className="border-slate-300 text-xs font-semibold text-slate-700">
                {assignedHospital}
              </Badge>
            )}
            {me.data?.name && (
              <span className="hidden text-xs font-semibold text-slate-600 sm:inline">
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#7A0000]">
              ENTERPRISE CLINICAL FACILITY GOVERNANCE
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#2C3E50] sm:text-3xl">
              {assignedHospital || "Hospital Administration"}
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Verify specialist KMPDC credentials, manage patient onboarding privileges, and monitor facility cohort volumes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setAddModalOpen(true)}
              className="gap-1.5 bg-[#7A0000] text-xs font-semibold text-white hover:bg-[#5E0000]"
            >
              <Plus className="h-4 w-4" />
              Onboard Clinician to Facility
            </Button>
          </div>
        </div>

        {/* Pending Specialist Applications Banner */}
        {pendingProviders.length > 0 && (
          <Card className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Pending Specialist Verification ({pendingProviders.length})
                </div>
                <p className="text-xs text-amber-800">
                  The following specialists applied via the Provider Network and selected{" "}
                  <span className="font-semibold">{assignedHospital}</span>. Verify their KMPDC
                  registration to activate their login:
                </p>
              </div>
            </div>
            <div className="mt-3 divide-y divide-amber-200/70 rounded-xl bg-white p-2">
              {pendingProviders.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-2.5 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{doc.name}</span> ·{" "}
                    <span className="font-mono text-slate-600">{doc.kmpdcReg}</span> ·{" "}
                    <span className="text-slate-500">{doc.email}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleApproveClinician(doc.id, doc.name)}
                    className="h-7 bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800"
                  >
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Verify KMPDC & Activate
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 4 Hospital KPI Metric Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <Card className="rounded-xl border border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4">
              <div className="text-xs font-medium text-muted-foreground">
                Total Enrolled Patients
              </div>
              <div className="mt-1 font-display text-3xl font-extrabold text-[#2C3E50]">
                {hospitalPatients.length}
              </div>
              <div className="text-[11px] font-medium text-emerald-700">
                Under facility care team
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-slate-200 bg-white shadow-xs">
            <CardContent className="p-4">
              <div className="text-xs font-medium text-muted-foreground">Active Physicians</div>
              <div className="mt-1 font-display text-3xl font-extrabold text-[#7A0000]">
                {activeProviders}
              </div>
              <div className="text-[11px] text-muted-foreground">With clinical panel rights</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-rose-200 bg-rose-50/50 shadow-xs">
            <CardContent className="p-4">
              <div className="text-xs font-medium text-[#B71C1C]">
                Facility Out-of-Control Rate
              </div>
              <div className="mt-1 font-display text-3xl font-extrabold text-[#B71C1C]">
                {outOfControlRate}
              </div>
              <div className="text-[11px] font-medium text-[#B71C1C]">
                {outOfControlCount} active high-BP alerts
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-xs">
            <CardContent className="p-4">
              <div className="text-xs font-medium text-emerald-800">Alerts Acknowledged</div>
              <div className="mt-1 font-display text-3xl font-extrabold text-emerald-800">
                {acknowledgedCount}
              </div>
              <div className="text-[11px] font-medium text-emerald-700">
                Closed clinical loops
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clinical Staff Directory & Privileges Table */}
        <Card className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 pb-3">
            <div>
              <CardTitle className="font-display text-base font-bold text-[#2C3E50]">
                Clinician Directory & Onboarding Rights
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Control which doctors and nurses can log in and onboard patients into{" "}
                {assignedHospital || "your facility"}.
              </p>
            </div>
            <div className="w-64">
              <Input
                placeholder="e.g. Dr. Jane Doe or KMPDC-A8492..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-[#F8F9FA] text-[11px] font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Clinician & Department</th>
                  <th className="px-4 py-3">KMPDC / Email</th>
                  <th className="px-4 py-3">Consult Schedule</th>
                  <th className="px-4 py-3">Enrolled Patients</th>
                  <th className="px-4 py-3">Can Onboard Patients</th>
                  <th className="px-4 py-3">Privilege Status</th>
                  <th className="px-4 py-3 text-right">Hospital Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {hospitalStaff.filter(
                  (s) =>
                    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.kmpdcReg.toLowerCase().includes(searchQuery.toLowerCase()),
                ).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <p className="font-semibold text-slate-700">
                        No clinicians onboarded for {assignedHospital || "this facility"} yet.
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Click "Onboard Clinician to Facility" above or approve pending applications from /providers/apply.
                      </p>
                    </td>
                  </tr>
                ) : (
                  hospitalStaff
                    .filter(
                      (s) =>
                        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.kmpdcReg.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                    .map((staff) => {
                      const docPatients = patients.filter(
                        (p) => p.specialistId === staff.id,
                      ).length;
                      return (
                        <tr key={staff.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-[#2C3E50]">{staff.name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {staff.role} · {staff.department}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-mono text-[11px] font-semibold text-slate-700">
                              {staff.kmpdcReg}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {staff.email || "—"}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-[11px] text-slate-600">
                            <div>{staff.consultDays.join(", ")}</div>
                            <div className="text-muted-foreground">
                              {staff.consultFormat.join(" & ")}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-800">
                            {docPatients} patients
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={staff.canOnboardPatients}
                                onCheckedChange={() => handleToggleOnboardingRights(staff.id)}
                                className="data-[state=checked]:bg-[#7A0000]"
                              />
                              <span className="text-[11px] font-medium text-slate-600">
                                {staff.canOnboardPatients ? "Allowed" : "Restricted"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            {staff.status === "ACTIVE" ? (
                              <Badge className="bg-emerald-100 text-[10px] font-semibold text-emerald-800">
                                ✓ ACTIVE
                              </Badge>
                            ) : staff.status === "PENDING" ? (
                              <Badge className="bg-amber-100 text-[10px] font-semibold text-amber-800">
                                PENDING VERIFICATION
                              </Badge>
                            ) : (
                              <Badge className="bg-rose-100 text-[10px] font-semibold text-rose-800">
                                RESTRICTED
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {staff.status === "PENDING" ? (
                              <Button
                                size="sm"
                                onClick={() => handleApproveClinician(staff.id, staff.name)}
                                className="h-7 bg-emerald-700 text-xs font-semibold text-white hover:bg-emerald-800"
                              >
                                Approve & Activate
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(staff.id)}
                                className={`h-7 text-xs ${
                                  staff.status === "ACTIVE"
                                    ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                                    : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                }`}
                              >
                                {staff.status === "ACTIVE" ? "Withdraw Rights" : "Re-activate"}
                              </Button>
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

      {/* Add Clinician Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-[#2C3E50]">
              Onboard Clinician to {assignedHospital || "Facility"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Verify credentials, select consultation days/formats, and set the clinician's login password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddStaff} className="my-3 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Clinician Full Name *</label>
              <Input
                required
                placeholder="e.g. Dr. Jane Doe"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Clinical Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as ClinicianRecord["role"])}
                  className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs"
                >
                  <option value="CARDIOLOGIST">Cardiologist</option>
                  <option value="PHYSICIAN">Internal Medicine Physician</option>
                  <option value="NURSE_COORDINATOR">Nurse Coordinator</option>
                  <option value="RESIDENT">Resident Fellow</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">KMPDC Registration # *</label>
                <Input
                  required
                  placeholder="e.g. KMPDC-A8492"
                  value={newReg}
                  onChange={(e) => setNewReg(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Department</label>
                <Input
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="e.g. Cardiology Outpatient"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Phone *</label>
                <Input
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +254 711 234 567"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Clinic Consultation Days *{" "}
                <span className="font-normal text-muted-foreground">(Tick all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                  const selected = consultDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                        selected
                          ? "border-[#7A0000] bg-[#FDF2F2] text-[#7A0000] shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          selected
                            ? "border-[#7A0000] bg-[#7A0000] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 stroke-[3]" />}
                      </span>
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">
                Consultation Format *{" "}
                <span className="font-normal text-muted-foreground">(Tick all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {["In-person", "Virtual"].map((fmt) => {
                  const selected = consultFormat.includes(fmt);
                  return (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => toggleFormat(fmt)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        selected
                          ? "border-[#7A0000] bg-[#FDF2F2] text-[#7A0000] shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded border ${
                          selected
                            ? "border-[#7A0000] bg-[#7A0000] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3 stroke-[3]" />}
                      </span>
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Clinician Login Email *</label>
                <Input
                  required
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. dr.janedoe@hospital.co.ke"
                  className="bg-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Clinician Login Password *</label>
                <Input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Set login password"
                  className="bg-white text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#7A0000] text-white hover:bg-[#5E0000]"
              >
                Onboard & Activate Clinician
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
