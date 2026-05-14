/**
 * Clinical keywords extracted from Keytruda (Pembrolizumab) FDA Label
 * BLA 125514 — accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=125514
 * Latest supplement: SUPPL-188 (11/21/2025)
 *
 * Each keyword maps to one or more medicalData node IDs so clicking a
 * keyword highlights the related nodes on the Keywords canvas.
 */

export interface FdaKeyword {
  id: string;
  label: string;
  category: 'Mechanism' | 'Biomarker' | 'Indication' | 'Clinical Status' | 'Adverse Events' | 'Dosing';
  description: string;
  color: 'blue' | 'violet' | 'purple' | 'emerald' | 'amber' | 'cyan' | 'rose' | 'indigo';
  /** medicalData node IDs that this keyword relates to */
  relatedNodeIds: string[];
}

export const keytrudaFdaKeywords: FdaKeyword[] = [

  // ── Mechanism ──────────────────────────────────────────────────────────────

  {
    id: 'pd1-blockade',
    label: 'PD-1 Blockade',
    category: 'Mechanism',
    description:
      'Pembrolizumab blocks the Programmed Death receptor-1 (PD-1) pathway, ' +
      'releasing T-cell-mediated immune inhibition and restoring anti-tumor immunity. ' +
      'BLA 125514 — FDA approved mechanism.',
    color: 'indigo',
    relatedNodeIds: ['treat-6', 'biom-4', 'sub-1'],
  },
  {
    id: 'checkpoint-inhibitor',
    label: 'Checkpoint Inhibitor',
    category: 'Mechanism',
    description:
      'Immune checkpoint inhibitors block inhibitory pathways (PD-1/PD-L1) that normally ' +
      'suppress T-cell activation. Pembrolizumab (anti-PD-1 IgG4 monoclonal antibody, BLA 125514) ' +
      'is the prototype checkpoint inhibitor with broad tumor-agnostic approvals.',
    color: 'indigo',
    relatedNodeIds: ['treat-6', 'biom-4', 'biom-3'],
  },
  {
    id: 'monoclonal-antibody',
    label: 'Monoclonal Antibody (IgG4)',
    category: 'Mechanism',
    description:
      'Pembrolizumab is a humanized IgG4-kappa monoclonal antibody. Its unique constant region ' +
      'minimizes Fc-receptor binding and complement activation, reducing off-target immune effects.',
    color: 'blue',
    relatedNodeIds: ['treat-6'],
  },

  // ── Biomarkers ─────────────────────────────────────────────────────────────

  {
    id: 'pdl1-expression',
    label: 'PD-L1 Expression',
    category: 'Biomarker',
    description:
      'Measured by IHC 22C3 pharmDx assay (FDA-approved companion diagnostic). ' +
      'Required for several Keytruda indications: NSCLC (TPS ≥1%), HNSCC (CPS ≥1), ' +
      'cervical cancer (CPS ≥1), gastric/GEJ (CPS ≥1 or ≥10). ' +
      'Tumor-agnostic qualifier alongside MSI-H and TMB-H. (BLA 125514)',
    color: 'violet',
    relatedNodeIds: ['biom-4', 'sub-3', 'mon-1'],
  },
  {
    id: 'tps-cps',
    label: 'TPS / CPS Scoring',
    category: 'Biomarker',
    description:
      'Tumor Proportion Score (TPS): % of viable tumor cells with PD-L1 membrane staining ' +
      '(used for NSCLC). Combined Positive Score (CPS): # PD-L1-staining cells / total viable ' +
      'tumor cells × 100 (used for HNSCC, gastric, cervical, esophageal). ' +
      'Measured by IHC 22C3 assay. (BLA 125514)',
    color: 'violet',
    relatedNodeIds: ['biom-4', 'mon-1', 'pd-4'],
  },
  {
    id: 'msi-h-dmmr',
    label: 'MSI-H / dMMR',
    category: 'Biomarker',
    description:
      'Microsatellite Instability-High (MSI-H) or Deficient Mismatch Repair (dMMR) — ' +
      'tumor-agnostic FDA approval (any solid tumor after prior therapy failure). ' +
      'High mutational load generates neoantigens that enhance pembrolizumab response. ' +
      'Tested by PCR (MSI) or IHC (MMR proteins). (BLA 125514)',
    color: 'violet',
    relatedNodeIds: ['sub-3', 'biom-2', 'mon-3', 'biom-4'],
  },
  {
    id: 'tmb-high',
    label: 'TMB-High (≥10 mut/Mb)',
    category: 'Biomarker',
    description:
      'Tumor Mutational Burden ≥10 mutations per megabase — tumor-agnostic FDA approval ' +
      'for unresectable or metastatic solid tumors after prior therapy. ' +
      'Measured by Foundation Medicine FoundationOneCDx companion diagnostic. (BLA 125514)',
    color: 'violet',
    relatedNodeIds: ['sub-3', 'biom-3', 'mon-3'],
  },
  {
    id: 'brca-status',
    label: 'BRCA Mutation Status',
    category: 'Biomarker',
    description:
      'BRCA1/2 mutations create homologous recombination deficiency, often co-occurring ' +
      'with high mutational burden. Relevant to combination strategies: ' +
      'pembrolizumab + olaparib (PARP inhibitor). Germline or somatic testing required.',
    color: 'purple',
    relatedNodeIds: ['sub-3', 'biom-2', 'pd-2'],
  },
  {
    id: 'her2-status',
    label: 'HER2 Status',
    category: 'Biomarker',
    description:
      'HER2-negative status (IHC 0 or 1+, or ISH-negative) is required for breast cancer ' +
      'Keytruda indications (KEYNOTE-522: TNBC). HER2-positive gastric/GEJ cancer has ' +
      'separate Keytruda approval with trastuzumab + chemotherapy. (BLA 125514)',
    color: 'purple',
    relatedNodeIds: ['biom-1', 'biom-3', 'sub-1'],
  },

  // ── Indications ────────────────────────────────────────────────────────────

  {
    id: 'nsclc',
    label: 'NSCLC',
    category: 'Indication',
    description:
      'Non-Small Cell Lung Cancer — Keytruda has 6+ approved NSCLC indications: ' +
      '1L monotherapy (TPS ≥50%), 1L + chemo, neoadjuvant/adjuvant, and ' +
      'progression after platinum chemotherapy (TPS ≥1%). ' +
      'EGFR/ALK aberrations must be absent for 1L use. (BLA 125514)',
    color: 'emerald',
    relatedNodeIds: ['sub-1', 'sub-2', 'sub-7', 'biom-4'],
  },
  {
    id: 'melanoma',
    label: 'Melanoma',
    category: 'Indication',
    description:
      'Keytruda original approval (9/4/2014) was for unresectable or metastatic melanoma. ' +
      'Now includes adjuvant treatment for Stage IIB, IIC, or III melanoma after resection. ' +
      'No PD-L1 biomarker requirement for melanoma indications. (BLA 125514)',
    color: 'emerald',
    relatedNodeIds: ['sub-1', 'sub-7', 'sub-2'],
  },
  {
    id: 'tnbc',
    label: 'Triple-Negative Breast Cancer (TNBC)',
    category: 'Indication',
    description:
      'KEYNOTE-522: pembrolizumab + chemotherapy as neoadjuvant therapy, then ' +
      'adjuvant monotherapy for high-risk early-stage TNBC. ' +
      'Requires PD-L1 CPS ≥10 for metastatic setting (KEYNOTE-355). ' +
      'HR-negative, HER2-negative tumor confirmed required. (BLA 125514)',
    color: 'emerald',
    relatedNodeIds: ['sub-1', 'biom-1', 'biom-4', 'treat-1', 'treat-6'],
  },
  {
    id: 'colorectal-msi',
    label: 'MSI-H Colorectal Cancer',
    category: 'Indication',
    description:
      'KEYNOTE-177: pembrolizumab as 1L therapy for MSI-H/dMMR metastatic colorectal cancer. ' +
      'Significant PFS and OS benefit over standard chemotherapy. ' +
      'MSI-H testing by IHC (MLH1, MSH2, MSH6, PMS2) or PCR required. (BLA 125514)',
    color: 'emerald',
    relatedNodeIds: ['sub-1', 'sub-3', 'biom-4', 'mon-3'],
  },

  // ── Clinical Status ────────────────────────────────────────────────────────

  {
    id: 'ecog-ps',
    label: 'ECOG Performance Status (0–1)',
    category: 'Clinical Status',
    description:
      'Eastern Cooperative Oncology Group Performance Status of 0 (fully active) or 1 ' +
      '(ambulatory, capable of light work) required for most Keytruda trials. ' +
      'ECOG PS 2 patients may qualify for specific indications per protocol. (BLA 125514 / NCT01295827)',
    color: 'amber',
    relatedNodeIds: ['pd-1', 'mon-4', 'sub-8'],
  },
  {
    id: 'organ-function',
    label: 'Adequate Organ Function',
    category: 'Clinical Status',
    description:
      'Required thresholds: ALT/AST ≤ 2.5× ULN, total bilirubin ≤ 1.5× ULN, ' +
      'serum creatinine ≤ 1.5× ULN, ANC ≥ 1500 cells/μL, platelets ≥ 100,000/μL, ' +
      'hemoglobin ≥ 9 g/dL. Must be confirmed at screening. (BLA 125514 / NCT01295827)',
    color: 'amber',
    relatedNodeIds: ['pd-4', 'mon-1', 'spec-8'],
  },
  {
    id: 'washout-period',
    label: '4-Week Washout Period',
    category: 'Clinical Status',
    description:
      'Per NCT01295827 Exclusion #1: no chemotherapy, radioactive, or biological cancer ' +
      'therapy within 4 weeks prior to first pembrolizumab dose. ' +
      'Patient must have recovered to CTCAE Grade ≤1 from prior treatment adverse events.',
    color: 'amber',
    relatedNodeIds: ['treat-1', 'treat-3', 'sub-4', 'pd-3'],
  },
  {
    id: 'prior-therapy-failure',
    label: 'Prior Therapy Failure',
    category: 'Clinical Status',
    description:
      'Per NCT01295827 Inclusion #2: failure of or intolerance to established standard ' +
      'anti-cancer therapies for the given tumor type. Required before pembrolizumab enrollment. ' +
      'Includes progression on 1L platinum-based chemotherapy for many indications.',
    color: 'amber',
    relatedNodeIds: ['sub-4', 'pd-3', 'treat-1'],
  },

  // ── Adverse Events ─────────────────────────────────────────────────────────

  {
    id: 'iraes',
    label: 'Immune-Related Adverse Events (irAEs)',
    category: 'Adverse Events',
    description:
      'Pembrolizumab immune-mediated reactions include: pneumonitis, colitis, hepatitis, ' +
      'endocrinopathies (thyroid, pituitary, adrenal), nephritis, severe skin reactions, ' +
      'myocarditis, and uveitis. Most require high-dose corticosteroids; Grade 3–4 may ' +
      'require permanent discontinuation. (BLA 125514)',
    color: 'rose',
    relatedNodeIds: ['pd-5', 'treat-6', 'mon-1', 'mon-4'],
  },
  {
    id: 'autoimmune-exclusion',
    label: 'Active Autoimmune Disease (Exclusion)',
    category: 'Adverse Events',
    description:
      'Active autoimmune disease or history of autoimmune disease requiring systemic ' +
      'steroids or immunosuppression is an exclusion criterion. Exceptions: vitiligo, ' +
      'resolved childhood asthma/atopy. Per NCT01295827 Exclusion criterion. ' +
      'Baseline autoimmune evaluation required.',
    color: 'rose',
    relatedNodeIds: ['pd-5', 'spec-3', 'treat-6'],
  },
];

/** Quick lookup: keyword ID → Set of related node IDs */
export const keywordNodeMap: Map<string, Set<string>> = new Map(
  keytrudaFdaKeywords.map((kw) => [kw.id, new Set(kw.relatedNodeIds)])
);

/** All unique node IDs referenced by FDA keywords (union) */
export const ALL_FDA_KEYWORD_NODE_IDS: Set<string> = new Set(
  keytrudaFdaKeywords.flatMap((kw) => kw.relatedNodeIds)
);
