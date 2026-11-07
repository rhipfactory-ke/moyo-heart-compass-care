import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPatients,
  savePatients,
  clearAllMoyoDocData,
  type PatientRecord,
} from "@/lib/store";

export type { PatientRecord };

export function usePatients() {
  const qc = useQueryClient();

  useEffect(() => {
    const handler = () => {
      qc.invalidateQueries({ queryKey: ["patients-panel"] });
    };
    window.addEventListener("moyodoc:store_updated", handler);
    return () => window.removeEventListener("moyodoc:store_updated", handler);
  }, [qc]);

  const query = useQuery({
    queryKey: ["patients-panel"],
    queryFn: async (): Promise<PatientRecord[]> => {
      return getPatients();
    },
    initialData: () => getPatients(),
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async ({
      patientId,
      doctorName,
    }: {
      patientId: string;
      doctorName?: string | undefined;
    }) => {
      const current = getPatients();
      const updated = current.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            status: "ACKNOWLEDGED" as const,
            acknowledgedAt: new Date().toISOString(),
            acknowledgedBy: doctorName || p.specialistName || "Your Specialist",
          };
        }
        return p;
      });
      savePatients(updated);
      return updated;
    },
    onSuccess: (updated) => {
      qc.setQueryData(["patients-panel"], updated);
      qc.invalidateQueries({ queryKey: ["patients-panel"] });
      toast.success("Loop Closed: Notification sent to patient companion app.");
    },
    onError: () => {
      toast.error("Failed to acknowledge patient alert.");
    },
  });

  const adjustPlanMutation = useMutation({
    mutationFn: async ({
      patientId,
      planSummary,
      doctorName,
    }: {
      patientId: string;
      planSummary: string;
      doctorName?: string | undefined;
    }) => {
      const current = getPatients();
      const target = current.find((p) => p.id === patientId);
      if (target && target.bucket === "OUT_OF_CONTROL" && target.status !== "ACKNOWLEDGED") {
        throw new Error("Patient alert must be acknowledged before titrating or adjusting care plan.");
      }

      const updated = current.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            adjustedPlan: planSummary,
            adjustedPlanAt: new Date().toISOString(),
            adjustedBy: doctorName || p.specialistName || "Your Specialist",
          };
        }
        return p;
      });
      savePatients(updated);
      return updated;
    },
    onSuccess: (updated) => {
      qc.setQueryData(["patients-panel"], updated);
      qc.invalidateQueries({ queryKey: ["patients-panel"] });
      toast.success("Care plan adjustment saved and transmitted to patient companion.");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to adjust care plan.");
    },
  });

  const patients = query.data ?? [];

  const outOfControl = patients.filter(
    (p) => p.bucket === "OUT_OF_CONTROL" && p.status === "OPEN",
  );
  const disengaged = patients.filter((p) => p.bucket === "DISENGAGED");
  const stable = patients.filter(
    (p) =>
      p.bucket === "STABLE" ||
      (p.bucket === "OUT_OF_CONTROL" && p.status === "ACKNOWLEDGED"),
  );

  return {
    patients,
    isLoading: query.isLoading,
    outOfControl,
    disengaged,
    stable,
    acknowledgePatient: (patientId: string, doctorName?: string) =>
      acknowledgeMutation.mutate({ patientId, doctorName }),
    isAcknowledging: acknowledgeMutation.isPending,
    adjustCarePlan: (patientId: string, planSummary: string, doctorName?: string) =>
      adjustPlanMutation.mutate({ patientId, planSummary, doctorName }),
    isAdjustingPlan: adjustPlanMutation.isPending,
    clearAllData: () => {
      clearAllMoyoDocData();
      qc.setQueryData(["patients-panel"], []);
      qc.invalidateQueries();
      toast.info("All local records cleared.");
    },
  };
}

export function usePatient(patientId?: string | null) {
  const { patients } = usePatients();
  const patient =
    (patientId ? patients.find((p) => p.id === patientId) : undefined) ||
    patients[0] ||
    null;

  return {
    patient,
  };
}
