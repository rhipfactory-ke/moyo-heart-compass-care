import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  HelpCircle,
  ArrowLeft,
  Building2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/site/SiteChrome";
import { RISK_LABEL } from "@/lib/bp";
import {
  addOrUpdatePatient,
  getClinicians,
  createEnrollmentRequest,
  setSession,
  type PatientRecord,
  type ClinicianRecord,
} from "@/lib/store";

interface RiskIntakeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingPatient?: PatientRecord | null;
  onComplete?: (patient: PatientRecord) => void;
}

export function RiskIntakeModal({
  open,
  onOpenChange,
  existingPatient,
  onComplete,
}: RiskIntakeModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("");
  const [age, setAge] = useState("");
  const [diagnoses, setDiagnoses] = useState<string[]>([]);
  const [smokingStatus, setSmokingStatus] = useState("Never smoked");
  const [symptoms, setSymptoms] = useState("");
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverPhone, setCaregiverPhone] = useState("");
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [baselineSys, setBaselineSys] = useState("");
  const [baselineDia, setBaselineDia] = useState("");

  const [savedPatient, setSavedPatient] = useState<PatientRecord | null>(null);
  const [clinicians, setClinicians] = useState<ClinicianRecord[]>([]);
  const [requestedDoctorId, setRequestedDoctorId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setClinicians(getClinicians().filter((c) => c.status === "ACTIVE" && c.canOnboardPatients));
      if (existingPatient) {
        setFullName(existingPatient.name);
        setPhone(existingPatient.phone);
        setCounty(existingPatient.county);
        setAge(String(existingPatient.age));
        setDiagnoses(existingPatient.conditions);
        setSmokingStatus(existingPatient.smokingStatus || "Never smoked");
        setSymptoms(existingPatient.symptomsNarrative || "");
        setCaregiverName(existingPatient.caregiverName || "");
        setCaregiverPhone(existingPatient.caregiverPhone || "");
        setWhatsappAlerts(existingPatient.whatsappAlerts ?? true);
      } else {
        setFullName("");
        setPhone("");
        setCounty("");
        setAge("");
        setDiagnoses([]);
        setSymptoms("");
        setCaregiverName("");
        setCaregiverPhone("");
        setBaselineSys("");
        setBaselineDia("");
      }
    }
  }, [open, existingPatient]);

  const toggleDiagnosis = (tag: string) => {
    setDiagnoses((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    const sys = parseInt(baselineSys, 10);
    const dia = parseInt(baselineDia, 10);

    const record = addOrUpdatePatient({
      id: existingPatient?.id,
      name: fullName.trim(),
      age: parseInt(age, 10) || 45,
      phone: phone.trim(),
      county: county.trim() || "Nairobi",
      conditions: diagnoses,
      smokingStatus,
      symptomsNarrative: symptoms.trim(),
      caregiverName: caregiverName.trim() || undefined,
      caregiverPhone: caregiverPhone.trim() || undefined,
      whatsappAlerts,
      baselineReading:
        !isNaN(sys) && !isNaN(dia) && sys > 0 && dia > 0
          ? { systolic: sys, diastolic: dia }
          : null,
    });

    setSession({
      role: "PATIENT",
      userId: record.id,
      name: record.name,
      email: record.email,
    });

    setSavedPatient(record);
    setStep(2);
    toast.success("Cardiovascular risk intake saved!");
  };

  const handleEnrollmentRequest = (doc: ClinicianRecord) => {
    if (!savedPatient) return;
    setRequestedDoctorId(doc.id);
    createEnrollmentRequest({ patient: savedPatient, specialist: doc });
    toast.success(`Enrollment request sent to ${doc.name} at ${doc.hospitalName}!`);
    setTimeout(() => {
      onOpenChange(false);
      if (onComplete) onComplete(savedPatient);
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto rounded-3xl bg-[#F8F9FA] p-0 text-[#2C3E50] shadow-2xl sm:max-w-lg">
        {step === 1 ? (
          <div className="p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <Logo />
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className="border-slate-300 text-[10px] font-semibold text-slate-600"
                >
                  Step 1 of 2
                </Badge>
                <button
                  type="button"
                  onClick={() =>
                    toast.info(
                      "Fill in your health details to calculate your cardiovascular risk and connect with a specialist.",
                    )
                  }
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[#7A0000]"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Help</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleIntakeSubmit} className="mt-4 space-y-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A0000]">
                  DOOR 1 RISK INTAKE
                </div>
                <h2 className="font-display text-2xl font-extrabold text-[#2C3E50]">
                  Let's talk about your heart health.
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Complete your profile and risk check to connect with a cardiovascular specialist.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Full Name *</Label>
                  <Input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="h-9 rounded-xl bg-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Phone Number *</Label>
                  <Input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +254 712 345 678"
                    className="h-9 rounded-xl bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Age (years) *</Label>
                  <Input
                    required
                    type="number"
                    min={18}
                    max={110}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 52"
                    className="h-9 rounded-xl bg-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">County *</Label>
                  <Input
                    required
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    placeholder="e.g. Nairobi"
                    className="h-9 rounded-xl bg-white text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Known diagnoses</Label>
                <div className="flex flex-wrap gap-2">
                  {["Hypertension", "Type 2 Diabetes", "High Cholesterol", "Heart Failure", "CKD"].map(
                    (tag) => {
                      const isSelected = diagnoses.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleDiagnosis(tag)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            isSelected
                              ? "bg-[#7A0000] text-white shadow-xs"
                              : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="smoking-status" className="text-xs font-bold text-slate-700">
                  Smoking status
                </Label>
                <select
                  id="smoking-status"
                  value={smokingStatus}
                  onChange={(e) => setSmokingStatus(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 shadow-xs focus:border-[#7A0000] focus:outline-none"
                >
                  <option value="Never smoked">Never smoked</option>
                  <option value="Former smoker">Former smoker</option>
                  <option value="Current smoker">Current smoker</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="symptoms-input" className="text-xs font-bold text-slate-700">
                    Current symptoms (optional)
                  </Label>
                  <span className="text-[10px] text-slate-400">{symptoms.length} / 500</span>
                </div>
                <Textarea
                  id="symptoms-input"
                  rows={2}
                  maxLength={500}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="rounded-xl border-slate-200 bg-white text-xs text-slate-800 focus:border-[#7A0000]"
                  placeholder="Describe any symptoms or enter 'No symptoms'..."
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                <div className="text-xs font-bold text-slate-800">
                  Caregiver / Next of Kin (optional)
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] font-semibold text-slate-500">
                      Caregiver Name
                    </Label>
                    <Input
                      value={caregiverName}
                      onChange={(e) => setCaregiverName(e.target.value)}
                      className="mt-1 h-8 rounded-lg border-slate-200 text-xs"
                      placeholder="e.g. John Doe (Spouse)"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-semibold text-slate-500">
                      Phone number
                    </Label>
                    <Input
                      value={caregiverPhone}
                      onChange={(e) => setCaregiverPhone(e.target.value)}
                      className="mt-1 h-8 rounded-lg border-slate-200 text-xs"
                      placeholder="e.g. +254 722 987 654"
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <div className="pr-2">
                    <div className="text-[11px] font-semibold text-slate-700">
                      Send automated WhatsApp alerts to Caregiver
                    </div>
                  </div>
                  <Switch
                    checked={whatsappAlerts}
                    onCheckedChange={setWhatsappAlerts}
                    className="data-[state=checked]:bg-[#7A0000]"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
                <div className="text-[11px] font-bold text-slate-700">
                  Baseline Blood Pressure Reading (optional)
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] font-semibold text-slate-500">
                      Systolic (mmHg)
                    </Label>
                    <Input
                      type="number"
                      min={50}
                      max={300}
                      value={baselineSys}
                      onChange={(e) => setBaselineSys(e.target.value)}
                      placeholder="e.g. 142"
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-semibold text-slate-500">
                      Diastolic (mmHg)
                    </Label>
                    <Input
                      type="number"
                      min={30}
                      max={200}
                      value={baselineDia}
                      onChange={(e) => setBaselineDia(e.target.value)}
                      placeholder="e.g. 90"
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-2xl bg-[#7A0000] text-sm font-bold text-white shadow-md hover:bg-[#5E0000]"
              >
                Save Intake & View Risk Summary <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </form>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <Logo />
              <Badge
                variant="outline"
                className="border-slate-300 text-[10px] font-semibold text-slate-600"
              >
                Step 2 of 2
              </Badge>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A0000]">
                  YOUR RISK PROFILE & SPECIALIST OPTIONS
                </div>
                <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-900">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    {savedPatient ? RISK_LABEL[savedPatient.riskCategory] : "Risk Summary"}: Specialist review recommended
                  </div>
                  <p className="mt-1 text-xs text-amber-800">
                    Connecting with an enlisted cardiovascular specialist helps calibrate your care plan and monitor your home readings between visits.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-[#2C3E50]">
                  Connect with an enlisted specialist
                </h3>
                <p className="text-xs text-slate-500">
                  Select a registered specialist below to send your intake into their Door 2 inbox:
                </p>
              </div>

              {clinicians.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
                  <p className="text-xs font-semibold text-slate-700">
                    No specialists have been onboarded yet.
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    You can onboard a specialist via the Provider Application page and connect anytime from your Care Team tab.
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        onOpenChange(false);
                        if (savedPatient && onComplete) onComplete(savedPatient);
                      }}
                      className="bg-[#7A0000] text-xs text-white hover:bg-[#5E0000]"
                    >
                      Continue to Patient Dashboard
                    </Button>
                    <Button asChild variant="outline" size="sm" className="text-xs">
                      <Link to="/providers/apply" onClick={() => onOpenChange(false)}>
                        <UserPlus className="mr-1 h-3.5 w-3.5" />
                        Onboard Specialist
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {clinicians.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-display font-bold text-slate-900">{doc.name}</div>
                          <div className="text-xs font-semibold text-[#7A0000]">{doc.title}</div>
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                            <Building2 className="h-3 w-3" />
                            {doc.hospitalName} ({doc.county})
                          </div>
                        </div>
                        <Badge className="bg-emerald-50 text-[10px] font-semibold text-emerald-800">
                          Accepting
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="text-[11px] text-slate-500">
                          Slots:{" "}
                          <span className="font-medium text-slate-700">
                            {doc.consultDays.join("/")} · {doc.consultationHours}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleEnrollmentRequest(doc)}
                          className="h-8 rounded-xl bg-[#7A0000] text-xs font-bold text-white hover:bg-[#5E0000]"
                        >
                          {requestedDoctorId === doc.id ? "Requested ✓" : "Request Enrollment"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A0000] hover:underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Edit intake answers
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    if (savedPatient && onComplete) onComplete(savedPatient);
                  }}
                  className="text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
