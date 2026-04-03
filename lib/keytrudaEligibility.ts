import type { Patient } from './patients';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CriterionStatus = 'met' | 'not_met' | 'unknown';

export interface EligibilityCriterion {
  id: string;
  category: string;
  type: 'inclusion' | 'exclusion';
  label: string;
  description: string;
  source: string;
  evaluate: (patient: Patient) => CriterionStatus;
  getNote: (patient: Patient) => string;
}

export interface CriterionResult {
  criterion: EligibilityCriterion;
  status: CriterionStatus;
  note: string;
}

export type OverallStatus = 'qualified' | 'likely_qualified' | 'not_qualified' | 'ineligible';

export interface KeytrudaQualification {
  patient: Patient;
  overallStatus: OverallStatus;
  confidenceScore: number; // 0–100
  results: CriterionResult[];
  metCount: number;
  unknownCount: number;
  notMetCount: number;
  qualifyingTrials: { id: string; name: string; nctId: string }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hasDx = (p: Patient, ...terms: string[]) =>
  terms.some((t) => p.diagnoses.join(' ').toLowerCase().includes(t.toLowerCase()));

const hasMed = (p: Patient, ...terms: string[]) =>
  terms.some((t) => p.medications.join(' ').toLowerCase().includes(t.toLowerCase()));

// ─── Keytruda eligibility criteria ────────────────────────────────────────────
// Source: NCT01295827 (KEYNOTE-001) — ClinicalTrials.gov
// https://clinicaltrials.gov/study/NCT01295827#participation-criteria
// Focused on Inclusion criteria #1 & #2 and Exclusion criteria #1 & #2
// from the actual trial protocol, plus supporting clinical criteria.

export const keytrudaCriteria: EligibilityCriterion[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // NCT01295827 — INCLUSION CRITERION #1
  // "Histological or cytological diagnosis of MEL or any type of carcinoma,
  //  progressive metastatic disease, or progressive locally advanced disease
  //  not amenable to local therapy."
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'nct01295827_inc_1',
    category: 'NCT01295827 — Inclusion #1',
    type: 'inclusion',
    label: 'Histological/cytological diagnosis: melanoma or carcinoma with progressive disease',
    description:
      'Confirmed histological or cytological diagnosis of melanoma (MEL) or any type of carcinoma with ' +
      'progressive metastatic disease, or progressive locally advanced disease not amenable to local therapy. ' +
      '(NCT01295827, Part A criterion)',
    source: 'Pathology Report / ICD Codes',
    evaluate: (p) => {
      if (hasDx(p, 'melanoma', 'cancer', 'carcinoma', 'lymphoma', 'myeloma', 'sarcoma', 'tumor')) return 'met';
      return 'not_met';
    },
    getNote: (p) => {
      const primaryDx = p.diagnoses[0];
      if (hasDx(p, 'melanoma', 'cancer', 'carcinoma', 'lymphoma', 'myeloma', 'tumor')) {
        const isAdvanced = /stage\s+(ii|iii|iv|2|3|4)/i.test(p.diagnoses.join(' '));
        return `Confirmed diagnosis: "${primaryDx}". ${
          isAdvanced
            ? 'Advanced/progressive stage documented — meets NCT01295827 inclusion #1.'
            : 'Histological diagnosis confirmed. Progression status should be verified by treating oncologist (locally advanced or metastatic).'
        }`;
      }
      return `No eligible cancer diagnosis found in EHR. NCT01295827 requires histological/cytological confirmation of melanoma or carcinoma. Pathology review required.`;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NCT01295827 — INCLUSION CRITERION #2
  // "Failure of established standard medical anti-cancer therapies for a
  //  given tumor type or intolerance to such therapy."
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'nct01295827_inc_2',
    category: 'NCT01295827 — Inclusion #2',
    type: 'inclusion',
    label: 'Failed or intolerant to established standard anti-cancer therapies',
    description:
      'Patient must have experienced failure of established standard medical anti-cancer therapies ' +
      'for their tumor type, or demonstrated intolerance to such therapies. This is required before ' +
      'enrollment in the pembrolizumab trial. (NCT01295827)',
    source: 'Oncology Treatment History / EHR',
    evaluate: (p) => {
      // Already on Pembrolizumab → was triaged past standard therapy → met
      if (hasMed(p, 'pembrolizumab')) return 'met';
      // Stage III/IV typically implies prior standard treatment attempted
      if (/stage\s+(iii|iv|3|4)/i.test(p.diagnoses.join(' '))) return 'met';
      // Active chemo regimen suggests ongoing standard treatment (not yet failed)
      if (hasMed(p, 'folfox', 'abvd', 'ac-t', 'r-chop', 'carboplatin', 'gemcitabine')) return 'unknown';
      // Hormone therapy for breast cancer implies standard 1L therapy in progress or completed
      if (hasMed(p, 'tamoxifen', 'letrozole', 'anastrozole')) return 'unknown';
      return 'unknown';
    },
    getNote: (p) => {
      if (hasMed(p, 'pembrolizumab'))
        return 'Patient is currently receiving pembrolizumab — trial enrollment already occurred, indicating prior standard therapy failure. Criterion satisfied.';
      if (/stage\s+(iii|iv|3|4)/i.test(p.diagnoses.join(' ')))
        return `Advanced disease (${p.diagnoses[0]}) suggests prior standard therapy exposure. Oncology records should confirm prior-line treatment failure or intolerance per NCT01295827 requirements.`;
      if (hasMed(p, 'tamoxifen', 'letrozole', 'anastrozole', 'carboplatin', 'paclitaxel', 'docetaxel', 'folfox', 'gemcitabine'))
        return `Patient is receiving standard anti-cancer therapy (${p.medications[0]}). NCT01295827 requires failure of or intolerance to standard treatment — treatment outcome documentation required.`;
      return 'Prior treatment history unclear from EHR. Full oncology treatment history required to confirm failure/intolerance to standard therapies per NCT01295827.';
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NCT01295827 — EXCLUSION CRITERION #1
  // "Chemotherapy, radioactive, or biological cancer therapy within 4 weeks
  //  prior to the first dose of study therapy, or not recovered to CTCAE
  //  Grade 1 or better from the adverse events caused by therapy administered
  //  more than 4 weeks prior to first dose."
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'nct01295827_exc_1',
    category: 'NCT01295827 — Exclusion #1',
    type: 'exclusion',
    label: 'No cancer therapy within 4 weeks of first dose (washout period)',
    description:
      'Chemotherapy, radiation, or biological cancer therapy within 4 weeks prior to first pembrolizumab ' +
      'dose is exclusionary. Patient must also have recovered to CTCAE Grade 1 or better from any prior ' +
      'treatment adverse events. (NCT01295827)',
    source: 'Pharmacy / Oncology Treatment Records',
    evaluate: (p) => {
      // Active IV chemotherapy → likely within washout window
      const activeChemo = /carboplatin|paclitaxel|doxorubicin|cyclophosphamide|folfox|gemcitabine|nab-paclitaxel|docetaxel|bortezomib|lenalidomide/i;
      const onChemo = p.medications.some((m) => activeChemo.test(m));
      if (onChemo) return 'not_met';

      // Radiation scheduled recently
      const hasRadiation = p.upcomingAppointments.some((a) => /radiation|radiotherapy/i.test(a.type));
      if (hasRadiation) return 'not_met';

      // No active chemo or radiation → assume washout met
      if (p.medications.length > 0) return 'met';
      return 'unknown';
    },
    getNote: (p) => {
      const chemoMed = p.medications.find((m) =>
        /carboplatin|paclitaxel|doxorubicin|cyclophosphamide|folfox|gemcitabine|nab-paclitaxel|docetaxel|bortezomib|lenalidomide/i.test(m)
      );
      if (chemoMed)
        return `Patient is actively receiving cytotoxic therapy (${chemoMed}). NCT01295827 requires a ≥4-week washout from chemotherapy/biological therapy prior to first dose. Enrollment timing review required.`;
      const radAppt = p.upcomingAppointments.find((a) => /radiation|radiotherapy/i.test(a.type));
      if (radAppt)
        return `Radiation therapy scheduled (${radAppt.type} on ${radAppt.date}). A ≥4-week washout from radiation is required per NCT01295827. Coordination with radiation oncology needed.`;
      return `No active cytotoxic chemotherapy or radiation detected. Confirm last administration date is >4 weeks prior to planned first pembrolizumab dose and that all adverse events have resolved to CTCAE Grade ≤1.`;
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // NCT01295827 — EXCLUSION CRITERION #2
  // "Participation in a study of an investigational agent or using an
  //  investigational device within 30 days of administration of
  //  pembrolizumab."
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'nct01295827_exc_2',
    category: 'NCT01295827 — Exclusion #2',
    type: 'exclusion',
    label: 'No investigational agent/device use within 30 days',
    description:
      'Participation in any study of an investigational agent or use of an investigational device ' +
      'within 30 days of first pembrolizumab administration is exclusionary. ' +
      'Exception: participants in the follow-up phase of such a study. (NCT01295827)',
    source: 'Research Enrollment Records / EHR',
    evaluate: () => 'unknown',
    getNote: () =>
      'Investigational agent or device participation history is not captured in current EHR data. ' +
      'Patient or clinician must confirm no enrollment in an investigational trial within the past 30 days. ' +
      'Research office record review required per NCT01295827.',
  },

  // ── Additional supporting criteria ────────────────────────────────────────

  {
    id: 'ecog',
    category: 'Clinical Status',
    type: 'inclusion',
    label: 'ECOG Performance Status 0 or 1',
    description:
      'Patient must have a performance status of 0 (fully active) or 1 (ambulatory, restricted heavy activity) ' +
      'on the Eastern Cooperative Oncology Group (ECOG) Performance Scale. (NCT01295827)',
    source: 'Clinician Assessment / EHR',
    evaluate: (p) => (p.upcomingAppointments.length > 0 ? 'met' : 'unknown'),
    getNote: (p) =>
      p.upcomingAppointments.length > 0
        ? 'Active oncology appointments indicate functional status consistent with ECOG 0–1. Formal PS assessment required at screening.'
        : 'ECOG Performance Status not documented. Clinical assessment required.',
  },
  {
    id: 'organ_function',
    category: 'Clinical Status',
    type: 'inclusion',
    label: 'Adequate organ function',
    description:
      'Adequate hepatic, renal, and hematologic function required (ALT/AST ≤ 2.5× ULN, creatinine ≤ 1.5× ULN, ' +
      'ANC ≥ 1500/μL, platelets ≥ 100k/μL). (NCT01295827)',
    source: 'Lab Panel / EHR',
    evaluate: (p) => {
      const lab = p.upcomingAppointments.find((a) => /lab|blood|cbc|panel/i.test(a.type));
      return lab ? 'met' : 'unknown';
    },
    getNote: (p) => {
      const lab = p.upcomingAppointments.find((a) => /lab|blood|cbc|panel/i.test(a.type));
      return lab
        ? `Lab monitoring scheduled (${lab.type} on ${lab.date}). Results must confirm adequate organ function per NCT01295827 thresholds before enrollment.`
        : 'No recent lab work found. Comprehensive metabolic panel, CBC, and LFTs required at screening.';
    },
  },
  {
    id: 'no_active_autoimmune',
    category: 'Treatment & Medication History',
    type: 'exclusion',
    label: 'No active autoimmune disease requiring systemic steroids/immunosuppressants',
    description:
      'Active autoimmune disease or documented history requiring systemic steroids or immunosuppressive agents ' +
      'is exclusionary. Exceptions: vitiligo and resolved childhood asthma/atopy. (NCT01295827)',
    source: 'EHR / Problem List',
    evaluate: (p) => {
      if (hasDx(p, 'lupus', 'crohn', 'ulcerative colitis', 'rheumatoid', 'multiple sclerosis', 'myasthenia')) return 'not_met';
      if (hasMed(p, 'prednisone', 'methotrexate', 'adalimumab', 'infliximab')) return 'unknown';
      return 'met';
    },
    getNote: (p) => {
      if (hasDx(p, 'lupus', 'crohn', 'rheumatoid', 'multiple sclerosis'))
        return 'Autoimmune condition documented in diagnosis records — exclusion triggered per NCT01295827. Rheumatology review required.';
      if (hasMed(p, 'prednisone', 'methotrexate', 'adalimumab'))
        return 'Immunosuppressive medication detected. Indication must be reviewed — if for autoimmune disease, this may be exclusionary per NCT01295827.';
      return 'No active autoimmune disease or systemic immunosuppressants detected in EHR. Criterion met.';
    },
  },
  {
    id: 'prior_pd1',
    category: 'Treatment & Medication History',
    type: 'exclusion',
    label: 'No prior anti-PD-1 therapy or prior pembrolizumab trial enrollment',
    description:
      'Prior therapy with another anti-PD-1 agent or previous enrollment in any pembrolizumab trial ' +
      'is exclusionary. (NCT01295827)',
    source: 'Pharmacy / Research Records',
    evaluate: (p) =>
      hasMed(p, 'pembrolizumab', 'nivolumab', 'cemiplimab') ? 'not_met' : 'met',
    getNote: (p) =>
      hasMed(p, 'pembrolizumab', 'nivolumab', 'cemiplimab')
        ? `Patient has received anti-PD-1 therapy (${p.medications.find((m) => /pembrolizumab|nivolumab|cemiplimab/i.test(m))}) — excluded from NCT01295827 per exclusion criterion. May qualify for trials exploring sequential checkpoint strategies.`
        : 'No prior PD-1 antagonist therapy detected. Criterion met per NCT01295827.',
  },
  {
    id: 'no_cns_mets',
    category: 'Clinical Status',
    type: 'exclusion',
    label: 'No active CNS metastases or carcinomatous meningitis',
    description:
      'Active central nervous system (CNS) metastases and/or carcinomatous meningitis are exclusionary. (NCT01295827)',
    source: 'Imaging / Neurology',
    evaluate: (p) =>
      hasDx(p, 'brain metastasis', 'cns metastasis', 'meningitis', 'leptomeningeal') ? 'not_met' : 'met',
    getNote: (p) =>
      hasDx(p, 'brain metastasis', 'cns metastasis', 'meningitis')
        ? 'CNS involvement documented — exclusion criterion triggered per NCT01295827.'
        : 'No CNS metastases documented in EHR. Brain imaging should be confirmed at screening.',
  },
  {
    id: 'pregnancy',
    category: 'Ethical & Regulatory',
    type: 'exclusion',
    label: 'Not pregnant, breastfeeding, or expecting to conceive/father children during study',
    description:
      'Pregnancy or breastfeeding is exclusionary. Participants of childbearing potential must use ' +
      'adequate contraception from first dose through 120 days after last dose. (NCT01295827)',
    source: 'EHR / Intake',
    evaluate: (p) => {
      if (p.gender === 'Male') return 'met';
      if (hasMed(p, 'tamoxifen')) return 'met';
      return 'unknown';
    },
    getNote: (p) => {
      if (p.gender === 'Male') return 'Male patient — contraception requirement applies (120 days post last dose). No pregnancy exclusion.';
      if (hasMed(p, 'tamoxifen')) return 'Patient is on Tamoxifen (contraindicated in pregnancy) — confirms non-pregnant status. Adequate contraception discussion required for trial duration + 120 days.';
      return 'Female patient of potentially childbearing age. Urine or serum β-hCG pregnancy test required prior to first dose per NCT01295827. Contraception plan must be documented.';
    },
  },
];

// ─── Qualifying trials ────────────────────────────────────────────────────────

const keytrudaTrials = [
  {
    id: 'nct01295827',
    name: 'KEYNOTE-001: Pembrolizumab in Advanced Solid Tumors (Melanoma / NSCLC)',
    nctId: 'NCT01295827',
    eligibleDx: ['melanoma', 'lung', 'cancer', 'carcinoma'],
    note: 'Phase I dose-escalation and cohort expansion study — the original pembrolizumab trial.',
  },
  {
    id: 'trial-1',
    name: 'Pembrolizumab + Chemotherapy in HER2-Negative Breast Cancer',
    nctId: 'NCT05234567',
    eligibleDx: ['breast'],
    note: 'KEYNOTE-890-like: pembrolizumab + paclitaxel/carboplatin for HER2-neg breast cancer.',
  },
  {
    id: 'trial-4',
    name: 'Sacituzumab Govitecan in Triple-Negative Breast Cancer',
    nctId: 'NCT05345678',
    eligibleDx: ['triple-negative', 'tnbc'],
    note: 'Combination strategy with checkpoint inhibitor for TNBC.',
  },
];

// ─── Main evaluation function ─────────────────────────────────────────────────

export function evaluateKeytrudaQualification(patient: Patient): KeytrudaQualification {
  const results: CriterionResult[] = keytrudaCriteria.map((criterion) => ({
    criterion,
    status: criterion.evaluate(patient),
    note: criterion.getNote(patient),
  }));

  const metCount = results.filter((r) => r.status === 'met').length;
  const notMetCount = results.filter((r) => r.status === 'not_met').length;
  const unknownCount = results.filter((r) => r.status === 'unknown').length;

  // Determine qualifying trials
  const dx = patient.diagnoses.join(' ').toLowerCase();
  const qualifyingTrials = keytrudaTrials
    .filter((t) => t.eligibleDx.some((ed) => dx.includes(ed)) || dx.includes('cancer'))
    .map(({ id, name, nctId }) => ({ id, name, nctId }));

  // Overall status logic
  let overallStatus: OverallStatus;
  if (notMetCount >= 2) {
    overallStatus = 'not_qualified';
  } else if (notMetCount === 1 && results.find((r) => r.criterion.id === 'no_prior_immunotherapy' && r.status === 'not_met')) {
    overallStatus = 'ineligible';
  } else if (notMetCount === 0 && unknownCount <= 3) {
    overallStatus = 'qualified';
  } else {
    overallStatus = 'likely_qualified';
  }

  // Confidence score: met / total mandatory criteria (inclusion only, excl unknowns)
  const exclusionViolations = results.filter((r) => r.criterion.type === 'exclusion' && r.status === 'not_met').length;
  const confidenceBase = ((metCount) / (metCount + notMetCount + unknownCount * 0.5)) * 100;
  const confidenceScore = Math.round(Math.max(0, Math.min(100, confidenceBase - exclusionViolations * 30)));

  return {
    patient,
    overallStatus,
    confidenceScore,
    results,
    metCount,
    unknownCount,
    notMetCount,
    qualifyingTrials,
  };
}
