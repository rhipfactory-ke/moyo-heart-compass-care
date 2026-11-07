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
import { Printer, FileText, CheckCircle2 } from "lucide-react";
import type { PatientRecord } from "@/hooks/use-patients";
import type { BpReadingItem } from "@/hooks/use-bp-readings";

interface EncounterPdfExportProps {
  patient: PatientRecord | null;
  readings: BpReadingItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EncounterPdfExport({
  patient,
  readings,
  open,
  onOpenChange,
}: EncounterPdfExportProps) {
  if (!patient) return null;

  const handlePrint = () => {
    window.print();
  };

  const recentReadings = readings.slice(-10).reverse();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <DialogTitle className="flex items-center gap-2 font-display text-lg font-bold text-[#2C3E50]">
              <FileText className="h-5 w-5 text-[#7A0000]" />
              30-Day Clinical Encounter Summary
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official hospital chart export for EMR / paper attachment.
            </DialogDescription>
          </div>
          <Button
            onClick={handlePrint}
            className="h-9 gap-1.5 bg-[#7A0000] text-xs font-semibold text-white hover:bg-[#5E0000]"
          >
            <Printer className="h-4 w-4" />
            Print / Save as PDF
          </Button>
        </DialogHeader>

        <div id="printable-encounter-chart" className="space-y-5 p-4 text-xs text-[#2C3E50]">
          <div className="flex items-start justify-between border-b-2 border-[#7A0000] pb-4">
            <div>
              <div className="font-display text-base font-extrabold uppercase tracking-wider text-[#7A0000]">
                {(patient.hospitalName || "MOYODOC CONNECTED CARE").toUpperCase()} · CARDIOLOGY CONTINUITY UNIT
              </div>
              <div className="text-[11px] text-slate-500">
                {patient.county} · Outpatient Cardiovascular Care Service
              </div>
              <div className="text-[11px] text-slate-500">
                Patient ID: {patient.id}
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-[#7A0000]/10 text-[10px] font-bold text-[#7A0000]">
                KMPDC VALIDATED
              </Badge>
              <div className="mt-1 font-mono text-[11px] text-slate-500">
                Date:{" "}
                {new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:grid-cols-4">
            <div>
              <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                Patient Name
              </div>
              <div className="font-bold text-[#2C3E50]">{patient.name}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                Age / Phone
              </div>
              <div className="font-semibold text-[#2C3E50]">
                {patient.age}y · {patient.phone}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                Conditions
              </div>
              <div className="font-semibold text-[#7A0000]">{patient.comorbidityBadge}</div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                Managing Specialist
              </div>
              <div className="font-semibold text-slate-700">
                {patient.specialistName || "Unassigned"}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              1. 30-Day Vitals & Adherence Metrics
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-[10px] text-muted-foreground">Latest Recorded BP</div>
                <div className="font-display text-xl font-bold text-[#7A0000]">
                  {patient.latestBp ? (
                    <>
                      {patient.latestBp.systolic}/{patient.latestBp.diastolic}{" "}
                      <span className="text-xs font-normal">mmHg</span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-400">No readings</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500">
                  {patient.latestBp?.measuredAt || "—"}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-[10px] text-muted-foreground">Medication Adherence</div>
                <div className="font-display text-xl font-bold text-[#1E7E34]">
                  {patient.medicationAdherence}%
                </div>
                <div className="text-[10px] text-slate-500">
                  {patient.medsStreak}-Day streak
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="text-[10px] text-muted-foreground">Lifestyle & Walking</div>
                <div className="font-display text-xl font-bold text-[#2C3E50]">
                  {patient.walksCompleted}/7 days
                </div>
                <div className="text-[10px] text-slate-500">20-min daily target</div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              2. Recent Telemetry Log History ({recentReadings.length} Readings)
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[10px] font-semibold uppercase text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">Systolic</th>
                    <th className="px-3 py-2">Diastolic</th>
                    <th className="px-3 py-2">Pulse</th>
                    <th className="px-3 py-2">Capture Mode</th>
                    <th className="px-3 py-2">Clinical Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentReadings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No blood pressure readings logged yet.
                      </td>
                    </tr>
                  ) : (
                    recentReadings.map((r, i) => {
                      const isHigh = r.systolic >= 140 || r.diastolic >= 90;
                      return (
                        <tr key={r.id || i} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono text-[11px]">
                            {r.measured_at
                              ? new Date(r.measured_at).toLocaleString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "—"}
                          </td>
                          <td
                            className={`px-3 py-2 font-bold ${
                              isHigh ? "text-[#B71C1C]" : "text-slate-800"
                            }`}
                          >
                            {r.systolic} mmHg
                          </td>
                          <td
                            className={`px-3 py-2 font-bold ${
                              isHigh ? "text-[#B71C1C]" : "text-slate-800"
                            }`}
                          >
                            {r.diastolic} mmHg
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {r.pulse ? `${r.pulse} bpm` : "—"}
                          </td>
                          <td className="px-3 py-2 text-[11px] text-slate-500">
                            {r.source || "MANUAL"}
                          </td>
                          <td className="px-3 py-2">
                            {isHigh ? (
                              <span className="text-[10px] font-semibold text-rose-700">
                                Above Target
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-700">
                                In Target
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              3. Clinician Clinical Plan & Loop Closure
            </div>
            <p className="text-xs leading-relaxed text-slate-700">
              <strong>Current Status:</strong> {patient.contextNote}
            </p>
            <p className="text-xs leading-relaxed text-slate-700">
              <strong>Active Care Plan:</strong>{" "}
              {patient.adjustedPlan ||
                patient.currentRegimen ||
                "No care plan adjustment recorded yet."}
            </p>
            {patient.status === "ACKNOWLEDGED" && (
              <div className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Clinical Loop Closed by {patient.acknowledgedBy || "Specialist"}
              </div>
            )}
          </div>

          <div className="flex items-end justify-between border-t border-slate-200 pt-4 text-xs">
            <div>
              <div className="font-bold text-[#2C3E50]">
                {patient.specialistName || "Attending Specialist"}
              </div>
              <div className="text-[11px] text-slate-500">
                {patient.hospitalName || "MoyoDoc Provider Network"}
              </div>
            </div>
            <div className="text-right">
              <div className="mb-1 w-36 border-b border-slate-400"></div>
              <div className="text-[10px] text-slate-400">Authorized Clinician Signature</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EncounterPdfExport;
