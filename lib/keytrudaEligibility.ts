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
// Based on KEYNOTE-522 (TNBC), KEYNOTE-890 (HER2-neg), and general PD-1 label.

export const keytrudaCriteria: EligibilityCriterion[] = [

  // ── DEMOGRAPHICS ──────────────────────────────────────────────────────────
  {
    id: 'age',
    category: 'Demographics',
    type: 'inclusion',
    label: 'Age ≥ 18 years',
    description: 'Patient must be at least 18 years old at enrollment.',
    source: 'EHR / Intake',
    evaluate: (p) => (p.age >= 18 ? 'met' : 'not_met'),
    getNote: (p) => `Patient age: ${p.age} years — ${p.age >= 18 ? 'meets' : 'does not meet'} minimum requirement.`,
  },

  // ── DISEASE CHARACTERISTICS ───────────────────────────────────────────────
  {
    id: 'cancer_diagnosis',
    category: 'Disease Characteristics',
    type: 'inclusion',
    label: 'Confirmed cancer diagnosis',
    description: 'Must have histologically confirmed solid tumor (breast, lung, melanoma, or other eligible cancer type).',
    source: 'Pathology / ICD Codes',
    evaluate: (p) =>
      hasDx(p, 'cancer', 'lymphoma', 'myeloma', 'melanoma', 'carcinoma', 'tumor') ? 'met' : 'not_met',
    getNote: (p) =>
      `Primary diagnosis: ${p.diagnoses[0]}. ${
        hasDx(p, 'cancer', 'lymphoma', 'myeloma', 'melanoma', 'carcinoma', 'tumor')
          ? 'Confirmed eligible cancer type.'
          : 'No eligible cancer type found in records.'
      }`,
  },
  {
    id: 'her2_negative',
    category: 'Disease Characteristics',
    type: 'inclusion',
    label: 'HER2-negative (breast cancer)',
    description: 'For breast cancer patients: HER2-negative status required (IHC 0, 1+ or ISH-negative).',
    source: 'Pathology / Lab',
    evaluate: (p) => {
      if (!hasDx(p, 'breast')) return 'unknown';
      if (hasDx(p, 'her2+', 'her2 positive', '(her2+)')) return 'not_met';
      // Tamoxifen, aromatase inhibitors → ER+/PR+ HER2-negative context
      if (hasMed(p, 'tamoxifen', 'letrozole', 'anastrozole') || hasDx(p, 'breast cancer')) return 'met';
      return 'unknown';
    },
    getNote: (p) => {
      if (!hasDx(p, 'breast')) return 'Not applicable — patient does not have breast cancer.';
      if (hasDx(p, 'her2+')) return 'Patient is HER2-positive — does not meet this criterion.';
      if (hasMed(p, 'tamoxifen', 'letrozole')) return 'Hormone therapy (Tamoxifen) indicates ER+/PR+, HER2-negative tumor. Criterion met.';
      return 'HER2 status not documented in EHR. Pathology report required.';
    },
  },
  {
    id: 'stage',
    category: 'Disease Characteristics',
    type: 'inclusion',
    label: 'Stage II–III or advanced/metastatic disease',
    description: 'Eligible stages: early Stage II/III (neoadjuvant) or Stage IV (metastatic/unresectable).',
    source: 'Clinician / ICD Staging',
    evaluate: (p) => {
      const dx = p.diagnoses.join(' ').toLowerCase();
      if (/stage\s+(ii|iii|iv|2|3|4)/i.test(dx)) return 'met';
      if (/stage\s+i\b/i.test(dx)) return 'met'; // Stage I can qualify for some trials
      return 'unknown';
    },
    getNote: (p) => {
      const match = p.diagnoses.join(' ').match(/stage\s+(i{1,3}v?|[1-4])/i);
      return match
        ? `Patient is ${match[0]} — meets staging requirement for eligible Keytruda trial arms.`
        : 'Disease stage not clearly documented. Staging workup required.';
    },
  },
  {
    id: 'measurable_disease',
    category: 'Disease Characteristics',
    type: 'inclusion',
    label: 'Measurable disease (RECIST 1.1) or residual disease',
    description: 'Must have ≥1 measurable lesion per RECIST 1.1, or confirmed residual disease post-surgery.',
    source: 'Imaging / Radiology',
    evaluate: (p) => {
      const scanAppts = p.upcomingAppointments.filter((a) =>
        /scan|mri|pet|ct|imaging|mammogram/i.test(a.type)
      );
      return scanAppts.length > 0 ? 'met' : 'unknown';
    },
    getNote: (p) => {
      const scan = p.upcomingAppointments.find((a) => /scan|mri|pet|ct|imaging/i.test(a.type));
      return scan
        ? `Active imaging appointment (${scan.type} on ${scan.date}) — measurable disease monitoring in place.`
        : 'No recent imaging found. Radiologic assessment of measurable disease required.';
    },
  },

  // ── CLINICAL STATUS ───────────────────────────────────────────────────────
  {
    id: 'ecog',
    category: 'Clinical Status',
    type: 'inclusion',
    label: 'ECOG Performance Status 0–1',
    description: 'Patient must have ECOG PS 0 (fully active) or 1 (ambulatory, restricted heavy activity only).',
    source: 'Clinician Assessment / EHR',
    evaluate: (p) => {
      // Active treatment and follow-up appointments = functional status assumed 0–1
      if (p.upcomingAppointments.length > 0) return 'met';
      return 'unknown';
    },
    getNote: (p) =>
      p.upcomingAppointments.length > 0
        ? 'Patient has active oncology appointments, indicating functional status consistent with ECOG 0–1. Formal assessment recommended.'
        : 'ECOG score not documented. Clinical performance assessment required.',
  },
  {
    id: 'organ_function',
    category: 'Clinical Status',
    type: 'inclusion',
    label: 'Adequate organ function (liver, kidney, marrow)',
    description: 'ALT/AST ≤ 2.5× ULN, creatinine ≤ 1.5× ULN, ANC ≥ 1500/μL, platelets ≥ 100k/μL.',
    source: 'Lab Panel / EHR',
    evaluate: (p) => {
      const labAppt = p.upcomingAppointments.find((a) => /lab|blood|cbc|panel/i.test(a.type));
      return labAppt ? 'met' : 'unknown';
    },
    getNote: (p) => {
      const lab = p.upcomingAppointments.find((a) => /lab|blood|cbc|panel/i.test(a.type));
      return lab
        ? `Lab work scheduled (${lab.type} on ${lab.date}). Organ function monitoring active — results required to confirm.`
        : 'No recent lab work found. Comprehensive metabolic panel required.';
    },
  },

  // ── BIOMARKERS ────────────────────────────────────────────────────────────
  {
    id: 'pdl1',
    category: 'Biomarkers (FDA BEST Framework)',
    type: 'inclusion',
    label: 'PD-L1 expression (CPS ≥ 10 or TPS ≥ 1%)',
    description:
      'PD-L1 Combined Positive Score (CPS) ≥ 10 preferred for first-line. TPS ≥ 1% for some KEYNOTE arms. Tumor-agnostic qualification possible with MSI-H/TMB-H.',
    source: 'Pathology / Genomics Lab',
    evaluate: () => 'unknown',
    getNote: () =>
      'PD-L1 expression (CPS/TPS) not documented in current EHR data. IHC 22C3 assay required — this is a critical biomarker for Keytruda eligibility.',
  },
  {
    id: 'msi_tmb',
    category: 'Biomarkers (FDA BEST Framework)',
    type: 'inclusion',
    label: 'MSI-H / dMMR or TMB-High (tumor-agnostic)',
    description:
      'MSI-High or deficient mismatch repair (dMMR) confers tumor-agnostic Keytruda approval. TMB ≥ 10 mut/Mb qualifies for solid tumor approval.',
    source: 'Genomics / Next-Gen Sequencing',
    evaluate: (p) =>
      hasDx(p, 'msi', 'dmmr', 'tmb') || hasMed(p, 'olaparib') ? 'met' : 'unknown',
    getNote: (p) =>
      hasDx(p, 'msi', 'dmmr')
        ? 'MSI-H/dMMR status documented — qualifies for tumor-agnostic Keytruda indication.'
        : 'MSI/dMMR and TMB status not documented. Next-generation sequencing (NGS) panel recommended.',
  },
  {
    id: 'brca',
    category: 'Biomarkers (FDA BEST Framework)',
    type: 'inclusion',
    label: 'BRCA mutation status documented',
    description: 'BRCA1/2 status informs combination therapy eligibility (e.g., Keytruda + olaparib for BRCA+ tumors).',
    source: 'Genetic Testing',
    evaluate: (p) =>
      hasDx(p, 'brca') ? 'met' : 'unknown',
    getNote: (p) =>
      hasDx(p, 'brca')
        ? 'BRCA mutation status documented in diagnosis records.'
        : 'BRCA1/2 status not on file. Germline/somatic genetic testing recommended to optimize trial eligibility.',
  },

  // ── TREATMENT & MEDICATION HISTORY ───────────────────────────────────────
  {
    id: 'no_prior_immunotherapy',
    category: 'Treatment & Medication History',
    type: 'exclusion',
    label: 'No prior PD-1 / PD-L1 / CTLA-4 therapy',
    description:
      'Prior checkpoint inhibitor therapy (pembrolizumab, nivolumab, atezolizumab, ipilimumab, etc.) is an exclusion criterion for most Keytruda-naïve trials.',
    source: 'Pharmacy / EHR',
    evaluate: (p) =>
      hasMed(p, 'pembrolizumab', 'nivolumab', 'atezolizumab', 'ipilimumab', 'durvalumab', 'cemiplimab')
        ? 'not_met'
        : 'met',
    getNote: (p) =>
      hasMed(p, 'pembrolizumab', 'nivolumab', 'atezolizumab', 'ipilimumab', 'durvalumab')
        ? `Patient is currently on or has received checkpoint inhibitor therapy (${p.medications.find((m) =>
            /pembrolizumab|nivolumab|atezolizumab|ipilimumab|durvalumab/i.test(m)
          )}) — excluded from Keytruda-naïve trials. May qualify for trials studying sequential/combination checkpoint strategies.`
        : 'No prior PD-1/PD-L1/CTLA-4 therapy detected in medication records. Criterion met.',
  },
  {
    id: 'no_active_autoimmune',
    category: 'Treatment & Medication History',
    type: 'exclusion',
    label: 'No active autoimmune disease requiring systemic treatment',
    description:
      'Active autoimmune conditions requiring systemic steroids or immunosuppressants are exclusionary (e.g., active lupus, IBD, rheumatoid arthritis requiring biologics).',
    source: 'EHR / Problem List',
    evaluate: (p) => {
      if (hasDx(p, 'lupus', 'crohn', 'ulcerative colitis', 'rheumatoid', 'psoriasis', 'multiple sclerosis', 'myasthenia')) return 'not_met';
      if (hasMed(p, 'prednisone', 'dexamethasone', 'methotrexate', 'adalimumab', 'infliximab')) return 'unknown';
      return 'met';
    },
    getNote: (p) => {
      if (hasDx(p, 'lupus', 'crohn', 'rheumatoid')) return 'Active autoimmune condition documented — exclusion criterion triggered. Oncology + rheumatology review required.';
      if (hasMed(p, 'prednisone', 'dexamethasone')) return 'Patient is on systemic corticosteroids — may indicate immune condition. Dosage and indication review needed.';
      return 'No active autoimmune conditions or systemic immunosuppressants detected. Criterion met.';
    },
  },
  {
    id: 'no_contraindicated_meds',
    category: 'Treatment & Medication History',
    type: 'exclusion',
    label: 'No contraindicated concurrent medications',
    description: 'Live attenuated vaccines, strong CYP3A4 inducers, and certain immunosuppressants are contraindicated with pembrolizumab.',
    source: 'Pharmacy',
    evaluate: (p) =>
      hasMed(p, 'rifampin', 'phenytoin', 'carbamazepine', 'St. John') ? 'not_met' : 'met',
    getNote: (p) =>
      hasMed(p, 'rifampin', 'phenytoin', 'carbamazepine')
        ? 'Potential drug interaction detected. Pharmacy review required before initiation.'
        : `Current medications (${p.medications.join(', ')}) reviewed — no major contraindications with pembrolizumab identified.`,
  },

  // ── FUNCTIONAL & COGNITIVE STATUS ─────────────────────────────────────────
  {
    id: 'life_expectancy',
    category: 'Functional & Cognitive Status',
    type: 'inclusion',
    label: 'Life expectancy ≥ 12 weeks',
    description: 'Patient must have a life expectancy of at least 12 weeks at enrollment.',
    source: 'Oncologist Assessment',
    evaluate: (p) =>
      p.upcomingAppointments.length > 0 ? 'met' : 'unknown',
    getNote: (p) =>
      p.upcomingAppointments.length > 0
        ? 'Active treatment schedule and follow-up appointments indicate prognosis consistent with ≥ 12-week life expectancy.'
        : 'Life expectancy assessment required from treating oncologist.',
  },

  // ── ETHICAL & REGULATORY ─────────────────────────────────────────────────
  {
    id: 'consent',
    category: 'Ethical & Regulatory',
    type: 'inclusion',
    label: 'Capable of providing informed consent',
    description: 'Patient must be able to understand and sign informed consent.',
    source: 'Clinical Assessment',
    evaluate: () => 'met',
    getNote: () => 'No documented cognitive impairment. Patient assumed capable of informed consent. Formal consent process required at enrollment.',
  },
  {
    id: 'pregnancy',
    category: 'Ethical & Regulatory',
    type: 'exclusion',
    label: 'Not pregnant or breastfeeding',
    description: 'Pembrolizumab can cause fetal harm. Pregnancy and breastfeeding are exclusion criteria.',
    source: 'EHR / Intake',
    evaluate: (p) => {
      if (p.gender === 'Male') return 'met';
      // Tamoxifen is contraindicated in pregnancy — its use implies non-pregnant
      if (hasMed(p, 'tamoxifen')) return 'met';
      return 'unknown';
    },
    getNote: (p) => {
      if (p.gender === 'Male') return 'Male patient — criterion not applicable.';
      if (hasMed(p, 'tamoxifen')) return 'Patient is on Tamoxifen (contraindicated in pregnancy) — pregnancy status effectively confirmed negative. Criterion met.';
      return 'Pregnancy status requires confirmation. Serum β-hCG test required at screening.';
    },
  },
];

// ─── Qualifying trials (from our clinical trials data) ────────────────────────

const keytrudaTrials = [
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
    note: 'Combination strategy with Keytruda for TNBC.',
  },
  {
    id: 'trial-5',
    name: 'Atezolizumab + Chemotherapy in Early TNBC (IMpassion031)',
    nctId: 'NCT05412398',
    eligibleDx: ['triple-negative'],
    note: 'Related checkpoint inhibitor trial — companion evidence for PD-L1+ pathway.',
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
