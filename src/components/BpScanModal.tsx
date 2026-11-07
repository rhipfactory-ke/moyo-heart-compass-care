import React, { useState, useEffect, useRef } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Check, RefreshCw, Upload, Sparkles, AlertCircle } from "lucide-react";

interface BpScanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmReading: (reading: {
    systolic: number;
    diastolic: number;
    pulse: number;
    source: "PHOTO_OCR" | "MANUAL" | "BLUETOOTH";
    confidence: string;
  }) => void;
  initialMode?: "PHOTO" | "MANUAL" | "BLUETOOTH";
}

export function BpScanModal({
  open,
  onOpenChange,
  onConfirmReading,
  initialMode = "PHOTO",
}: BpScanModalProps) {
  const [phase, setPhase] = useState<"SCANNING" | "REVIEW">(
    initialMode === "MANUAL" ? "REVIEW" : "SCANNING",
  );
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [confidence, setConfidence] = useState(
    initialMode === "BLUETOOTH"
      ? "BLUETOOTH PAIR"
      : initialMode === "PHOTO"
        ? "OCR READY"
        : "MANUAL ENTRY",
  );
  const [source, setSource] = useState<"PHOTO_OCR" | "MANUAL" | "BLUETOOTH">(
    initialMode === "MANUAL"
      ? "MANUAL"
      : initialMode === "BLUETOOTH"
        ? "BLUETOOTH"
        : "PHOTO_OCR",
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setSystolic("");
      setDiastolic("");
      setPulse("");
      if (initialMode === "MANUAL") {
        setPhase("REVIEW");
        setSource("MANUAL");
        setConfidence("MANUAL ENTRY");
      } else if (initialMode === "BLUETOOTH") {
        setPhase("SCANNING");
        setSource("BLUETOOTH");
        setConfidence("BLUETOOTH (100%)");
        timerRef.current = setTimeout(() => {
          setPhase("REVIEW");
        }, 1200);
      } else {
        setPhase("SCANNING");
        setSource("PHOTO_OCR");
        setConfidence("HIGH (98%)");
        timerRef.current = setTimeout(() => {
          setPhase("REVIEW");
        }, 1500);
      }
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, initialMode]);

  const handleRetake = () => {
    setPhase("SCANNING");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPhase("REVIEW");
    }, 1500);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const s = parseInt(systolic, 10);
    const d = parseInt(diastolic, 10);
    const p = parseInt(pulse, 10);

    if (isNaN(s) || isNaN(d) || s < 50 || s > 300 || d < 30 || d > 200) {
      return;
    }

    onConfirmReading({
      systolic: s,
      diastolic: d,
      pulse: isNaN(p) ? 72 : p,
      source,
      confidence,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl border-none p-0 shadow-2xl sm:max-w-lg">
        {phase === "SCANNING" ? (
          <div className="flex flex-col bg-white p-6">
            <DialogHeader className="pb-3 text-left">
              <DialogTitle className="font-display text-xl font-bold text-[#2C3E50]">
                {source === "BLUETOOTH" ? "Pairing Bluetooth BP Monitor" : "Scanning BP Monitor"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {source === "BLUETOOTH"
                  ? "Connecting to cuff · Extracting Systolic, Diastolic, and Pulse"
                  : "Hold steady · AI auto-capture: Systolic, Diastolic, Pulse"}
              </DialogDescription>
            </DialogHeader>

            <div className="relative my-3 flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#7A0000]/40 bg-slate-900 p-8 shadow-inner">
              <div className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-[#B71C1C]" />
              <div className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-[#B71C1C]" />
              <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-[#B71C1C]" />
              <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-[#B71C1C]" />

              <div className="monitor-scan absolute inset-x-0 h-1 bg-[#B71C1C] opacity-90 shadow-[0_0_15px_#B71C1C]" />

              <div className="w-56 rounded-lg border-4 border-slate-700 bg-[#C8D6AF] p-4 text-center font-mono shadow-md">
                <div className="mb-1 text-[10px] tracking-wider text-slate-800">
                  SYS / DIA mmHg
                </div>
                <div className="text-3xl font-black tracking-tight text-slate-900">--- / ---</div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-700/40 pt-1 text-xs font-bold text-slate-800">
                  <span>PULSE /min</span>
                  <span className="text-sm font-black">--</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                <span className="h-2 w-2 animate-ping rounded-full bg-rose-500" />
                {source === "BLUETOOTH"
                  ? "Syncing with Bluetooth cuff..."
                  : "Reading monitor screen... Hold steady"}
              </div>
            </div>

            <p className="mt-1 text-center text-xs text-muted-foreground">
              Enter or verify your reading in the next step.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700"
                onClick={handleRetake}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Rescan
              </Button>
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700"
                onClick={() => setPhase("REVIEW")}
              >
                <Upload className="mr-2 h-4 w-4" />
                Enter values now
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="flex flex-col bg-white p-6">
            <DialogHeader className="pb-3 text-left">
              <div className="flex items-center justify-between">
                <DialogTitle className="font-display text-xl font-bold text-[#2C3E50]">
                  Enter & Confirm BP Reading
                </DialogTitle>
                <Badge className="bg-emerald-100 font-semibold text-emerald-800 hover:bg-emerald-100">
                  <Sparkles className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                  {confidence}
                </Badge>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter the Systolic, Diastolic, and Pulse values from your blood pressure monitor.
              </DialogDescription>
            </DialogHeader>

            <div className="my-2 rounded-xl border border-slate-200 bg-[#F8F9FA] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Blood Pressure
                  </div>
                  <div className="font-display text-3xl font-extrabold text-[#7A0000]">
                    {systolic || "—"} / {diastolic || "—"}{" "}
                    <span className="text-sm font-medium text-slate-500">mmHg</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pulse
                  </div>
                  <div className="font-display text-xl font-bold text-[#2C3E50]">
                    {pulse || "—"} <span className="text-xs font-normal text-slate-500">bpm</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sys-input" className="text-xs font-semibold text-slate-700">
                    Systolic (SYS) *
                  </Label>
                  <Input
                    id="sys-input"
                    type="number"
                    required
                    min={50}
                    max={300}
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="h-12 border-slate-300 text-center font-display text-xl font-bold text-[#7A0000] focus-visible:ring-[#7A0000]"
                    placeholder="e.g. 135"
                  />
                  <span className="block text-center text-[10px] text-muted-foreground">mmHg</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="dia-input" className="text-xs font-semibold text-slate-700">
                    Diastolic (DIA) *
                  </Label>
                  <Input
                    id="dia-input"
                    type="number"
                    required
                    min={30}
                    max={200}
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="h-12 border-slate-300 text-center font-display text-xl font-bold text-[#2C3E50] focus-visible:ring-[#7A0000]"
                    placeholder="e.g. 85"
                  />
                  <span className="block text-center text-[10px] text-muted-foreground">mmHg</span>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pulse-input" className="text-xs font-semibold text-slate-700">
                    Pulse Rate
                  </Label>
                  <Input
                    id="pulse-input"
                    type="number"
                    min={30}
                    max={250}
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className="h-12 border-slate-300 text-center font-display text-xl font-bold text-[#2C3E50] focus-visible:ring-[#7A0000]"
                    placeholder="e.g. 72"
                  />
                  <span className="block text-center text-[10px] text-muted-foreground">bpm</span>
                </div>
              </div>
            </div>

            <div className="mt-1 flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <span>
                Readings ≥ 140/90 mmHg are automatically flagged for your specialist's Out-of-Control review queue.
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                className="col-span-1 border-slate-300 text-slate-700"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="col-span-2 h-11 bg-[#7A0000] text-sm font-semibold text-white shadow-md hover:bg-[#5E0000]"
                disabled={!systolic || !diastolic}
              >
                <Check className="mr-2 h-4 w-4" />
                Confirm & Log Reading
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export const BpPhotoCaptureModal = BpScanModal;
export default BpScanModal;
