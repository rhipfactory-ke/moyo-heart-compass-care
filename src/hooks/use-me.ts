import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  getSession,
  setSession,
  getPatients,
  getClinicians,
  type ActiveSession,
} from "@/lib/store";

export function useMe() {
  const qc = useQueryClient();

  useEffect(() => {
    const handler = () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    };
    window.addEventListener("moyodoc:store_updated", handler);
    return () => window.removeEventListener("moyodoc:store_updated", handler);
  }, [qc]);

  return useQuery({
    queryKey: ["me"],
    queryFn: async (): Promise<ActiveSession | null> => {
      const current = getSession();
      if (current) return current;

      // If no explicit session yet, check if there is a registered patient or clinician
      const patients = getPatients();
      if (patients.length > 0) {
        return {
          role: "PATIENT",
          userId: patients[0].id,
          name: patients[0].name,
          email: patients[0].email,
        };
      }
      const clinicians = getClinicians();
      if (clinicians.length > 0) {
        return {
          role: "PHYSICIAN",
          userId: clinicians[0].id,
          name: clinicians[0].name,
          email: clinicians[0].email,
          hospitalName: clinicians[0].hospitalName,
        };
      }
      return null;
    },
    initialData: () => getSession(),
  });
}

export function useSignOut() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    setSession(null);
    await qc.invalidateQueries({ queryKey: ["me"] });
    navigate({ to: "/login", replace: true });
  };
}
