import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPatientReadings,
  logPatientBpReading,
  type BpReadingItem,
} from "@/lib/store";

export type { BpReadingItem };

export function useBpReadings(patientId?: string | null) {
  const qc = useQueryClient();
  const resolvedId = patientId || "";

  useEffect(() => {
    const handler = () => {
      qc.invalidateQueries({ queryKey: ["bp-readings", resolvedId] });
      qc.invalidateQueries({ queryKey: ["patients-panel"] });
    };
    window.addEventListener("moyodoc:store_updated", handler);
    return () => window.removeEventListener("moyodoc:store_updated", handler);
  }, [qc, resolvedId]);

  const query = useQuery({
    queryKey: ["bp-readings", resolvedId],
    queryFn: async (): Promise<BpReadingItem[]> => {
      if (!resolvedId) return [];
      return getPatientReadings(resolvedId);
    },
    initialData: () => (resolvedId ? getPatientReadings(resolvedId) : []),
  });

  const logReadingMutation = useMutation({
    mutationFn: async (newReading: {
      systolic: number;
      diastolic: number;
      pulse?: number;
      source?: "PHOTO_OCR" | "MANUAL" | "BLUETOOTH";
      confidence?: string;
    }) => {
      if (!resolvedId) {
        throw new Error("Please register or select a patient profile before logging a reading.");
      }
      return logPatientBpReading({
        patientId: resolvedId,
        systolic: newReading.systolic,
        diastolic: newReading.diastolic,
        pulse: newReading.pulse,
        source: newReading.source ?? "MANUAL",
        confidence: newReading.confidence,
      });
    },
    onSuccess: (updated) => {
      qc.setQueryData(["bp-readings", resolvedId], updated);
      qc.invalidateQueries({ queryKey: ["bp-readings", resolvedId] });
      qc.invalidateQueries({ queryKey: ["patients-panel"] });
      toast.success("Reading confirmed and logged to your record.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save blood pressure reading.");
    },
  });

  const readings = query.data ?? [];
  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;
  const last7DaysReadings = readings.slice(-7);

  return {
    readings,
    last7DaysReadings,
    latestReading,
    isLoading: query.isLoading,
    logReading: (reading: {
      systolic: number;
      diastolic: number;
      pulse?: number;
      source?: "PHOTO_OCR" | "MANUAL" | "BLUETOOTH";
      confidence?: string;
    }) => logReadingMutation.mutate(reading),
    isLogging: logReadingMutation.isPending,
  };
}
