import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useMe } from "@/hooks/use-me";
import { usePatient, usePatients } from "@/hooks/use-patients";
import { useBpReadings } from "@/hooks/use-bp-readings";
import { AppHeader } from "@/components/AppHeader";
import { BpChart } from "@/components/BpChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/doctor_/patient/$patientId")({
  head: () => ({
    meta: [
      { title: "Patient detail — MoyoDoc" },
      { name: "description", content: "Patient readings, adherence and alerts." },
    ],
  }),
  component: PatientDetail,
});

const ACTIONS = [
  { k: "ACKNOWLEDGE", l: "Acknowledge" },
  { k: "SCHEDULE_CONTACT", l: "Schedule contact" },
  { k: "ADJUST_PLAN", l: "Adjust plan" },
  { k: "REFER", l: "Refer" },
] as const;

function PatientDetail() {
  const { patientId } = Route.useParams();
  const me = useMe();
  const { patient } = usePatient(patientId);
  const { readings } = useBpReadings(patient?.id);
  const { acknowledgePatient, adjustCarePlan } = usePatients();
  const [message, setMessage] = useState("");

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] pb-12 text-[#2C3E50]">
        <AppHeader name={me.data?.name} subtitle="Physician dashboard" />
        <main className="mx-auto max-w-6xl space-y-5 px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">Patient record not found.</p>
          <Button asChild variant="outline" size="sm">
            <Link to="/doctor">Back to Patient Panel</Link>
          </Button>
        </main>
      </div>
    );
  }

  const handleAction = (actionKey: string) => {
    if (message.trim()) {
      adjustCarePlan(patient.id, message.trim(), me.data?.name);
    }
    acknowledgePatient(patient.id, me.data?.name);
    toast.success(`Action "${actionKey}" logged for ${patient.name}.`);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12 text-[#2C3E50]">
      <AppHeader name={me.data?.name || patient.specialistName} subtitle="Physician dashboard" />
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-6">
        <Link
          to="/doctor"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#7A0000]"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Patient Panel
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold">
              {patient.name} · {patient.age}y
              <Badge className="border border-[#7A0000]/20 bg-[#FDF2F2] text-xs font-bold text-[#7A0000]">
                {patient.comorbidityBadge}
              </Badge>
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">{patient.contextNote}</p>
          </div>

          <div className="flex items-center gap-2">
            {patient.status === "OPEN" && patient.bucket === "OUT_OF_CONTROL" ? (
              <Button
                onClick={() => handleAction("ACKNOWLEDGE")}
                className="bg-[#7A0000] text-xs font-semibold text-white hover:bg-[#5E0000]"
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Acknowledge Alert
              </Button>
            ) : (
              <Badge className="border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                ✓ Acknowledged · Closed Loop
              </Badge>
            )}
          </div>
        </div>

        <Card className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Blood pressure trend · Last 30 days
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <BpChart readings={readings} height={240} />
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#2C3E50]">
              Clinical Follow-up & Loop Closure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter note or patient instructions (e.g., 'Maintain morning dose, recheck BP in 3 days')..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border-slate-200 text-xs"
            />
            <div className="flex flex-wrap gap-2">
              {ACTIONS.map((a) => (
                <Button
                  key={a.k}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(a.l)}
                  className="text-xs"
                >
                  {a.l}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
