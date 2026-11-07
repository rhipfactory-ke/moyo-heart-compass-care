import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Stethoscope,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import {
  getClinicians,
  getHospitals,
  createEnrollmentRequest,
  getEnrollmentRequests,
  type ClinicianRecord,
  type PatientRecord,
} from "@/lib/store";

interface SpecialistDirectoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: PatientRecord | null;
  onRequestEnrollment?: (specialist: ClinicianRecord) => void;
}

export function SpecialistDirectoryModal({
  open,
  onOpenChange,
  patient,
  onRequestEnrollment,
}: SpecialistDirectoryModalProps) {
  const [clinicians, setClinicians] = useState<ClinicianRecord[]>([]);
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [selectedHospital, setSelectedHospital] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [requestedIds, setRequestedIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      const cList = getClinicians().filter((c) => c.status === "ACTIVE" && c.canOnboardPatients);
      setClinicians(cList);
      setHospitals(getHospitals().map((h) => h.name));
      if (patient) {
        const reqs = getEnrollmentRequests().filter(
          (r) => r.patientId === patient.id && r.status !== "DECLINED",
        );
        setRequestedIds(reqs.map((r) => r.doctorId));
      }
    };
    if (open) sync();
    window.addEventListener("moyodoc:store_updated", sync);
    return () => window.removeEventListener("moyodoc:store_updated", sync);
  }, [open, patient]);

  const filtered = clinicians.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subspecialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesHospital =
      selectedHospital === "ALL" ||
      s.hospitalName.toLowerCase() === selectedHospital.toLowerCase();

    return matchesSearch && matchesHospital;
  });

  const handleRequest = (s: ClinicianRecord) => {
    if (!patient) {
      toast.error("Please register or select a patient profile first.");
      return;
    }
    createEnrollmentRequest({ patient, specialist: s });
    setRequestedIds((prev) => [...prev, s.id]);
    if (onRequestEnrollment) {
      onRequestEnrollment(s);
    }
    toast.success(`Enrollment request sent to ${s.name} at ${s.hospitalName}!`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 pb-2 text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 font-display text-xl font-bold text-[#2C3E50]">
              <Stethoscope className="h-5 w-5 text-[#7A0000]" />
              Find Your Cardiologist & Practice
            </DialogTitle>
            <Badge className="bg-[#FDF2F2] text-[10px] font-bold text-[#7A0000]">
              DOOR 1: SPECIALIST DIRECTORY
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Connect your daily blood pressure telemetry directly to verified specialists on MoyoDoc.
          </DialogDescription>
        </DialogHeader>

        {clinicians.length > 0 && (
          <div className="my-3 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search cardiologist, hospital, or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-9 text-xs"
                />
              </div>
              <select
                value={selectedHospital}
                onChange={(e) => setSelectedHospital(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-[#2C3E50]"
              >
                <option value="ALL">All Hospitals</option>
                {hospitals.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {clinicians.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
              <Stethoscope className="mx-auto h-8 w-8 text-slate-400" />
              <h4 className="mt-2 font-display text-sm font-bold text-[#2C3E50]">
                No specialists registered yet
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Onboard a clinician via the Provider Application form or Hospital Admin portal so patients can request enrollment.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button
                  asChild
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="bg-[#7A0000] text-xs font-semibold text-white hover:bg-[#5E0000]"
                >
                  <Link to="/providers/apply">
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    Register a Specialist
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="text-xs"
                >
                  <Link to="/hospital">Open Hospital Admin</Link>
                </Button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No specialists match your search criteria.
            </div>
          ) : (
            filtered.map((s) => {
              const isConnected = patient?.specialistId === s.id;
              const isRequested = requestedIds.includes(s.id) || isConnected;
              return (
                <Card
                  key={s.id}
                  className={`overflow-hidden border transition-all ${
                    isRequested
                      ? "border-[#7A0000]/40 bg-[#FDF2F2]/30"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <CardContent className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-[#7A0000]">
                        {s.name.replace(/^Dr\.?\s*/i, "").slice(0, 2).toUpperCase() || "MD"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-display text-sm font-bold text-[#2C3E50]">
                            {s.name}
                          </div>
                          <Badge className="bg-emerald-100 text-[10px] font-semibold text-emerald-800">
                            {s.kmpdcReg}
                          </Badge>
                        </div>
                        <div className="text-xs font-medium text-[#7A0000]">{s.title}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            {s.hospitalName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {s.county}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {s.consultDays.join("/")} · {s.consultationHours}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0">
                      {isConnected ? (
                        <Badge className="gap-1 border border-emerald-500 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Enrolled
                        </Badge>
                      ) : isRequested ? (
                        <Badge className="gap-1 border border-[#7A0000] bg-white px-3 py-1.5 text-xs font-bold text-[#7A0000]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#7A0000]" />
                          Request Pending
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleRequest(s)}
                          className="h-9 bg-[#7A0000] px-4 text-xs font-semibold text-white hover:bg-[#5E0000]"
                        >
                          Request Enrollment
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SpecialistDirectoryModal;
