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
      const firstPatient = patients[0];
      if (firstPatient) {
        return {
          role: "PATIENT",
          userId: firstPatient.id,
          name: firstPatient.name,
          email: firstPatient.email,
        };
      }
      const clinicians = getClinicians();
      const firstClinician = clinicians[0];
      if (firstClinician) {
        return {
          role: "PHYSICIAN",
          userId: firstClinician.id,
          name: firstClinician.name,
          email: firstClinician.email,
          hospitalName: firstClinician.hospitalName,
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
