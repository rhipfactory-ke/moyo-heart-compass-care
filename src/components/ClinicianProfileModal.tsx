import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/site/SiteChrome";
import {
  addOrUpdateClinician,
  getHospitals,
  setSession,
  type ClinicianRecord,
} from "@/lib/store";

interface ClinicianProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingClinician?: ClinicianRecord | null;
  onSaved?: (clinician: ClinicianRecord) => void;
}

export function ClinicianProfileModal({
  open,
  onOpenChange,
  existingClinician,
  onSaved,
}: ClinicianProfileModalProps) {
  const [fullName, setFullName] = useState("");
  const [clinicalRole, setClinicalRole] = useState<ClinicianRecord["role"]>("CARDIOLOGIST");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [primaryHospital, setPrimaryHospital] = useState("");
  const [county, setCounty] = useState("");
  const [consultDays, setConsultDays] = useState<string[]>([]);
  const [consultFormat, setConsultFormat] = useState<string[]>([]);
  const [hoursFrom, setHoursFrom] = useState("09:00");
  const [hoursTo, setHoursTo] = useState("17:00");
  const [dutyPhone, setDutyPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hospitals, setHospitals] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      const hList = getHospitals().map((h) => h.name);
      setHospitals(hList);
      if (existingClinician) {
        setFullName(existingClinician.name);
        setClinicalRole(existingClinician.role);
        setRegistrationNumber(existingClinician.kmpdcReg);
        setPrimaryHospital(existingClinician.hospitalName);
        setCounty(existingClinician.county);
        setConsultDays(existingClinician.consultDays);
        setConsultFormat(existingClinician.consultFormat);
        setDutyPhone(existingClinician.phone);
        setEmail(existingClinician.email);
        setPassword(existingClinician.password || "");
      } else {
        setFullName("");
        setRegistrationNumber("");
        setPrimaryHospital(hList[0] || "");
        setCounty("");
        setConsultDays([]);
        setConsultFormat([]);
        setDutyPhone("");
        setEmail("");
        setPassword("");
      }
    }
  }, [open, existingClinician]);

  const toggleDay = (day: string) => {
    setConsultDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const toggleFormat = (format: string) => {
    setConsultFormat((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !registrationNumber.trim() || !primaryHospital.trim()) return;
    if (consultDays.length === 0 || consultFormat.length === 0) {
      toast.error("Please tick at least one consultation day and consultation format.");
      return;
    }

    const record = addOrUpdateClinician({
      id: existingClinician?.id,
      name: fullName.trim(),
      title:
        clinicalRole === "CARDIOLOGIST"
          ? "Consultant Cardiologist"
          : clinicalRole === "PHYSICIAN"
            ? "Internal Medicine Physician"
            : clinicalRole === "NURSE_COORDINATOR"
              ? "Nurse Care Coordinator"
              : "Cardiology Resident",
      role: clinicalRole,
      kmpdcReg: registrationNumber.trim(),
      hospitalName: primaryHospital.trim(),
      county: county.trim() || "Nairobi",
      email: email.trim(),
      phone: dutyPhone.trim(),
      password: password || existingClinician?.password,
      consultDays,
      consultFormat,
      consultationHours: `${hoursFrom}–${hoursTo}`,
    });

    setSession({
      role: "PHYSICIAN",
      userId: record.id,
      name: record.name,
      email: record.email,
      hospitalId: record.hospitalId,
      hospitalName: record.hospitalName,
    });

    toast.success(`Clinician profile saved for ${record.name}!`);
    if (onSaved) onSaved(record);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto rounded-3xl bg-white p-0 text-[#2C3E50] shadow-2xl">
        <div className="grid md:grid-cols-5">
          <div className="flex flex-col justify-between border-b border-slate-200 bg-[#F8F9FA] p-6 md:col-span-2 md:border-b-0 md:border-r">
            <div>
              <Logo />

              <div className="mt-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#7A0000]">
                  CLINICIAN PROFILE
                </div>
                <h2 className="font-display text-2xl font-black leading-tight text-[#2C3E50]">
                  Make room for connected care.
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Update your practice details, consultation days, and formats so patients can find you in the Specialist Directory.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-bold text-[#7A0000]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7A0000] text-[10px] text-white">
                    1
                  </span>
                  Professional details
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] text-slate-700">
                    2
                  </span>
                  Facility & availability
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] text-slate-700">
                    3
                  </span>
                  Clinical contact
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2C3E50]">
                <ShieldCheck className="h-4 w-4 text-[#1E7E34]" />
                Prescriptive review, verified identity
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                Credentials and KMPDC registration are linked to your hospital facility roster.
              </p>
            </div>
          </div>

          <div className="p-6 md:col-span-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display text-xl font-bold text-[#2C3E50]">
                  Manage your clinician profile
                </h3>
                <p className="text-xs text-slate-400">
                  All fields are required unless marked optional.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Professional details
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="clinician-name" className="text-xs font-bold text-slate-700">
                    Full name *
                  </Label>
                  <Input
                    id="clinician-name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10 rounded-xl border-slate-200 text-xs"
                    placeholder="e.g. Dr. Jane Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="clinician-role" className="text-xs font-bold text-slate-700">
                      Clinical role *
                    </Label>
                    <select
                      id="clinician-role"
                      value={clinicalRole}
                      onChange={(e) => setClinicalRole(e.target.value as ClinicianRecord["role"])}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 shadow-xs focus:border-[#7A0000] focus:outline-none"
                    >
                      <option value="CARDIOLOGIST">Cardiologist</option>
                      <option value="PHYSICIAN">Internal Medicine Physician</option>
                      <option value="NURSE_COORDINATOR">Nurse / Care Coordinator</option>
                      <option value="RESIDENT">Resident Fellow</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="reg-num" className="text-xs font-bold text-slate-700">
                      KMPDC / Board License *
                    </Label>
                    <Input
                      id="reg-num"
                      required
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="h-10 rounded-xl border-slate-200 text-xs"
                      placeholder="e.g. KMPDC-A8492"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Facility & clinic availability
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="primary-hosp" className="text-xs font-bold text-slate-700">
                      Hospital / Facility Affiliation *
                    </Label>
                    {hospitals.length > 0 ? (
                      <select
                        id="primary-hosp"
                        required
                        value={primaryHospital}
                        onChange={(e) => setPrimaryHospital(e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 shadow-xs focus:border-[#7A0000] focus:outline-none"
                      >
                        {hospitals.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id="primary-hosp"
                        required
                        value={primaryHospital}
                        onChange={(e) => setPrimaryHospital(e.target.value)}
                        className="h-10 rounded-xl border-slate-200 text-xs"
                        placeholder="e.g. Nairobi Heart Institute"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="clinician-county" className="text-xs font-bold text-slate-700">
                      County *
                    </Label>
                    <Input
                      id="clinician-county"
                      required
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      className="h-10 rounded-xl border-slate-200 text-xs"
                      placeholder="e.g. Nairobi"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Clinic Consultation Days *{" "}
                    <span className="font-normal text-slate-400">(Tick all that apply)</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                      const isSelected = consultDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                            isSelected
                              ? "border-[#7A0000] bg-[#FDF2F2] text-[#7A0000] shadow-xs"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded border ${
                              isSelected
                                ? "border-[#7A0000] bg-[#7A0000] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </span>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">
                      Consultation Format *{" "}
                      <span className="font-normal text-slate-400">(Tick)</span>
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {["In-person", "Virtual"].map((fmt) => {
                        const isSelected = consultFormat.includes(fmt);
                        return (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => toggleFormat(fmt)}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                              isSelected
                                ? "border-[#7A0000] bg-[#FDF2F2] text-[#7A0000] shadow-xs"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            <span
                              className={`flex h-4 w-4 items-center justify-center rounded border ${
                                isSelected
                                  ? "border-[#7A0000] bg-[#7A0000] text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </span>
                            {fmt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Hours</Label>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="time"
                        value={hoursFrom}
                        onChange={(e) => setHoursFrom(e.target.value)}
                        className="h-9 rounded-lg border-slate-200 text-xs"
                      />
                      <span className="text-xs text-slate-400">to</span>
                      <Input
                        type="time"
                        value={hoursTo}
                        onChange={(e) => setHoursTo(e.target.value)}
                        className="h-9 rounded-lg border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Clinical contact
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="duty-phone" className="text-xs font-bold text-slate-700">
                      Duty phone *
                    </Label>
                    <Input
                      id="duty-phone"
                      required
                      value={dutyPhone}
                      onChange={(e) => setDutyPhone(e.target.value)}
                      className="h-10 rounded-xl border-slate-200 text-xs"
                      placeholder="e.g. +254 711 234 567"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="duty-email" className="text-xs font-bold text-slate-700">
                      Work email *
                    </Label>
                    <Input
                      id="duty-email"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 rounded-xl border-slate-200 text-xs"
                      placeholder="e.g. dr.janedoe@hospital.co.ke"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-2xl bg-[#7A0000] text-sm font-bold text-white shadow-md hover:bg-[#5E0000]"
              >
                Save Clinician Profile
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
