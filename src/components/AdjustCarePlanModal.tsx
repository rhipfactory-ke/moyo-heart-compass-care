import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Pill, Send } from "lucide-react";
import { toast } from "sonner";
import type { PatientRecord } from "@/hooks/use-patients";

interface AdjustCarePlanModalProps {
  patient: PatientRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanAdjusted: (patientId: string, planSummary: string) => void;
}

export function AdjustCarePlanModal({
  patient,
  open,
  onOpenChange,
  onPlanAdjusted,
}: AdjustCarePlanModalProps) {
  const [medicationChange, setMedicationChange] = useState("");
  const [targetGoal, setTargetGoal] = useState("< 130/80 mmHg");
  const [followUpDays, setFollowUpDays] = useState("7");
  const [lowSodium, setLowSodium] = useState(true);
  const [dailyWalk, setDailyWalk] = useState(true);
  const [clinicalNote, setClinicalNote] = useState("");
  const [notifyCaregiver, setNotifyCaregiver] = useState(true);

  useEffect(() => {
    if (open && patient) {
      setMedicationChange(patient.currentRegimen || "");
      setTargetGoal("< 130/80 mmHg");
      setFollowUpDays("7");
      setClinicalNote("");
    }
  }, [open, patient]);

  if (!patient) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicationChange.trim()) return;
    const habits: string[] = [];
    if (lowSodium) habits.push("Low-sodium (<2g/day)");
    if (dailyWalk) habits.push("30m daily walk");
    const habitStr = habits.length ? ` · ${habits.join(", ")}` : "";
    const noteStr = clinicalNote.trim() ? ` · Note: ${clinicalNote.trim()}` : "";
    const summary = `${medicationChange.trim()} · Target ${targetGoal} · Recheck in ${followUpDays} days${habitStr}${noteStr}`;
    onPlanAdjusted(patient.id, summary);
    toast.success(`Care plan updated and sent to ${patient.name}.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-xl font-bold text-[#2C3E50]">
              Adjust Clinical Care Plan
            </DialogTitle>
            <Badge className="bg-[#FDF2F2] font-bold text-[#7A0000]">
              {patient.comorbidityBadge}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Prescribe regimen changes, lifestyle guidance, and follow-up targets for {patient.name} ({patient.age}y).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConfirm} className="my-3 space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
            <div>
              <div className="text-muted-foreground">Current Latest BP</div>
              <div className="font-display text-lg font-bold text-[#B71C1C]">
                {patient.latestBp
                  ? `${patient.latestBp.systolic}/${patient.latestBp.diastolic} mmHg`
                  : "No readings yet"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Target Clinical Boundary</div>
              <Input
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="mt-1 h-7 border-slate-200 bg-white text-xs font-bold text-[#1E7E34]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="med-change"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#2C3E50]"
            >
              <Pill className="h-3.5 w-3.5 text-[#7A0000]" />
              Medication Adjustment / Regimen *
            </Label>
            <Input
              id="med-change"
              required
              value={medicationChange}
              onChange={(e) => setMedicationChange(e.target.value)}
              className="border-slate-300 text-xs font-medium"
              placeholder="e.g. Amlodipine 10mg OD + Losartan 50mg"
            />
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 p-3">
            <div className="text-xs font-semibold text-[#2C3E50]">
              Lifestyle & Dietary Prescriptions:
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sodium"
                checked={lowSodium}
                onCheckedChange={(c) => setLowSodium(!!c)}
              />
              <label htmlFor="sodium" className="cursor-pointer text-xs text-slate-700">
                Strict low-sodium regimen (&lt; 2g sodium/day)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="walk"
                checked={dailyWalk}
                onCheckedChange={(c) => setDailyWalk(!!c)}
              />
              <label htmlFor="walk" className="cursor-pointer text-xs text-slate-700">
                Target 30 minutes brisk walking at least 5 days/week
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#2C3E50]">
                Next BP Review Interval
              </Label>
              <select
                value={followUpDays}
                onChange={(e) => setFollowUpDays(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs"
              >
                <option value="3">In 3 days (Tight control)</option>
                <option value="7">In 7 days (Recommended)</option>
                <option value="14">In 14 days (Routine)</option>
                <option value="30">In 30 days (Maintenance)</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-[#2C3E50]">
                Caregiver Loop Sync
              </Label>
              <div className="flex items-center gap-2 pt-2 text-xs text-slate-600">
                <Checkbox
                  id="caregiver"
                  checked={notifyCaregiver}
                  onCheckedChange={(c) => setNotifyCaregiver(!!c)}
                />
                <label htmlFor="caregiver" className="cursor-pointer">
                  Notify {patient.caregiverContact || "Caregiver"}
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-xs font-semibold text-[#2C3E50]">
              Direct Patient Instruction (optional)
            </Label>
            <Textarea
              id="note"
              rows={2}
              value={clinicalNote}
              onChange={(e) => setClinicalNote(e.target.value)}
              placeholder="Enter instructions for the patient..."
              className="border-slate-300 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
            <Button
              type="button"
              variant="outline"
              className="text-xs"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#7A0000] text-xs font-semibold text-white hover:bg-[#5E0000]"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Confirm & Send Plan Adjustment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AdjustCarePlanModal;
