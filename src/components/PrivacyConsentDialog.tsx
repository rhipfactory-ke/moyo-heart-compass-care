import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Lock, ShieldCheck, Eye } from "lucide-react";

interface PrivacyConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyConsentDialog({ open, onOpenChange }: PrivacyConsentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <DialogHeader className="text-left">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-xl font-bold text-[#2C3E50]">
              Privacy & Clinical Governance
            </DialogTitle>
            <Badge className="bg-emerald-50 text-[10px] font-bold text-emerald-800">
              Kenya DPA (2019) Compliant
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            How your sensitive health data is protected under Kenyan statutory guidelines.
          </DialogDescription>
        </DialogHeader>

        <div className="my-3 space-y-3.5 text-xs text-[#2C3E50]">
          <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#B71C1C]" />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#B71C1C]">
                Clinical Notice & Emergency Disclaimer
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                MoyoDoc is a regular care-continuity tool,{" "}
                <strong>not an emergency response or 24/7 ICU dispatch service</strong>. If you feel severe chest pain, shortness of breath, dizziness, or sudden weakness, call 999/112 or visit the nearest hospital emergency department immediately.
              </p>
            </div>
          </div>

          <div className="space-y-1.5 rounded-xl border border-slate-200 p-3">
            <div className="flex items-center gap-2 font-semibold text-[#2C3E50]">
              <Lock className="h-3.5 w-3.5 text-[#7A0000]" />
              Isolated Row-Level Security (RLS)
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Your blood pressure readings and adherence streaks are private to you and accessible only by your enrolled specialist. No other patient or third party can query or view your health records.
            </p>
          </div>

          <div className="space-y-1.5 rounded-xl border border-slate-200 p-3">
            <div className="flex items-center gap-2 font-semibold text-[#2C3E50]">
              <Eye className="h-3.5 w-3.5 text-[#7A0000]" />
              Data Minimization & Ephemeral Scans
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Under Section 25 data minimization principles, camera monitor photos are ephemeral. Raw monitor photos are discarded immediately after digit extraction, storing only confirmed numeric values.
            </p>
          </div>

          <div className="space-y-1.5 rounded-xl border border-slate-200 p-3">
            <div className="flex items-center gap-2 font-semibold text-[#2C3E50]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#7A0000]" />
              Immutable Audit Logging
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Every clinical status review, loop closure, and care plan adjustment is permanently logged to an append-only audit register, preventing retrospective tampering.
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-2">
          <Button
            className="bg-[#7A0000] text-xs font-semibold text-white hover:bg-[#5E0000]"
            onClick={() => onOpenChange(false)}
          >
            I Understand & Agree
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PrivacyConsentDialog;
