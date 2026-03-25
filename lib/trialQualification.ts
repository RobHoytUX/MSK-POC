import type { Patient } from "./patients";

/**
 * Demo rules: map patient diagnoses to trial ids defined in clinicalTrialsData.
 */
export function getQualifiedTrialIds(patient: Patient): string[] {
  const dx = patient.diagnoses.join(" ").toLowerCase();
  const ids = new Set<string>();

  if (
    dx.includes("triple-negative") ||
    dx.includes("triple negative") ||
    dx.includes("tnbc")
  ) {
    ids.add("trial-4");
    ids.add("trial-5");
    ids.add("trial-1");
  } else if (
    dx.includes("her2+") ||
    dx.includes("her2 positive") ||
    dx.includes("(her2+)")
  ) {
    ids.add("trial-6");
  } else if (dx.includes("breast")) {
    ids.add("trial-1");
    ids.add("trial-2");
  }

  return Array.from(ids);
}
