import type { Patient } from "./patients";

/** Matches the discovery timeline shape in CancerTreatmentDashboard (filter/search compatible). */
export type DiscoveryTimelineEvent = {
  id: string;
  date: string;
  title: string;
  description: string;
  details: string;
  severity?: "Emergency" | "Severe" | "Follow Up";
};

export type DiscoveryTimelineBundle = {
  diagnosis: DiscoveryTimelineEvent[];
  treatment: DiscoveryTimelineEvent[];
  monitoring: DiscoveryTimelineEvent[];
  sideEffects: DiscoveryTimelineEvent[];
  labs: DiscoveryTimelineEvent[];
  documentation: DiscoveryTimelineEvent[];
};

const MO = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Deterministic pseudo-random from patient + salt (different per cohort member). */
function mix(patient: Patient, salt: number): number {
  let h = salt >>> 0;
  const s = `${patient.id}|${patient.mrn}|${patient.age}`;
  for (let k = 0; k < s.length; k++) h = Math.imul(h ^ s.charCodeAt(k), 0x9e3779b9);
  h ^= patient.diagnoses.join().length * 1315423911;
  h ^= (patient.medications[0]?.length ?? 0) * 2654435761;
  return h >>> 0;
}

/** Unique calendar label "Mon DD" spread across the year — drives horizontal node positions. */
function dateFor(patient: Patient, category: string, index: number): string {
  const h = mix(patient, category.charCodeAt(0) * 997 + index * 7919 + category.length * 31);
  const monthIdx = h % 12;
  const span = DAYS[monthIdx];
  const day = 1 + (Math.floor(h / 12) % span);
  return `${MO[monthIdx]} ${day}`;
}

function pick<T>(patient: Patient, salt: string, options: readonly T[]): T {
  const h = mix(patient, salt.split("").reduce((a, c) => a + c.charCodeAt(0), 0));
  return options[h % options.length]!;
}

function countInRange(patient: Patient, key: string, min: number, max: number): number {
  const h = mix(patient, key.length * 401 + 17);
  return min + (h % (max - min + 1));
}

export function getDiscoveryTimelineForPatient(patient: Patient): DiscoveryTimelineBundle {
  const dx = patient.diagnoses[0] ?? "Oncology diagnosis";
  const dx2 = patient.diagnoses[1];
  const dx3 = patient.diagnoses[2];
  const med0 = patient.medications[0] ?? "Supportive care";
  const med1 = patient.medications[1];
  const med2 = patient.medications[2];
  const fn = patient.name.split(" ")[0] ?? patient.name;
  const appt = patient.upcomingAppointments[0];

  const diagTitles = [
    "Initial Diagnosis",
    "Pathology confirmation",
    "Staging workup",
    "Multidisciplinary review",
    "Biopsy & receptor profile",
    "Second opinion intake",
  ] as const;
  const txTitles = [
    "Systemic therapy start",
    "Radiation simulation",
    "Immunotherapy cycle",
    "Surgical planning",
    "Port placement",
    "Targeted therapy adjustment",
    "Clinical trial enrollment",
  ] as const;
  const monTitles = [
    "Tumor marker trend",
    "Cross-sectional imaging",
    "Cardiac / organ monitoring",
    "Symptom surveillance visit",
    "PET/CT response",
    "Pulmonary function",
  ] as const;
  const seTitles = [
    "Acute toxicity triage",
    "Neuropathy review",
    "Neutropenia watch",
    "GI symptom management",
    "Fatigue & QOL",
    "Dermatitis follow-up",
  ] as const;
  const labTitles = [
    "CBC & differential",
    "Comprehensive metabolic panel",
    "LFTs / coags",
    "Renal panel",
    "Tumor markers",
    "Endocrine panel",
  ] as const;
  const docTitles = [
    "Consent & education",
    "Care plan update",
    "Advance care planning note",
    "Insurance authorization",
    "Treatment summary",
    "Referral packet",
  ] as const;

  const nDiag = countInRange(patient, "diagnosis", 2, 5);
  const nTx = countInRange(patient, "treatment", 3, 6);
  const nMon = countInRange(patient, "monitoring", 2, 5);
  const nSe = countInRange(patient, "sideEffects", 2, 4);
  const nLab = countInRange(patient, "labs", 3, 6);
  const nDoc = countInRange(patient, "documentation", 2, 5);

  const diagnosis: DiscoveryTimelineEvent[] = [];
  for (let i = 0; i < nDiag; i++) {
    const title = pick(patient, `d-t-${i}`, diagTitles);
    const sev = i === 0 ? ("Severe" as const) : mix(patient, 88 + i) % 4 === 0 ? ("Emergency" as const) : ("Follow Up" as const);
    diagnosis.push({
      id: `${patient.id}-dx-${i}`,
      date: dateFor(patient, "diagnosis", i),
      title,
      description:
        i === 0
          ? `${dx} — index encounter`
          : dx2 && i === 1
            ? `Related: ${dx2}`
            : dx3 && i === 2
              ? `Also noted: ${dx3}`
              : `Clinical update ${i + 1} for ${fn}`,
      details: `Chart: ${patient.name} · MRN ${patient.mrn}. ${title} documented in context of ${dx}. Notes reflect ${patient.yearsAsPatient}y on service and current meds (${med0}${med1 ? `, ${med1}` : ""}).`,
      severity: i === 0 ? "Severe" : sev === "Emergency" ? "Emergency" : "Follow Up",
    });
  }

  const treatment: DiscoveryTimelineEvent[] = [];
  for (let i = 0; i < nTx; i++) {
    const title = pick(patient, `tx-t-${i}`, txTitles);
    treatment.push({
      id: `${patient.id}-tx-${i}`,
      date: dateFor(patient, "treatment", i),
      title,
      description:
        i % 3 === 0
          ? `${med0} — cycle / dose`
          : med1 && i % 3 === 1
            ? `${med1} coordination`
            : `Therapy milestone ${i + 1}`,
      details: `${title} for ${patient.name}. Disease focus: ${dx}. Active regimen includes ${med0}${med2 ? `; ${med2} as indicated` : ""}. Next touchpoint: ${appt?.type ?? "clinic follow-up"}.`,
    });
  }

  const monitoring: DiscoveryTimelineEvent[] = [];
  for (let i = 0; i < nMon; i++) {
    const title = pick(patient, `mon-t-${i}`, monTitles);
    monitoring.push({
      id: `${patient.id}-mon-${i}`,
      date: dateFor(patient, "monitoring", i),
      title,
      description: mix(patient, 501 + i) % 2 === 0 ? "Interval assessment" : "Scheduled surveillance",
      details: `${title} for ${fn}. Interpreted against ${dx} and current treatment (${med0}). Last visit context: ${patient.lastVisit}.`,
    });
  }

  const sideEffects: DiscoveryTimelineEvent[] = [];
  for (let i = 0; i < nSe; i++) {
    const title = pick(patient, `se-t-${i}`, seTitles);
    const sev = mix(patient, 900 + i) % 3 === 0 ? ("Emergency" as const) : ("Follow Up" as const);
    sideEffects.push({
      id: `${patient.id}-se-${i}`,
      date: dateFor(patient, "sideEffects", i),
      title,
      description: `On ${med0}`,
      details: `${title}: assessment for ${patient.name} while on ${med0}${med1 ? ` ± ${med1}` : ""}. Interventions per protocol for ${dx}.`,
      severity: sev,
    });
  }

  const labs: DiscoveryTimelineEvent[] = [];
  for (let i = 0; i < nLab; i++) {
    const title = pick(patient, `lab-t-${i}`, labTitles);
    labs.push({
      id: `${patient.id}-lab-${i}`,
      date: dateFor(patient, "labs", i),
      title,
      description: "Results reviewed",
      details: `${title} — values trended for ${patient.name} (${patient.mrn}). Related to ${dx} monitoring and ${med0} safety.`,
      severity: mix(patient, 1200 + i) % 5 === 0 ? "Severe" : undefined,
    });
  }

  const documentation: DiscoveryTimelineEvent[] = [];
  for (let i = 0; i < nDoc; i++) {
    const title = pick(patient, `doc-t-${i}`, docTitles);
    documentation.push({
      id: `${patient.id}-doc-${i}`,
      date: dateFor(patient, "documentation", i),
      title,
      description: "Filed in chart",
      details: `${title}: paperwork and education for ${fn} · ${patient.name}. Aligns with ${dx} pathway; insurance ${patient.insuranceProvider}.`,
    });
  }

  return {
    diagnosis,
    treatment,
    monitoring,
    sideEffects,
    labs,
    documentation,
  };
}
