import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { logWeeklySymptoms } from "@/lib/store";

interface WeeklySymptomsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  onSave?: (symptoms: {
    headache: boolean;
    chestDiscomfort: boolean;
    dizziness: boolean;
    notes?: string | undefined;
  }) => void;
}

export function WeeklySymptomsModal({
  open,
  onOpenChange,
  patientId,
  onSave,
}: WeeklySymptomsModalProps) {
  const [headache, setHeadache] = useState(false);
  const [chestDiscomfort, setChestDiscomfort] = useState(false);
  const [dizziness, setDizziness] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (patientId) {
      logWeeklySymptoms({
        patientId,
        headache,
        chestDiscomfort,
        dizziness,
        notes: notes.trim() || undefined,
      });
    }
    if (onSave) {
      onSave({ headache, chestDiscomfort, dizziness, notes: notes.trim() || undefined });
    }
    toast.success("Weekly symptoms saved to your clinical record.");
    setHeadache(false);
    setChestDiscomfort(false);
    setDizziness(false);
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl font-bold text-[#7A0000]">
            Weekly symptoms check-in
          </DialogTitle>
          <p className="mt-1 text-sm text-[#2C3E50]">
            Have you felt any of these this week? Turn on each symptom that applies.
          </p>
        </DialogHeader>

        <div className="my-4 space-y-4 divide-y divide-slate-100">
          <div className="flex items-center justify-between pt-3">
            <Label htmlFor="headache" className="cursor-pointer text-sm font-medium text-[#2C3E50]">
              Headache
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{headache ? "Yes" : "No"}</span>
              <Switch
                id="headache"
                checked={headache}
                onCheckedChange={setHeadache}
                className="data-[state=checked]:bg-[#7A0000]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <Label htmlFor="chest" className="cursor-pointer text-sm font-medium text-[#2C3E50]">
              Chest Discomfort
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {chestDiscomfort ? "Yes" : "No"}
              </span>
              <Switch
                id="chest"
                checked={chestDiscomfort}
                onCheckedChange={setChestDiscomfort}
                className="data-[state=checked]:bg-[#7A0000]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <Label htmlFor="dizziness" className="cursor-pointer text-sm font-medium text-[#2C3E50]">
              Dizziness
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{dizziness ? "Yes" : "No"}</span>
              <Switch
                id="dizziness"
                checked={dizziness}
                onCheckedChange={setDizziness}
                className="data-[state=checked]:bg-[#7A0000]"
              />
            </div>
          </div>

          <div className="pt-3 space-y-1.5">
            <Label htmlFor="sym-notes" className="text-xs font-medium text-[#2C3E50]">
              Additional notes (optional)
            </Label>
            <Textarea
              id="sym-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe when symptoms occur or any medication side effects..."
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-[11px] text-muted-foreground">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
          <span>
            This check-in is not monitored for emergencies. For severe or sudden symptoms, seek urgent care.
          </span>
        </div>

        <div className="mt-5 space-y-2">
          <Button
            className="h-11 w-full bg-[#7A0000] text-sm font-semibold text-white hover:bg-[#5E0000]"
            onClick={handleSave}
          >
            Save symptoms
          </Button>
          <Button
            variant="ghost"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            Not now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WeeklySymptomsModal;
