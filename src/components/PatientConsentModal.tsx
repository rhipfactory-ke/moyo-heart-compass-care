import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { updatePatientConsent, type PatientRecord } from "@/lib/store";

interface PatientConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: PatientRecord | null;
}

export function PatientConsentModal({
  open,
  onOpenChange,
  patient,
}: PatientConsentModalProps) {
  const [doctorAccess, setDoctorAccess] = useState(true);
  const [hospitalAccess, setHospitalAccess] = useState(true);
  const [caregiverAccess, setCaregiverAccess] = useState(true);

  useEffect(() => {
    if (open && patient?.consent) {
      setDoctorAccess(patient.consent.doctorAccessGranted);
      setHospitalAccess(patient.consent.hospitalAccessGranted);
      setCaregiverAccess(patient.consent.caregiverAccessGranted);
    }
  }, [open, patient]);

  const handleToggleDoctorAccess = (allowed: boolean) => {
    setDoctorAccess(allowed);
    if (patient) {
      updatePatientConsent(patient.id, { doctorAccessGranted: allowed });
    }
    if (allowed) {
      toast.success("Doctor Access Granted: Your specialist can view your BP logs.");
    } else {
      toast.warning("Doctor Access Revoked: Your chart is now masked on the clinician panel.");
    }
  };

  const handleToggleHospitalAccess = (allowed: boolean) => {
    setHospitalAccess(allowed);
    if (patient) {
      updatePatientConsent(patient.id, { hospitalAccessGranted: allowed });
    }
    toast.info(
      allowed
        ? "Hospital institutional access enabled."
        : "Hospital institutional access revoked.",
    );
  };

  const handleToggleCaregiverAccess = (allowed: boolean) => {
    setCaregiverAccess(allowed);
    if (patient) {
      updatePatientConsent(patient.id, { caregiverAccessGranted: allowed });
    }
    toast.info(
      allowed ? "Caregiver notifications enabled." : "Caregiver notifications paused.",
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 pb-2 text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 font-display text-lg font-bold text-[#2C3E50]">
              <Lock className="h-5 w-5 text-[#7A0000]" />
              Sovereign Consent & Access Gate
            </DialogTitle>
            <Badge className="bg-[#FDF2F2] text-[10px] font-bold text-[#7A0000]">
              PATIENT SOVEREIGNTY
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            You own your health record. You have full legal authority to grant or revoke access to any doctor or hospital at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-4 text-xs">
          {!doctorAccess && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3 text-rose-900">
              <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#B71C1C]" />
              <div>
                <span className="font-bold">Clinical Access Suspended:</span> Your managing physician cannot review your home blood pressure logs until you re-enable permission.
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-[#7A0000]">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-[#2C3E50]">
                  {patient?.specialistName || "Assigned Specialist"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {patient?.hospitalName || "Enrolled Cardiovascular Specialist"}
                </div>
                <div className="text-[10px] text-slate-400">
                  Can view BP trends & close care loops
                </div>
              </div>
            </div>
            <Switch
              checked={doctorAccess}
              onCheckedChange={handleToggleDoctorAccess}
              className="data-[state=checked]:bg-[#1E7E34]"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-[#2C3E50]">
                  {patient?.hospitalName || "Partner Hospital Facility"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Cardiology Continuity Outpatient Clinic
                </div>
                <div className="text-[10px] text-slate-400">
                  Emergency escalation & EMR chart sync
                </div>
              </div>
            </div>
            <Switch
              checked={hospitalAccess}
              onCheckedChange={handleToggleHospitalAccess}
              className="data-[state=checked]:bg-[#1E7E34]"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-[#2C3E50]">
                  {patient?.caregiverName || "Designated Caregiver"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {patient?.caregiverPhone || "No caregiver phone set"}
                </div>
                <div className="text-[10px] text-slate-400">
                  Receives adherence & check-in summaries
                </div>
              </div>
            </div>
            <Switch
              checked={caregiverAccess}
              onCheckedChange={handleToggleCaregiverAccess}
              className="data-[state=checked]:bg-[#1E7E34]"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500">
            <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-600" />
            <span>
              Guaranteed by Kenya Data Protection Act (2019) Sec. 26 Sovereign Patient Rights.
            </span>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-2">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#7A0000] text-xs font-semibold text-white hover:bg-[#5E0000]"
          >
            Save Consent Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PatientConsentModal;
