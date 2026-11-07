// Shared clinical rules (pure functions, unit-tested).
export const SYSTOLIC_TARGET = 140;
export const DIASTOLIC_TARGET = 90;

export function isElevated(r: { systolic: number; diastolic: number }) {
  return r.systolic >= SYSTOLIC_TARGET || r.diastolic >= DIASTOLIC_TARGET;
}

export type RiskCategory = "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";

/** Simple intake triage: age, diabetes and weight raise risk. */
export function computeRisk(input: {
  age: number;
  hasDiabetes: boolean;
  weightKg?: number | null;
  hasHypertension?: boolean;
  hasFamilyHistory?: boolean;
}): RiskCategory {
  let score = 0;
  if (input.age >= 65) score += 2;
  else if (input.age >= 45) score += 1;
  if (input.hasDiabetes) score += 2;
  if (input.hasHypertension) score += 1;
  if (input.hasFamilyHistory) score += 1;
  if (input.weightKg && input.weightKg >= 100) score += 1;
  if (score >= 4) return "VERY_HIGH";
  if (score >= 3) return "HIGH";
  if (score >= 1) return "MODERATE";
  return "LOW";
}

export function ageFromDob(dob: string) {
  const d = new Date(dob);
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}

export function daysSince(iso: string | null | undefined) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export const RISK_LABEL: Record<RiskCategory, string> = {
  LOW: "Low risk",
  MODERATE: "Moderate risk",
  HIGH: "High risk",
  VERY_HIGH: "Very high risk",
};

export const RULE_LABEL: Record<string, string> = {
  PERSISTENT_BP_3_OF_5: "Persistent high BP (2+ of last 5)",
  DROPOUT_14D: "No readings for 14 days",
  ADHERENCE_DROP: "Missed medication 5 days in a row",
};
