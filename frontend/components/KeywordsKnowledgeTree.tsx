import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Info, Sparkles, X, ArrowLeft, Mic, History, Paperclip, FileText, Send } from "lucide-react";

// Graph-based keyword structure (Neo4j-compatible)
interface Keyword {
  id: string;
  label: string;
  category: string;
  description: string;
  color: string;
  relatedKeywords?: string[]; // Graph relationships
  confidence?: number; // AI confidence score
}

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  keywords?: Keyword[];
  expanded?: boolean;
}

interface KeywordsKnowledgeTreeProps {
  keywords: Keyword[];
  onClose: () => void;
}

const getKeywordColor = (color: string) => {
  const colors = {
    purple: "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
    cyan: "bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200"
  };
  return colors[color as keyof typeof colors] || colors.blue;
};

// Comprehensive keyword graph database (Neo4j-style relationships)
const getAllKeywords = (baseKeywords: Keyword[]): Record<string, Keyword> => {
  const keywordMap: Record<string, Keyword> = {};
  
  baseKeywords.forEach(kw => {
    keywordMap[kw.id] = kw;
  });

  // Extended keyword graph with relationships
  const extendedKeywords: Keyword[] = [
    // Stage II Breast Cancer relationships
    {
      id: "kw-stage2-details",
      label: "T2N0M0 Staging",
      category: "Diagnosis",
      description: "Tumor size 2-5cm, no lymph node involvement, no distant metastasis.",
      color: "purple",
      confidence: 0.95,
      relatedKeywords: ["kw-1", "kw-tnm-staging-system", "kw-tumor-size-measurement"]
    },
    {
      id: "kw-tnm-staging-system",
      label: "TNM Staging System",
      category: "Diagnosis",
      description: "Standardized cancer staging: T (tumor), N (nodes), M (metastasis).",
      color: "purple",
      confidence: 0.98,
      relatedKeywords: ["kw-stage2-details", "kw-tumor-size-measurement", "kw-lymph-node-involvement"]
    },
    {
      id: "kw-tumor-size-measurement",
      label: "Tumor Size Measurement",
      category: "Diagnosis",
      description: "Precise measurement of primary tumor dimensions.",
      color: "purple",
      confidence: 0.92,
      relatedKeywords: ["kw-stage2-details", "kw-imaging-studies"]
    },
    {
      id: "kw-lymph-node-involvement",
      label: "Lymph Node Involvement",
      category: "Diagnosis",
      description: "Assessment of cancer spread to regional lymph nodes.",
      color: "purple",
      confidence: 0.94,
      relatedKeywords: ["kw-lymph-node-status", "kw-sentinel-node-biopsy"]
    },
    {
      id: "kw-staging-workup",
      label: "Staging Workup",
      category: "Diagnosis",
      description: "Comprehensive evaluation including imaging, pathology, and biomarker testing.",
      color: "purple",
      confidence: 0.96,
      relatedKeywords: ["kw-imaging-studies", "kw-pathology-review", "kw-biomarker-testing"]
    },
    {
      id: "kw-imaging-studies",
      label: "Imaging Studies",
      category: "Monitoring",
      description: "Diagnostic imaging including mammography, ultrasound, MRI, CT, and PET scans.",
      color: "emerald",
      confidence: 0.93,
      relatedKeywords: ["kw-pet-scan", "kw-mri-breast", "kw-ct-chest", "kw-mammography"]
    },
    {
      id: "kw-mammography",
      label: "Mammography",
      category: "Monitoring",
      description: "X-ray imaging of breast tissue for screening and diagnosis.",
      color: "emerald",
      confidence: 0.91,
      relatedKeywords: ["kw-imaging-studies", "kw-breast-ultrasound"]
    },
    {
      id: "kw-breast-ultrasound",
      label: "Breast Ultrasound",
      category: "Monitoring",
      description: "Sound wave imaging to evaluate breast masses and guide biopsies.",
      color: "emerald",
      confidence: 0.90,
      relatedKeywords: ["kw-imaging-studies", "kw-mammography"]
    },
    {
      id: "kw-pathology-review",
      label: "Pathology Review",
      category: "Diagnosis",
      description: "Microscopic examination of tumor tissue for histologic type and grade.",
      color: "purple",
      confidence: 0.97,
      relatedKeywords: ["kw-biopsy-procedure", "kw-histologic-grade", "kw-ihc-testing"]
    },
    {
      id: "kw-biopsy-procedure",
      label: "Core Needle Biopsy",
      category: "Diagnosis",
      description: "Minimally invasive procedure to obtain tissue samples.",
      color: "purple",
      confidence: 0.92,
      relatedKeywords: ["kw-pathology-review", "kw-imaging-studies"]
    },
    {
      id: "kw-histologic-grade",
      label: "Histologic Grade",
      category: "Diagnosis",
      description: "Assessment of tumor differentiation and aggressiveness (Grade 1-3).",
      color: "purple",
      confidence: 0.94,
      relatedKeywords: ["kw-pathology-review", "kw-nottingham-grade"]
    },
    {
      id: "kw-nottingham-grade",
      label: "Nottingham Grade",
      category: "Diagnosis",
      description: "Scoring system combining tubule formation, nuclear pleomorphism, and mitotic count.",
      color: "purple",
      confidence: 0.93,
      relatedKeywords: ["kw-histologic-grade"]
    },

    // ER+/PR+ HER2- relationships
    {
      id: "kw-hormone-receptor-positive",
      label: "Hormone Receptor Positive",
      category: "Diagnosis",
      description: "Cancer cells express estrogen and/or progesterone receptors.",
      color: "purple",
      confidence: 0.96,
      relatedKeywords: ["kw-2", "kw-endocrine-therapy", "kw-receptor-percentage"]
    },
    {
      id: "kw-receptor-percentage",
      label: "Receptor Percentage",
      category: "Diagnosis",
      description: "Quantitative measurement of ER/PR expression (e.g., 85% ER+, 70% PR+).",
      color: "purple",
      confidence: 0.95,
      relatedKeywords: ["kw-2", "kw-hormone-receptor-positive", "kw-ihc-testing"]
    },
    {
      id: "kw-ihc-testing",
      label: "IHC Testing",
      category: "Diagnosis",
      description: "Immunohistochemistry testing for hormone receptor and HER2 status.",
      color: "purple",
      confidence: 0.97,
      relatedKeywords: ["kw-2", "kw-pathology-review", "kw-fish-testing"]
    },
    {
      id: "kw-fish-testing",
      label: "FISH Testing",
      category: "Diagnosis",
      description: "Fluorescence in situ hybridization to confirm HER2 amplification.",
      color: "purple",
      confidence: 0.96,
      relatedKeywords: ["kw-her2-negative", "kw-ihc-testing"]
    },
    {
      id: "kw-endocrine-therapy",
      label: "Endocrine Therapy",
      category: "Treatment",
      description: "Hormonal treatments blocking or reducing estrogen.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-hormone-receptor-positive", "kw-tamoxifen", "kw-aromatase-inhibitor"]
    },
    {
      id: "kw-tamoxifen",
      label: "Tamoxifen",
      category: "Treatment",
      description: "Selective estrogen receptor modulator for ER+ breast cancer.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-endocrine-therapy", "kw-endometrial-monitoring", "kw-tamoxifen-duration"]
    },
    {
      id: "kw-tamoxifen-duration",
      label: "Tamoxifen Duration",
      category: "Treatment",
      description: "Standard 5-10 year treatment course for adjuvant therapy.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-tamoxifen", "kw-extended-therapy"]
    },
    {
      id: "kw-extended-therapy",
      label: "Extended Therapy",
      category: "Treatment",
      description: "Continuing endocrine therapy beyond 5 years for high-risk patients.",
      color: "blue",
      confidence: 0.91,
      relatedKeywords: ["kw-tamoxifen-duration"]
    },
    {
      id: "kw-aromatase-inhibitor",
      label: "Aromatase Inhibitor",
      category: "Treatment",
      description: "Medications blocking estrogen production in postmenopausal women.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-endocrine-therapy", "kw-letrozole", "kw-anastrozole", "kw-exemestane"]
    },
    {
      id: "kw-letrozole",
      label: "Letrozole",
      category: "Treatment",
      description: "Non-steroidal aromatase inhibitor (Femara).",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-aromatase-inhibitor"]
    },
    {
      id: "kw-anastrozole",
      label: "Anastrozole",
      category: "Treatment",
      description: "Non-steroidal aromatase inhibitor (Arimidex).",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-aromatase-inhibitor"]
    },
    {
      id: "kw-exemestane",
      label: "Exemestane",
      category: "Treatment",
      description: "Steroidal aromatase inhibitor (Aromasin).",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-aromatase-inhibitor"]
    },
    {
      id: "kw-fulvestrant",
      label: "Fulvestrant",
      category: "Treatment",
      description: "Estrogen receptor antagonist for advanced ER+ disease.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-endocrine-therapy", "kw-cdk46-inhibitor"]
    },
    {
      id: "kw-cdk46-inhibitor",
      label: "CDK4/6 Inhibitor",
      category: "Treatment",
      description: "Targeted therapy (palbociclib, ribociclib, abemaciclib) with endocrine therapy.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-fulvestrant", "kw-palbociclib", "kw-ribociclib", "kw-abemaciclib"]
    },
    {
      id: "kw-palbociclib",
      label: "Palbociclib",
      category: "Treatment",
      description: "CDK4/6 inhibitor (Ibrance) combined with letrozole or fulvestrant.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-cdk46-inhibitor"]
    },
    {
      id: "kw-ribociclib",
      label: "Ribociclib",
      category: "Treatment",
      description: "CDK4/6 inhibitor (Kisqali) with letrozole for advanced ER+ disease.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-cdk46-inhibitor"]
    },
    {
      id: "kw-abemaciclib",
      label: "Abemaciclib",
      category: "Treatment",
      description: "CDK4/6 inhibitor (Verzenio) with fulvestrant or as monotherapy.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-cdk46-inhibitor"]
    },
    {
      id: "kw-her2-negative",
      label: "HER2 Negative",
      category: "Diagnosis",
      description: "Cancer cells do not overexpress HER2 protein.",
      color: "purple",
      confidence: 0.97,
      relatedKeywords: ["kw-2", "kw-triple-negative-exclusion"]
    },
    {
      id: "kw-triple-negative-exclusion",
      label: "Triple Negative Exclusion",
      category: "Diagnosis",
      description: "Patient has ER+/PR+ status, excluding triple-negative subtype.",
      color: "purple",
      confidence: 0.95,
      relatedKeywords: ["kw-2", "kw-her2-negative"]
    },

    // AC-T Chemotherapy relationships
    {
      id: "kw-adriamycin",
      label: "Adriamycin (Doxorubicin)",
      category: "Treatment",
      description: "Anthracycline chemotherapy with cardiac toxicity risk.",
      color: "blue",
      confidence: 0.96,
      relatedKeywords: ["kw-3", "kw-cardiac-monitoring", "kw-anthracycline"]
    },
    {
      id: "kw-cyclophosphamide",
      label: "Cyclophosphamide",
      category: "Treatment",
      description: "Alkylating agent used in AC regimen.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-3", "kw-hemorrhagic-cystitis", "kw-hydration-requirements"]
    },
    {
      id: "kw-paclitaxel",
      label: "Paclitaxel (Taxol)",
      category: "Treatment",
      description: "Taxane chemotherapy causing peripheral neuropathy.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-3", "kw-6", "kw-taxane-class", "kw-docetaxel"]
    },
    {
      id: "kw-docetaxel",
      label: "Docetaxel",
      category: "Treatment",
      description: "Alternative taxane chemotherapy (Taxotere).",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-taxane-class", "kw-paclitaxel"]
    },
    {
      id: "kw-taxane-class",
      label: "Taxane Class",
      category: "Treatment",
      description: "Class of chemotherapy drugs disrupting microtubule function.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-paclitaxel", "kw-docetaxel", "kw-6"]
    },
    {
      id: "kw-anthracycline",
      label: "Anthracycline Class",
      category: "Treatment",
      description: "Class including doxorubicin and epirubicin with cardiac toxicity.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-adriamycin", "kw-epirubicin", "kw-cardiotoxicity"]
    },
    {
      id: "kw-epirubicin",
      label: "Epirubicin",
      category: "Treatment",
      description: "Alternative anthracycline with lower cardiotoxicity than doxorubicin.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-anthracycline"]
    },
    {
      id: "kw-neoadjuvant-chemotherapy",
      label: "Neoadjuvant Chemotherapy",
      category: "Treatment",
      description: "Chemotherapy given before surgery to shrink tumors.",
      color: "blue",
      confidence: 0.96,
      relatedKeywords: ["kw-3", "kw-pathologic-response", "kw-surgical-planning"]
    },
    {
      id: "kw-adjuvant-chemotherapy",
      label: "Adjuvant Chemotherapy",
      category: "Treatment",
      description: "Chemotherapy given after surgery to reduce recurrence risk.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-3", "kw-9"]
    },
    {
      id: "kw-chemotherapy-cycle",
      label: "Chemotherapy Cycle",
      category: "Treatment",
      description: "Standard treatment cycle duration, typically 2-3 weeks.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-3", "kw-dose-density", "kw-cycle-timing"]
    },
    {
      id: "kw-cycle-timing",
      label: "Cycle Timing",
      category: "Treatment",
      description: "Scheduling of chemotherapy cycles based on recovery and toxicity.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-chemotherapy-cycle", "kw-dose-delay"]
    },
    {
      id: "kw-dose-density",
      label: "Dose Density",
      category: "Treatment",
      description: "Administration at shorter intervals to improve efficacy.",
      color: "blue",
      confidence: 0.91,
      relatedKeywords: ["kw-3", "kw-chemotherapy-cycle"]
    },
    {
      id: "kw-port-a-cath",
      label: "Port-a-Cath",
      category: "Treatment",
      description: "Implanted venous access device for chemotherapy.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-3", "kw-venous-access", "kw-port-placement"]
    },
    {
      id: "kw-venous-access",
      label: "Venous Access",
      category: "Treatment",
      description: "Methods for administering chemotherapy including ports and PICC lines.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-port-a-cath", "kw-picc-line"]
    },
    {
      id: "kw-picc-line",
      label: "PICC Line",
      category: "Treatment",
      description: "Peripherally inserted central catheter for chemotherapy access.",
      color: "blue",
      confidence: 0.91,
      relatedKeywords: ["kw-venous-access"]
    },
    {
      id: "kw-port-placement",
      label: "Port Placement",
      category: "Treatment",
      description: "Surgical procedure to implant port-a-cath device.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-port-a-cath"]
    },
    {
      id: "kw-premedication-protocol",
      label: "Premedication Protocol",
      category: "Treatment",
      description: "Medications given before chemotherapy to prevent reactions.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-3", "kw-nausea-management", "kw-steroid-premed"]
    },
    {
      id: "kw-steroid-premed",
      label: "Steroid Premedication",
      category: "Treatment",
      description: "Dexamethasone given before taxane chemotherapy to prevent reactions.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-premedication-protocol", "kw-paclitaxel"]
    },
    {
      id: "kw-pathologic-response",
      label: "Pathologic Response",
      category: "Monitoring",
      description: "Assessment of tumor response based on surgical pathology.",
      color: "emerald",
      confidence: 0.95,
      relatedKeywords: ["kw-neoadjuvant-chemotherapy", "kw-8", "kw-residual-disease", "kw-pathologic-complete-response"]
    },
    {
      id: "kw-pathologic-complete-response",
      label: "Pathologic Complete Response",
      category: "Monitoring",
      description: "No residual cancer cells found in surgical specimen.",
      color: "emerald",
      confidence: 0.96,
      relatedKeywords: ["kw-complete-response", "kw-pathologic-response", "kw-9"]
    },
    {
      id: "kw-residual-disease",
      label: "Residual Disease",
      category: "Monitoring",
      description: "Presence of remaining cancer cells after neoadjuvant treatment.",
      color: "emerald",
      confidence: 0.94,
      relatedKeywords: ["kw-pathologic-response", "kw-rcb-score"]
    },
    {
      id: "kw-rcb-score",
      label: "RCB Score",
      category: "Monitoring",
      description: "Residual Cancer Burden scoring system (RCB 0-3) after neoadjuvant therapy.",
      color: "emerald",
      confidence: 0.93,
      relatedKeywords: ["kw-residual-disease", "kw-pathologic-response"]
    },
    {
      id: "kw-cardiac-monitoring",
      label: "Cardiac Monitoring",
      category: "Monitoring",
      description: "Regular assessment of heart function during anthracycline treatment.",
      color: "emerald",
      confidence: 0.95,
      relatedKeywords: ["kw-adriamycin", "kw-ejection-fraction", "kw-muga-scan", "kw-echocardiogram"]
    },
    {
      id: "kw-ejection-fraction",
      label: "Ejection Fraction",
      category: "Monitoring",
      description: "Measurement of heart's pumping efficiency.",
      color: "emerald",
      confidence: 0.94,
      relatedKeywords: ["kw-cardiac-monitoring", "kw-muga-scan", "kw-echocardiogram"]
    },
    {
      id: "kw-muga-scan",
      label: "MUGA Scan",
      category: "Monitoring",
      description: "Multigated acquisition scan to assess left ventricular ejection fraction.",
      color: "emerald",
      confidence: 0.93,
      relatedKeywords: ["kw-cardiac-monitoring", "kw-ejection-fraction"]
    },
    {
      id: "kw-echocardiogram",
      label: "Echocardiogram",
      category: "Monitoring",
      description: "Ultrasound of the heart to assess function and structure.",
      color: "emerald",
      confidence: 0.93,
      relatedKeywords: ["kw-cardiac-monitoring", "kw-ejection-fraction"]
    },
    {
      id: "kw-cardiotoxicity",
      label: "Cardiotoxicity",
      category: "Side Effect",
      description: "Heart damage from chemotherapy, particularly anthracyclines.",
      color: "amber",
      confidence: 0.94,
      relatedKeywords: ["kw-adriamycin", "kw-cardiac-monitoring", "kw-cardiac-protection"]
    },
    {
      id: "kw-cardiac-protection",
      label: "Cardiac Protection",
      category: "Treatment",
      description: "Strategies including dexrazoxane to reduce cardiotoxicity risk.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-cardiotoxicity", "kw-adriamycin", "kw-dexrazoxane"]
    },
    {
      id: "kw-dexrazoxane",
      label: "Dexrazoxane",
      category: "Treatment",
      description: "Cardioprotective agent used with anthracyclines.",
      color: "blue",
      confidence: 0.91,
      relatedKeywords: ["kw-cardiac-protection"]
    },

    // Pembrolizumab relationships
    {
      id: "kw-immunotherapy",
      label: "Immunotherapy",
      category: "Treatment",
      description: "Treatment enhancing immune system's ability to attack cancer.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-4", "kw-checkpoint-inhibitor", "kw-pd1-pdl1"]
    },
    {
      id: "kw-checkpoint-inhibitor",
      label: "Checkpoint Inhibitor",
      category: "Treatment",
      description: "Class blocking proteins preventing immune cells from attacking cancer.",
      color: "blue",
      confidence: 0.96,
      relatedKeywords: ["kw-4", "kw-immunotherapy", "kw-pembrolizumab", "kw-nivolumab", "kw-atezolizumab"]
    },
    {
      id: "kw-pembrolizumab",
      label: "Pembrolizumab (Keytruda)",
      category: "Treatment",
      description: "PD-1 checkpoint inhibitor for triple-negative and high-risk early-stage breast cancer.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-4", "kw-checkpoint-inhibitor", "kw-immunotherapy"]
    },
    {
      id: "kw-nivolumab",
      label: "Nivolumab",
      category: "Treatment",
      description: "Alternative PD-1 checkpoint inhibitor (Opdivo).",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-checkpoint-inhibitor", "kw-immunotherapy"]
    },
    {
      id: "kw-atezolizumab",
      label: "Atezolizumab",
      category: "Treatment",
      description: "PD-L1 checkpoint inhibitor (Tecentriq) for triple-negative breast cancer.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-checkpoint-inhibitor", "kw-immunotherapy"]
    },
    {
      id: "kw-pd1-pdl1",
      label: "PD-1/PD-L1 Pathway",
      category: "Diagnosis",
      description: "Immune checkpoint pathway targeted by immunotherapy.",
      color: "purple",
      confidence: 0.95,
      relatedKeywords: ["kw-immunotherapy", "kw-pd-l1-expression", "kw-biomarker-testing"]
    },
    {
      id: "kw-pd-l1-expression",
      label: "PD-L1 Expression",
      category: "Diagnosis",
      description: "Biomarker testing for PD-L1 protein expression.",
      color: "purple",
      confidence: 0.94,
      relatedKeywords: ["kw-4", "kw-pd1-pdl1", "kw-biomarker-testing", "kw-cps-score"]
    },
    {
      id: "kw-cps-score",
      label: "CPS Score",
      category: "Diagnosis",
      description: "Combined Positive Score for PD-L1 expression assessment.",
      color: "purple",
      confidence: 0.93,
      relatedKeywords: ["kw-pd-l1-expression"]
    },
    {
      id: "kw-biomarker-testing",
      label: "Biomarker Testing",
      category: "Diagnosis",
      description: "Molecular testing to identify predictive biomarkers.",
      color: "purple",
      confidence: 0.96,
      relatedKeywords: ["kw-pd1-pdl1", "kw-msi-status", "kw-tumor-mutational-burden", "kw-next-generation-sequencing"]
    },
    {
      id: "kw-next-generation-sequencing",
      label: "Next-Generation Sequencing",
      category: "Diagnosis",
      description: "Advanced genomic testing to identify mutations and biomarkers.",
      color: "purple",
      confidence: 0.94,
      relatedKeywords: ["kw-biomarker-testing"]
    },
    {
      id: "kw-msi-status",
      label: "MSI Status",
      category: "Diagnosis",
      description: "Microsatellite instability testing for immunotherapy eligibility.",
      color: "purple",
      confidence: 0.93,
      relatedKeywords: ["kw-biomarker-testing", "kw-immunotherapy"]
    },
    {
      id: "kw-tumor-mutational-burden",
      label: "Tumor Mutational Burden",
      category: "Diagnosis",
      description: "Measure of genetic mutations, higher TMB may predict immunotherapy response.",
      color: "purple",
      confidence: 0.92,
      relatedKeywords: ["kw-biomarker-testing", "kw-immunotherapy"]
    },
    {
      id: "kw-immune-related-ae",
      label: "Immune-Related Adverse Events",
      category: "Side Effect",
      description: "Side effects from immunotherapy including rash, colitis, pneumonitis.",
      color: "amber",
      confidence: 0.94,
      relatedKeywords: ["kw-4", "kw-immunotherapy", "kw-steroid-management", "kw-immune-colitis"]
    },
    {
      id: "kw-immune-colitis",
      label: "Immune Colitis",
      category: "Side Effect",
      description: "Inflammation of the colon from checkpoint inhibitors.",
      color: "amber",
      confidence: 0.93,
      relatedKeywords: ["kw-immune-related-ae"]
    },
    {
      id: "kw-steroid-management",
      label: "Steroid Management",
      category: "Treatment",
      description: "Use of corticosteroids to manage immune-related adverse events.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-immune-related-ae", "kw-immunotherapy"]
    },
    {
      id: "kw-clinical-trial",
      label: "Clinical Trial Participation",
      category: "Treatment",
      description: "Enrollment in research studies for novel treatments.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-4", "kw-research-protocol", "kw-trial-eligibility"]
    },
    {
      id: "kw-research-protocol",
      label: "Research Protocol",
      category: "Research",
      description: "Structured treatment plan within a clinical trial.",
      color: "emerald",
      confidence: 0.91,
      relatedKeywords: ["kw-clinical-trial"]
    },
    {
      id: "kw-trial-eligibility",
      label: "Trial Eligibility",
      category: "Research",
      description: "Criteria determining patient qualification for clinical trials.",
      color: "emerald",
      confidence: 0.92,
      relatedKeywords: ["kw-clinical-trial"]
    },

    // Neutropenia relationships
    {
      id: "kw-neutropenia-risk",
      label: "Neutropenia Risk",
      category: "Side Effect",
      description: "Increased risk of low neutrophil count leading to infection.",
      color: "amber",
      confidence: 0.95,
      relatedKeywords: ["kw-5", "kw-febrile-neutropenia", "kw-growth-factors"]
    },
    {
      id: "kw-febrile-neutropenia",
      label: "Febrile Neutropenia",
      category: "Side Effect",
      description: "Fever with low neutrophil count, a medical emergency.",
      color: "amber",
      confidence: 0.96,
      relatedKeywords: ["kw-5", "kw-neutropenia-risk", "kw-infection-prevention", "kw-empiric-antibiotics"]
    },
    {
      id: "kw-empiric-antibiotics",
      label: "Empiric Antibiotics",
      category: "Treatment",
      description: "Broad-spectrum antibiotics started immediately for febrile neutropenia.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-febrile-neutropenia"]
    },
    {
      id: "kw-growth-factors",
      label: "Growth Factors",
      category: "Treatment",
      description: "Medications stimulating white blood cell production.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-5", "kw-neutropenia-risk", "kw-pegfilgrastim", "kw-filgrastim"]
    },
    {
      id: "kw-pegfilgrastim",
      label: "Pegfilgrastim",
      category: "Treatment",
      description: "Long-acting growth factor injection given once per cycle.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-growth-factors", "kw-primary-prophylaxis"]
    },
    {
      id: "kw-filgrastim",
      label: "Filgrastim",
      category: "Treatment",
      description: "Short-acting growth factor requiring daily injections.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-growth-factors", "kw-pegfilgrastim"]
    },
    {
      id: "kw-primary-prophylaxis",
      label: "Primary Prophylaxis",
      category: "Treatment",
      description: "Preventive use of growth factors before neutropenia occurs.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-growth-factors", "kw-5"]
    },
    {
      id: "kw-secondary-prophylaxis",
      label: "Secondary Prophylaxis",
      category: "Treatment",
      description: "Use of growth factors after previous febrile neutropenia episode.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-growth-factors", "kw-febrile-neutropenia"]
    },
    {
      id: "kw-infection-prevention",
      label: "Infection Prevention",
      category: "Treatment",
      description: "Strategies including hand hygiene and avoiding crowds.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-5", "kw-febrile-neutropenia"]
    },
    {
      id: "kw-absolute-neutrophil-count",
      label: "Absolute Neutrophil Count",
      category: "Monitoring",
      description: "Laboratory measurement of neutrophil levels.",
      color: "emerald",
      confidence: 0.94,
      relatedKeywords: ["kw-5", "kw-neutropenia-risk", "kw-febrile-neutropenia", "kw-neutropenia-grading"]
    },
    {
      id: "kw-neutropenia-grading",
      label: "Neutropenia Grading",
      category: "Side Effect",
      description: "CTCAE grading system (Grade 1-4) for severity.",
      color: "amber",
      confidence: 0.93,
      relatedKeywords: ["kw-5", "kw-absolute-neutrophil-count"]
    },
    {
      id: "kw-dose-reduction",
      label: "Dose Reduction",
      category: "Treatment",
      description: "Reduction in chemotherapy dose due to toxicity.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-5", "kw-dose-delay", "kw-dose-modification"]
    },
    {
      id: "kw-dose-delay",
      label: "Dose Delay",
      category: "Treatment",
      description: "Postponing chemotherapy cycle to allow recovery.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-dose-reduction", "kw-5"]
    },
    {
      id: "kw-dose-modification",
      label: "Dose Modification",
      category: "Treatment",
      description: "General term for dose adjustments due to toxicity.",
      color: "blue",
      confidence: 0.91,
      relatedKeywords: ["kw-dose-reduction", "kw-dose-delay"]
    },

    // Peripheral Neuropathy relationships
    {
      id: "kw-neuropathy-management",
      label: "Neuropathy Management",
      category: "Treatment",
      description: "Strategies to prevent and manage chemotherapy-induced neuropathy.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-6", "kw-paclitaxel", "kw-neuropathic-pain"]
    },
    {
      id: "kw-neuropathic-pain",
      label: "Neuropathic Pain",
      category: "Side Effect",
      description: "Nerve-related pain, tingling, or numbness.",
      color: "amber",
      confidence: 0.95,
      relatedKeywords: ["kw-6", "kw-gabapentin", "kw-pregabalin", "kw-duloxetine"]
    },
    {
      id: "kw-gabapentin",
      label: "Gabapentin",
      category: "Treatment",
      description: "Medication for neuropathic pain management.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-neuropathic-pain", "kw-6"]
    },
    {
      id: "kw-pregabalin",
      label: "Pregabalin",
      category: "Treatment",
      description: "Alternative medication for neuropathic pain.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-neuropathic-pain", "kw-gabapentin"]
    },
    {
      id: "kw-duloxetine",
      label: "Duloxetine",
      category: "Treatment",
      description: "SNRI medication effective for chemotherapy-induced neuropathy.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-neuropathic-pain"]
    },
    {
      id: "kw-neuropathy-grading",
      label: "Neuropathy Grading",
      category: "Side Effect",
      description: "CTCAE grading system for peripheral neuropathy severity.",
      color: "amber",
      confidence: 0.94,
      relatedKeywords: ["kw-6", "kw-neuropathic-pain", "kw-neurologic-exam"]
    },
    {
      id: "kw-neurologic-exam",
      label: "Neurologic Examination",
      category: "Monitoring",
      description: "Clinical assessment of sensation, reflexes, and motor function.",
      color: "emerald",
      confidence: 0.93,
      relatedKeywords: ["kw-6", "kw-neuropathy-grading"]
    },
    {
      id: "kw-dose-modification-neuropathy",
      label: "Dose Modification for Neuropathy",
      category: "Treatment",
      description: "Reducing or stopping taxane dose when neuropathy becomes severe.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-6", "kw-paclitaxel", "kw-dose-reduction"]
    },
    {
      id: "kw-ice-gloves",
      label: "Ice Gloves/Socks",
      category: "Treatment",
      description: "Cryotherapy during taxane infusion to reduce neuropathy risk.",
      color: "blue",
      confidence: 0.91,
      relatedKeywords: ["kw-6", "kw-paclitaxel"]
    },
    {
      id: "kw-neuropathy-prevention",
      label: "Neuropathy Prevention",
      category: "Treatment",
      description: "Strategies to prevent neuropathy before it develops.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-6", "kw-ice-gloves"]
    },

    // Tumor Markers relationships
    {
      id: "kw-ca153",
      label: "CA 15-3",
      category: "Monitoring",
      description: "Tumor marker blood test for breast cancer monitoring.",
      color: "emerald",
      confidence: 0.95,
      relatedKeywords: ["kw-7", "kw-ca2729", "kw-cea", "kw-tumor-marker-trending"]
    },
    {
      id: "kw-ca2729",
      label: "CA 27-29",
      category: "Monitoring",
      description: "Alternative tumor marker test for breast cancer.",
      color: "emerald",
      confidence: 0.94,
      relatedKeywords: ["kw-ca153", "kw-7"]
    },
    {
      id: "kw-cea",
      label: "CEA",
      category: "Monitoring",
      description: "Carcinoembryonic antigen sometimes elevated in breast cancer.",
      color: "emerald",
      confidence: 0.93,
      relatedKeywords: ["kw-ca153", "kw-tumor-marker-trending"]
    },
    {
      id: "kw-tumor-marker-trending",
      label: "Tumor Marker Trending",
      category: "Monitoring",
      description: "Tracking changes in tumor marker levels over time.",
      color: "emerald",
      confidence: 0.95,
      relatedKeywords: ["kw-7", "kw-ca153", "kw-response-assessment", "kw-tumor-marker-baseline"]
    },
    {
      id: "kw-tumor-marker-baseline",
      label: "Tumor Marker Baseline",
      category: "Monitoring",
      description: "Initial tumor marker levels established before treatment.",
      color: "emerald",
      confidence: 0.94,
      relatedKeywords: ["kw-7", "kw-ca153", "kw-tumor-marker-trending"]
    },
    {
      id: "kw-marker-normalization",
      label: "Marker Normalization",
      category: "Monitoring",
      description: "Return of elevated markers to normal range.",
      color: "emerald",
      confidence: 0.93,
      relatedKeywords: ["kw-tumor-marker-trending", "kw-response-assessment"]
    },
    {
      id: "kw-response-assessment",
      label: "Response Assessment",
      category: "Monitoring",
      description: "Evaluation of treatment effectiveness.",
      color: "emerald",
      confidence: 0.96,
      relatedKeywords: ["kw-tumor-marker-trending", "kw-8", "kw-recist-criteria"]
    },
    {
      id: "kw-recist-criteria",
      label: "RECIST Criteria",
      category: "Monitoring",
      description: "Standardized criteria for measuring tumor response.",
      color: "emerald",
      confidence: 0.95,
      relatedKeywords: ["kw-response-assessment", "kw-imaging-studies"]
    },

    // Complete Metabolic Response relationships
    {
      id: "kw-pet-scan",
      label: "PET Scan",
      category: "Monitoring",
      description: "Positron emission tomography using radioactive tracer.",
      color: "emerald",
      confidence: 0.95,
      relatedKeywords: ["kw-8", "kw-complete-response", "kw-metabolic-activity", "kw-pet-ct-fusion"]
    },
    {
      id: "kw-complete-response",
      label: "Complete Response",
      category: "Monitoring",
      description: "No evidence of active cancer on imaging.",
      color: "emerald",
      confidence: 0.96,
      relatedKeywords: ["kw-8", "kw-pet-scan", "kw-pathologic-complete-response"]
    },
    {
      id: "kw-metabolic-activity",
      label: "Metabolic Activity",
      category: "Monitoring",
      description: "Measure of cancer cell activity using PET scan.",
      color: "emerald",
      confidence: 0.94,
      relatedKeywords: ["kw-pet-scan", "kw-8", "kw-suv-value", "kw-deauville-score"]
    },
    {
      id: "kw-suv-value",
      label: "SUV Value",
      category: "Monitoring",
      description: "Standardized uptake value from PET scan.",
      color: "emerald",
      confidence: 0.93,
      relatedKeywords: ["kw-pet-scan", "kw-metabolic-activity"]
    },
    {
      id: "kw-pet-ct-fusion",
      label: "PET-CT Fusion",
      category: "Monitoring",
      description: "Combined PET and CT imaging.",
      color: "emerald",
      confidence: 0.94,
      relatedKeywords: ["kw-pet-scan", "kw-ct-chest", "kw-imaging-studies"]
    },
    {
      id: "kw-deauville-score",
      label: "Deauville Score",
      category: "Monitoring",
      description: "5-point scale for assessing metabolic response (1-5).",
      color: "emerald",
      confidence: 0.94,
      relatedKeywords: ["kw-pet-scan", "kw-metabolic-activity", "kw-response-assessment"]
    },
    {
      id: "kw-ct-chest",
      label: "CT Chest",
      category: "Monitoring",
      description: "Computed tomography scan of chest.",
      color: "emerald",
      confidence: 0.93,
      relatedKeywords: ["kw-imaging-studies", "kw-response-assessment"]
    },
    {
      id: "kw-mri-breast",
      label: "MRI Breast",
      category: "Monitoring",
      description: "Magnetic resonance imaging of breast.",
      color: "emerald",
      confidence: 0.93,
      relatedKeywords: ["kw-imaging-studies", "kw-response-assessment"]
    },

    // Lumpectomy relationships
    {
      id: "kw-breast-conserving-surgery",
      label: "Breast Conserving Surgery",
      category: "Treatment",
      description: "Surgical removal of tumor while preserving breast tissue.",
      color: "blue",
      confidence: 0.96,
      relatedKeywords: ["kw-9", "kw-lumpectomy", "kw-sentinel-node-biopsy"]
    },
    {
      id: "kw-lumpectomy",
      label: "Lumpectomy",
      category: "Treatment",
      description: "Surgical procedure to remove tumor with margin.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-9", "kw-breast-conserving-surgery", "kw-surgical-margins", "kw-wire-localization"]
    },
    {
      id: "kw-wire-localization",
      label: "Wire Localization",
      category: "Treatment",
      description: "Pre-surgical procedure to mark tumor location.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-9", "kw-lumpectomy", "kw-surgical-planning"]
    },
    {
      id: "kw-surgical-planning",
      label: "Surgical Planning",
      category: "Treatment",
      description: "Pre-operative assessment and surgical approach.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-9", "kw-lumpectomy", "kw-wire-localization"]
    },
    {
      id: "kw-sentinel-node-biopsy",
      label: "Sentinel Node Biopsy",
      category: "Treatment",
      description: "Procedure to identify and remove first lymph nodes.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-9", "kw-axillary-dissection", "kw-lymph-node-status", "kw-radioactive-tracer"]
    },
    {
      id: "kw-radioactive-tracer",
      label: "Radioactive Tracer",
      category: "Treatment",
      description: "Substance injected to identify sentinel lymph nodes.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-sentinel-node-biopsy", "kw-blue-dye"]
    },
    {
      id: "kw-blue-dye",
      label: "Blue Dye",
      category: "Treatment",
      description: "Visual marker used with radioactive tracer.",
      color: "blue",
      confidence: 0.91,
      relatedKeywords: ["kw-sentinel-node-biopsy", "kw-radioactive-tracer"]
    },
    {
      id: "kw-axillary-dissection",
      label: "Axillary Dissection",
      category: "Treatment",
      description: "Removal of multiple axillary lymph nodes.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-sentinel-node-biopsy", "kw-lymph-node-status"]
    },
    {
      id: "kw-lymph-node-status",
      label: "Lymph Node Status",
      category: "Diagnosis",
      description: "Assessment of whether cancer has spread to lymph nodes.",
      color: "purple",
      confidence: 0.95,
      relatedKeywords: ["kw-sentinel-node-biopsy", "kw-stage2-details"]
    },
    {
      id: "kw-surgical-margins",
      label: "Surgical Margins",
      category: "Monitoring",
      description: "Assessment of healthy tissue around removed tumor.",
      color: "emerald",
      confidence: 0.94,
      relatedKeywords: ["kw-9", "kw-lumpectomy", "kw-re-excision", "kw-margin-width"]
    },
    {
      id: "kw-margin-width",
      label: "Margin Width",
      category: "Monitoring",
      description: "Measurement of healthy tissue margin around tumor.",
      color: "emerald",
      confidence: 0.93,
      relatedKeywords: ["kw-surgical-margins"]
    },
    {
      id: "kw-re-excision",
      label: "Re-excision",
      category: "Treatment",
      description: "Additional surgery to remove more tissue if margins positive.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-surgical-margins", "kw-9"]
    },
    {
      id: "kw-post-surgical-radiation",
      label: "Post-Surgical Radiation",
      category: "Treatment",
      description: "Radiation therapy after lumpectomy.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-9", "kw-radiation-therapy"]
    },
    {
      id: "kw-radiation-therapy",
      label: "Radiation Therapy",
      category: "Treatment",
      description: "Use of high-energy radiation to kill cancer cells.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-post-surgical-radiation", "kw-radiation-planning", "kw-radiation-fractionation"]
    },
    {
      id: "kw-radiation-planning",
      label: "Radiation Planning",
      category: "Treatment",
      description: "CT simulation and treatment field mapping.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-radiation-therapy", "kw-simulation"]
    },
    {
      id: "kw-simulation",
      label: "Simulation",
      category: "Treatment",
      description: "CT scan and positioning session for radiation planning.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-radiation-planning"]
    },
    {
      id: "kw-radiation-fractionation",
      label: "Radiation Fractionation",
      category: "Treatment",
      description: "Division of total radiation dose into daily treatments.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-radiation-therapy", "kw-radiation-dose"]
    },
    {
      id: "kw-radiation-dose",
      label: "Radiation Dose",
      category: "Treatment",
      description: "Total radiation amount measured in Gray (Gy).",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-radiation-therapy", "kw-radiation-fractionation"]
    },

    // BRCA Negative relationships
    {
      id: "kw-genetic-testing",
      label: "Genetic Testing",
      category: "Diagnosis",
      description: "DNA analysis to identify inherited cancer risk mutations.",
      color: "purple",
      confidence: 0.96,
      relatedKeywords: ["kw-10", "kw-brca-testing", "kw-genetic-counseling"]
    },
    {
      id: "kw-brca-testing",
      label: "BRCA Testing",
      category: "Diagnosis",
      description: "Specific genetic test for BRCA1 and BRCA2 mutations.",
      color: "purple",
      confidence: 0.97,
      relatedKeywords: ["kw-10", "kw-genetic-testing", "kw-hereditary-syndrome"]
    },
    {
      id: "kw-hereditary-syndrome",
      label: "Hereditary Cancer Syndrome",
      category: "Diagnosis",
      description: "Inherited genetic condition increasing cancer risk.",
      color: "purple",
      confidence: 0.95,
      relatedKeywords: ["kw-brca-testing", "kw-family-history-assessment", "kw-lynch-syndrome"]
    },
    {
      id: "kw-lynch-syndrome",
      label: "Lynch Syndrome",
      category: "Diagnosis",
      description: "Hereditary condition increasing risk of multiple cancers.",
      color: "purple",
      confidence: 0.92,
      relatedKeywords: ["kw-hereditary-syndrome"]
    },
    {
      id: "kw-family-history-assessment",
      label: "Family History Assessment",
      category: "Diagnosis",
      description: "Evaluation of family cancer patterns.",
      color: "purple",
      confidence: 0.94,
      relatedKeywords: ["kw-genetic-testing", "kw-hereditary-syndrome"]
    },
    {
      id: "kw-genetic-counseling",
      label: "Genetic Counseling",
      category: "Treatment",
      description: "Consultation about testing, results, and implications.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-genetic-testing", "kw-brca-testing"]
    },
    {
      id: "kw-surveillance-planning",
      label: "Surveillance Planning",
      category: "Treatment",
      description: "Long-term monitoring plan based on genetic results.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-10", "kw-genetic-testing"]
    },
    {
      id: "kw-genetic-panel-testing",
      label: "Genetic Panel Testing",
      category: "Diagnosis",
      description: "Comprehensive testing for multiple cancer risk genes.",
      color: "purple",
      confidence: 0.94,
      relatedKeywords: ["kw-genetic-testing", "kw-brca-testing"]
    },
    {
      id: "kw-variant-of-uncertain-significance",
      label: "VUS",
      category: "Diagnosis",
      description: "Variant of Uncertain Significance requiring further research.",
      color: "purple",
      confidence: 0.92,
      relatedKeywords: ["kw-genetic-testing", "kw-genetic-counseling"]
    },
    {
      id: "kw-family-screening",
      label: "Family Screening",
      category: "Treatment",
      description: "Recommendations for cancer screening in family members.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-genetic-counseling", "kw-family-history-assessment"]
    },

    // Additional supportive care keywords
    {
      id: "kw-fatigue-management",
      label: "Fatigue Management",
      category: "Treatment",
      description: "Strategies to manage cancer-related fatigue.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-5", "kw-6", "kw-exercise-therapy"]
    },
    {
      id: "kw-exercise-therapy",
      label: "Exercise Therapy",
      category: "Treatment",
      description: "Physical activity to reduce fatigue and improve quality of life.",
      color: "blue",
      confidence: 0.91,
      relatedKeywords: ["kw-fatigue-management"]
    },
    {
      id: "kw-nausea-management",
      label: "Nausea Management",
      category: "Treatment",
      description: "Antiemetic medications and strategies.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-3", "kw-ondansetron", "kw-metoclopramide"]
    },
    {
      id: "kw-ondansetron",
      label: "Ondansetron",
      category: "Treatment",
      description: "5-HT3 receptor antagonist for chemotherapy-induced nausea.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-nausea-management"]
    },
    {
      id: "kw-metoclopramide",
      label: "Metoclopramide",
      category: "Treatment",
      description: "Prokinetic agent for nausea and vomiting.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-nausea-management"]
    },
    {
      id: "kw-hair-loss",
      label: "Alopecia",
      category: "Side Effect",
      description: "Hair loss from chemotherapy, typically temporary.",
      color: "amber",
      confidence: 0.95,
      relatedKeywords: ["kw-3", "kw-scarves-wigs", "kw-scalp-cooling"]
    },
    {
      id: "kw-scarves-wigs",
      label: "Scarves/Wigs",
      category: "Treatment",
      description: "Supportive care options for managing appearance.",
      color: "blue",
      confidence: 0.91,
      relatedKeywords: ["kw-hair-loss"]
    },
    {
      id: "kw-scalp-cooling",
      label: "Scalp Cooling",
      category: "Treatment",
      description: "Cryotherapy to reduce chemotherapy-induced hair loss.",
      color: "blue",
      confidence: 0.90,
      relatedKeywords: ["kw-hair-loss"]
    },
    {
      id: "kw-fertility-preservation",
      label: "Fertility Preservation",
      category: "Treatment",
      description: "Options like egg/embryo freezing before chemotherapy.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-3", "kw-reproductive-counseling", "kw-egg-freezing"]
    },
    {
      id: "kw-egg-freezing",
      label: "Egg Freezing",
      category: "Treatment",
      description: "Oocyte cryopreservation before chemotherapy.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-fertility-preservation"]
    },
    {
      id: "kw-reproductive-counseling",
      label: "Reproductive Counseling",
      category: "Treatment",
      description: "Consultation about fertility preservation options.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-fertility-preservation"]
    },
    {
      id: "kw-bone-density",
      label: "Bone Density",
      category: "Monitoring",
      description: "Assessment of bone strength for aromatase inhibitors.",
      color: "emerald",
      confidence: 0.94,
      relatedKeywords: ["kw-aromatase-inhibitor", "kw-osteoporosis-risk", "kw-dexa-scan"]
    },
    {
      id: "kw-dexa-scan",
      label: "DEXA Scan",
      category: "Monitoring",
      description: "Dual-energy X-ray absorptiometry for bone density measurement.",
      color: "emerald",
      confidence: 0.93,
      relatedKeywords: ["kw-bone-density"]
    },
    {
      id: "kw-osteoporosis-risk",
      label: "Osteoporosis Risk",
      category: "Side Effect",
      description: "Increased risk of bone loss from aromatase inhibitors.",
      color: "amber",
      confidence: 0.94,
      relatedKeywords: ["kw-aromatase-inhibitor", "kw-bone-density", "kw-calcium-vitamin-d", "kw-bisphosphonates"]
    },
    {
      id: "kw-calcium-vitamin-d",
      label: "Calcium/Vitamin D",
      category: "Treatment",
      description: "Supplements to support bone health.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-osteoporosis-risk", "kw-bone-density"]
    },
    {
      id: "kw-bisphosphonates",
      label: "Bisphosphonates",
      category: "Treatment",
      description: "Medications to prevent bone loss and fractures.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-osteoporosis-risk"]
    },
    {
      id: "kw-endometrial-monitoring",
      label: "Endometrial Monitoring",
      category: "Monitoring",
      description: "Regular assessment of uterine lining for tamoxifen patients.",
      color: "emerald",
      confidence: 0.93,
      relatedKeywords: ["kw-tamoxifen", "kw-endometrial-thickness"]
    },
    {
      id: "kw-endometrial-thickness",
      label: "Endometrial Thickness",
      category: "Monitoring",
      description: "Measurement of uterine lining thickness on ultrasound.",
      color: "emerald",
      confidence: 0.92,
      relatedKeywords: ["kw-endometrial-monitoring"]
    },
    {
      id: "kw-hemorrhagic-cystitis",
      label: "Hemorrhagic Cystitis",
      category: "Side Effect",
      description: "Bladder inflammation and bleeding from cyclophosphamide.",
      color: "amber",
      confidence: 0.94,
      relatedKeywords: ["kw-cyclophosphamide", "kw-hydration-requirements", "kw-mesna"]
    },
    {
      id: "kw-mesna",
      label: "Mesna",
      category: "Treatment",
      description: "Protective agent against cyclophosphamide bladder toxicity.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-hemorrhagic-cystitis"]
    },
    {
      id: "kw-hydration-requirements",
      label: "Hydration Requirements",
      category: "Treatment",
      description: "Adequate fluid intake to prevent bladder toxicity.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-cyclophosphamide", "kw-hemorrhagic-cystitis"]
    },

    // Additional keywords for Prior Chemotherapy category
    {
      id: "kw-carboplatin",
      label: "Carboplatin",
      category: "Treatment",
      description: "Platinum-based chemotherapy agent used in various breast cancer regimens.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-3"]
    },
    {
      id: "kw-gemcitabine",
      label: "Gemcitabine",
      category: "Treatment",
      description: "Nucleoside analog chemotherapy used in advanced breast cancer.",
      color: "blue",
      confidence: 0.91,
      relatedKeywords: ["kw-3"]
    },
    {
      id: "kw-vinorelbine",
      label: "Vinorelbine",
      category: "Treatment",
      description: "Vinca alkaloid chemotherapy for metastatic breast cancer.",
      color: "blue",
      confidence: 0.90,
      relatedKeywords: ["kw-3"]
    },
    {
      id: "kw-capecitabine",
      label: "Capecitabine",
      category: "Treatment",
      description: "Oral chemotherapy prodrug converted to 5-FU in the body.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-3"]
    },
    {
      id: "kw-eribulin",
      label: "Eribulin",
      category: "Treatment",
      description: "Microtubule inhibitor for metastatic breast cancer after prior chemotherapy.",
      color: "blue",
      confidence: 0.91,
      relatedKeywords: ["kw-3"]
    },
    {
      id: "kw-ixabepilone",
      label: "Ixabepilone",
      category: "Treatment",
      description: "Epothilone B analog for taxane-resistant metastatic breast cancer.",
      color: "blue",
      confidence: 0.90,
      relatedKeywords: ["kw-3"]
    },

    // Additional keywords for Prior Surgery category
    {
      id: "kw-mastectomy",
      label: "Mastectomy",
      category: "Treatment",
      description: "Surgical removal of entire breast, including simple and modified radical types.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-9", "kw-breast-reconstruction"]
    },
    {
      id: "kw-breast-reconstruction",
      label: "Breast Reconstruction",
      category: "Treatment",
      description: "Surgical procedure to rebuild breast shape after mastectomy.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-mastectomy", "kw-implant-reconstruction", "kw-flap-reconstruction"]
    },
    {
      id: "kw-implant-reconstruction",
      label: "Implant Reconstruction",
      category: "Treatment",
      description: "Breast reconstruction using silicone or saline implants.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-breast-reconstruction"]
    },
    {
      id: "kw-flap-reconstruction",
      label: "Flap Reconstruction",
      category: "Treatment",
      description: "Breast reconstruction using patient's own tissue (TRAM, DIEP flaps).",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-breast-reconstruction"]
    },
    {
      id: "kw-axillary-lymph-node-dissection",
      label: "Axillary Lymph Node Dissection",
      category: "Treatment",
      description: "Removal of axillary lymph nodes for staging and treatment.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-9", "kw-sentinel-node-biopsy"]
    },
    {
      id: "kw-oncoplastic-surgery",
      label: "Oncoplastic Surgery",
      category: "Treatment",
      description: "Combination of cancer removal and plastic surgery techniques.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-9", "kw-lumpectomy"]
    },

    // Additional keywords for Cancer Types category
    {
      id: "kw-stage-i-breast-cancer",
      label: "Stage I Breast Cancer",
      category: "Diagnosis",
      description: "Early-stage breast cancer with tumor ≤2cm and no lymph node involvement.",
      color: "purple",
      confidence: 0.96,
      relatedKeywords: ["kw-1"]
    },
    {
      id: "kw-stage-iii-breast-cancer",
      label: "Stage III Breast Cancer",
      category: "Diagnosis",
      description: "Locally advanced breast cancer with larger tumors or extensive lymph node involvement.",
      color: "purple",
      confidence: 0.95,
      relatedKeywords: ["kw-1"]
    },
    {
      id: "kw-stage-iv-breast-cancer",
      label: "Stage IV Breast Cancer",
      category: "Diagnosis",
      description: "Metastatic breast cancer with distant spread to other organs.",
      color: "purple",
      confidence: 0.96,
      relatedKeywords: ["kw-1"]
    },
    {
      id: "kw-invasive-ductal-carcinoma",
      label: "Invasive Ductal Carcinoma",
      category: "Diagnosis",
      description: "Most common type of breast cancer, starting in milk ducts.",
      color: "purple",
      confidence: 0.97,
      relatedKeywords: ["kw-1"]
    },
    {
      id: "kw-invasive-lobular-carcinoma",
      label: "Invasive Lobular Carcinoma",
      category: "Diagnosis",
      description: "Breast cancer starting in milk-producing lobules.",
      color: "purple",
      confidence: 0.96,
      relatedKeywords: ["kw-1"]
    },
    {
      id: "kw-triple-negative-breast-cancer",
      label: "Triple-Negative Breast Cancer",
      category: "Diagnosis",
      description: "ER-, PR-, HER2- breast cancer requiring different treatment approach.",
      color: "purple",
      confidence: 0.95,
      relatedKeywords: ["kw-2"]
    },
    {
      id: "kw-her2-positive-breast-cancer",
      label: "HER2-Positive Breast Cancer",
      category: "Diagnosis",
      description: "Breast cancer overexpressing HER2 protein, eligible for targeted therapy.",
      color: "purple",
      confidence: 0.96,
      relatedKeywords: ["kw-2", "kw-her2-targeted-therapy"]
    },
    {
      id: "kw-her2-targeted-therapy",
      label: "HER2-Targeted Therapy",
      category: "Treatment",
      description: "Treatments targeting HER2 protein including trastuzumab and pertuzumab.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-her2-positive-breast-cancer"]
    },

    // Additional keywords for Treatments category
    {
      id: "kw-trastuzumab",
      label: "Trastuzumab",
      category: "Treatment",
      description: "Monoclonal antibody targeting HER2 protein (Herceptin).",
      color: "blue",
      confidence: 0.96,
      relatedKeywords: ["kw-her2-targeted-therapy"]
    },
    {
      id: "kw-pertuzumab",
      label: "Pertuzumab",
      category: "Treatment",
      description: "HER2-targeted monoclonal antibody (Perjeta) used with trastuzumab.",
      color: "blue",
      confidence: 0.95,
      relatedKeywords: ["kw-her2-targeted-therapy"]
    },
    {
      id: "kw-ado-trastuzumab-emtansine",
      label: "T-DM1",
      category: "Treatment",
      description: "Antibody-drug conjugate combining trastuzumab with chemotherapy (Kadcyla).",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-her2-targeted-therapy"]
    },
    {
      id: "kw-fam-trastuzumab-deruxtecan",
      label: "T-DXd",
      category: "Treatment",
      description: "Antibody-drug conjugate (Enhertu) for HER2-positive metastatic breast cancer.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-her2-targeted-therapy"]
    },
    {
      id: "kw-neratinib",
      label: "Neratinib",
      category: "Treatment",
      description: "Oral HER2-targeted kinase inhibitor for extended adjuvant therapy.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-her2-targeted-therapy"]
    },
    {
      id: "kw-lapatinib",
      label: "Lapatinib",
      category: "Treatment",
      description: "Oral dual HER2/EGFR inhibitor (Tykerb) for advanced HER2+ disease.",
      color: "blue",
      confidence: 0.92,
      relatedKeywords: ["kw-her2-targeted-therapy"]
    },
    {
      id: "kw-tucatinib",
      label: "Tucatinib",
      category: "Treatment",
      description: "Oral HER2-specific kinase inhibitor (Tukysa) for metastatic disease.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-her2-targeted-therapy"]
    },
    {
      id: "kw-olaparib",
      label: "Olaparib",
      category: "Treatment",
      description: "PARP inhibitor (Lynparza) for BRCA-mutated metastatic breast cancer.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-10"]
    },
    {
      id: "kw-talazoparib",
      label: "Talazoparib",
      category: "Treatment",
      description: "PARP inhibitor (Talzenna) for BRCA-mutated metastatic breast cancer.",
      color: "blue",
      confidence: 0.94,
      relatedKeywords: ["kw-10"]
    },
    {
      id: "kw-alpelisib",
      label: "Alpelisib",
      category: "Treatment",
      description: "PI3K inhibitor (Piqray) for PIK3CA-mutated ER+ metastatic disease.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-endocrine-therapy"]
    },
    {
      id: "kw-everolimus",
      label: "Everolimus",
      category: "Treatment",
      description: "mTOR inhibitor (Afinitor) combined with exemestane for ER+ disease.",
      color: "blue",
      confidence: 0.93,
      relatedKeywords: ["kw-endocrine-therapy"]
    },

    // Additional keywords for Biomarkers category
    {
      id: "kw-ki67-index",
      label: "Ki-67 Index",
      category: "Diagnosis",
      description: "Proliferation marker indicating tumor growth rate and aggressiveness.",
      color: "purple",
      confidence: 0.94,
      relatedKeywords: ["kw-2"]
    },
    {
      id: "kw-pik3ca-mutation",
      label: "PIK3CA Mutation",
      category: "Diagnosis",
      description: "Common mutation in ER+ breast cancer, targetable with alpelisib.",
      color: "purple",
      confidence: 0.93,
      relatedKeywords: ["kw-biomarker-testing"]
    },
    {
      id: "kw-pten-loss",
      label: "PTEN Loss",
      category: "Diagnosis",
      description: "Loss of PTEN tumor suppressor, associated with treatment resistance.",
      color: "purple",
      confidence: 0.92,
      relatedKeywords: ["kw-biomarker-testing"]
    },
    {
      id: "kw-egfr-expression",
      label: "EGFR Expression",
      category: "Diagnosis",
      description: "Epidermal growth factor receptor expression, relevant for targeted therapy.",
      color: "purple",
      confidence: 0.91,
      relatedKeywords: ["kw-biomarker-testing"]
    },
    {
      id: "kw-vegf-expression",
      label: "VEGF Expression",
      category: "Diagnosis",
      description: "Vascular endothelial growth factor, targetable with anti-angiogenic therapy.",
      color: "purple",
      confidence: 0.91,
      relatedKeywords: ["kw-biomarker-testing"]
    },
    {
      id: "kw-multigene-assay",
      label: "Multigene Assay",
      category: "Diagnosis",
      description: "Genomic tests like Oncotype DX, MammaPrint, or Prosigna for prognosis.",
      color: "purple",
      confidence: 0.95,
      relatedKeywords: ["kw-biomarker-testing"]
    },
    {
      id: "kw-oncotype-dx",
      label: "Oncotype DX",
      category: "Diagnosis",
      description: "21-gene recurrence score test for ER+ node-negative breast cancer.",
      color: "purple",
      confidence: 0.96,
      relatedKeywords: ["kw-multigene-assay"]
    },
    {
      id: "kw-mammaprint",
      label: "MammaPrint",
      category: "Diagnosis",
      description: "70-gene signature test for early-stage breast cancer prognosis.",
      color: "purple",
      confidence: 0.95,
      relatedKeywords: ["kw-multigene-assay"]
    },
    {
      id: "kw-prosigna",
      label: "Prosigna",
      category: "Diagnosis",
      description: "PAM50-based test providing risk of recurrence score.",
      color: "purple",
      confidence: 0.94,
      relatedKeywords: ["kw-multigene-assay"]
    },
    {
      id: "kw-endopredict",
      label: "EndoPredict",
      category: "Diagnosis",
      description: "12-gene molecular test for ER+ HER2- breast cancer prognosis.",
      color: "purple",
      confidence: 0.93,
      relatedKeywords: ["kw-multigene-assay"]
    },
    {
      id: "kw-ctdna-testing",
      label: "ctDNA Testing",
      category: "Diagnosis",
      description: "Circulating tumor DNA analysis for monitoring and detection.",
      color: "purple",
      confidence: 0.92,
      relatedKeywords: ["kw-biomarker-testing"]
    },
    {
      id: "kw-liquid-biopsy",
      label: "Liquid Biopsy",
      category: "Diagnosis",
      description: "Blood-based testing for tumor DNA, mutations, and biomarkers.",
      color: "purple",
      confidence: 0.93,
      relatedKeywords: ["kw-ctdna-testing"]
    }
  ];

  extendedKeywords.forEach(kw => {
    keywordMap[kw.id] = kw;
  });

  return keywordMap;
};

// Build hierarchical tree structure
const buildKnowledgeTree = (keywords: Keyword[]): TreeNode => {
  const diagnosisKeywords = keywords.filter(k => k.category === "Diagnosis");
  const treatmentKeywords = keywords.filter(k => k.category === "Treatment");
  const monitoringKeywords = keywords.filter(k => k.category === "Monitoring");
  const sideEffectKeywords = keywords.filter(k => k.category === "Side Effect");

  const tree: TreeNode = {
    id: "root",
    label: "Cancer Treatment KB",
    expanded: true,
    children: [
      {
        id: "patient-data",
        label: "Patient Data",
        expanded: true,
        children: [
          {
            id: "medical-history",
            label: "Medical History",
            keywords: diagnosisKeywords.filter(k => 
              k.label.includes("History") || 
              k.label.includes("Medical") ||
              k.label.includes("Stage")
            ),
          },
          {
            id: "family-history",
            label: "Family History",
            keywords: diagnosisKeywords.filter(k => 
              k.label.includes("Family") || 
              k.label.includes("BRCA") ||
              k.label.includes("Genetic")
            ),
          },
          {
            id: "comorbidities",
            label: "Comorbidities",
            keywords: diagnosisKeywords.filter(k => 
              k.label.includes("Comorbidity") ||
              k.label.includes("Condition")
            ),
          },
          {
            id: "treatment-history",
            label: "Treatment History",
            expanded: false,
            children: [
              {
                id: "prior-chemotherapy",
                label: "Prior Chemotherapy",
                keywords: treatmentKeywords.filter(k => 
                  k.label.includes("Chemotherapy") ||
                  k.label.includes("AC-T") ||
                  k.label.includes("Paclitaxel") ||
                  k.label.includes("Docetaxel") ||
                  k.label.includes("Carboplatin") ||
                  k.label.includes("Gemcitabine") ||
                  k.label.includes("Vinorelbine") ||
                  k.label.includes("Capecitabine") ||
                  k.label.includes("Eribulin") ||
                  k.label.includes("Ixabepilone") ||
                  k.label.includes("Adriamycin") ||
                  k.label.includes("Cyclophosphamide") ||
                  k.label.includes("Taxane") ||
                  k.label.includes("Anthracycline")
                ),
              },
              {
                id: "prior-surgery",
                label: "Prior Surgery",
                keywords: treatmentKeywords.filter(k => 
                  k.label.includes("Surgery") || 
                  k.label.includes("Lumpectomy") ||
                  k.label.includes("Mastectomy") ||
                  k.label.includes("Reconstruction") ||
                  k.label.includes("Axillary") ||
                  k.label.includes("Oncoplastic") ||
                  k.label.includes("Sentinel") ||
                  k.label.includes("Biopsy")
                ),
              },
              {
                id: "prior-radiation",
                label: "Prior Radiation",
                keywords: treatmentKeywords.filter(k => 
                  k.label.includes("Radiation") ||
                  k.label.includes("Radiotherapy") ||
                  k.label.includes("Simulation") ||
                  k.label.includes("Fractionation")
                ),
              },
            ],
          },
          {
            id: "lab-results",
            label: "Lab Results",
            keywords: monitoringKeywords.filter(k => 
              k.label.includes("Lab") || 
              k.label.includes("Markers") ||
              k.label.includes("Tumor") ||
              k.label.includes("PET") ||
              k.label.includes("CT") ||
              k.label.includes("Scan") ||
              k.label.includes("Response")
            ),
          },
        ],
      },
      {
        id: "cancer-types",
        label: "Cancer Types",
        expanded: false,
        keywords: diagnosisKeywords.filter(k => 
          k.label.includes("Cancer") || 
          k.label.includes("Stage") ||
          k.label.includes("Tumor") ||
          k.label.includes("Carcinoma") ||
          k.label.includes("Triple-Negative") ||
          k.label.includes("HER2-Positive")
        ),
      },
      {
        id: "treatments",
        label: "Treatments",
        expanded: false,
        keywords: treatmentKeywords.filter(k => 
          k.label.includes("AC-T") ||
          k.label.includes("Pembrolizumab") ||
          k.label.includes("Lumpectomy") ||
          k.label.includes("Trastuzumab") ||
          k.label.includes("Targeted") ||
          k.label.includes("Immunotherapy") ||
          k.label.includes("Endocrine") ||
          k.label.includes("Tamoxifen") ||
          k.label.includes("Aromatase") ||
          k.label.includes("CDK") ||
          k.label.includes("PARP") ||
          k.label.includes("PI3K") ||
          k.label.includes("mTOR") ||
          k.label.includes("Pertuzumab") ||
          k.label.includes("T-DM1") ||
          k.label.includes("T-DXd") ||
          k.label.includes("Neratinib") ||
          k.label.includes("Lapatinib") ||
          k.label.includes("Tucatinib") ||
          k.label.includes("Olaparib") ||
          k.label.includes("Talazoparib") ||
          k.label.includes("Alpelisib") ||
          k.label.includes("Everolimus")
        ),
      },
      {
        id: "biomarkers",
        label: "Biomarkers",
        expanded: false,
        keywords: diagnosisKeywords.filter(k => 
          k.label.includes("ER") || 
          k.label.includes("PR") || 
          k.label.includes("HER2") || 
          k.label.includes("BRCA") ||
          k.label.includes("Receptor") ||
          k.label.includes("Ki-67") ||
          k.label.includes("PIK3CA") ||
          k.label.includes("PTEN") ||
          k.label.includes("EGFR") ||
          k.label.includes("VEGF") ||
          k.label.includes("Oncotype") ||
          k.label.includes("MammaPrint") ||
          k.label.includes("Prosigna") ||
          k.label.includes("ctDNA") ||
          k.label.includes("Liquid") ||
          k.label.includes("Multigene") ||
          k.label.includes("Assay") ||
          k.label.includes("Testing") ||
          k.label.includes("IHC") ||
          k.label.includes("FISH") ||
          k.label.includes("PD-L1")
        ),
      },
      {
        id: "research",
        label: "Research",
        expanded: false,
        keywords: monitoringKeywords.filter(k => 
          k.label.includes("Research") ||
          k.label.includes("Trial") ||
          k.label.includes("Study")
        ),
      },
      {
        id: "adverse-events",
        label: "Adverse Events",
        expanded: false,
        keywords: sideEffectKeywords,
      },
    ],
  };

  return tree;
};

export default function KeywordsKnowledgeTree({ keywords, onClose }: KeywordsKnowledgeTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["root", "patient-data"]));
  const [expandedKeywords, setExpandedKeywords] = useState<Set<string>>(new Set());
  const [hoveredKeyword, setHoveredKeyword] = useState<Keyword | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isAIPanelVisible, setIsAIPanelVisible] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant for the Knowledge Tree. I can help you explore relationships between keywords, answer questions about treatments and diagnoses, and provide clinical insights. How can I assist you today?"
    }
  ]);
  
  const allKeywordsMap = useMemo(() => getAllKeywords(keywords), [keywords]);

  const handleKeywordHover = (keyword: Keyword | null) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    if (keyword) {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredKeyword(keyword);
      }, 300);
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredKeyword(null);
      }, 200);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const knowledgeTree = useMemo(() => buildKnowledgeTree(keywords), [keywords]);

  const filterTree = (node: TreeNode, query: string): TreeNode | null => {
    if (!query.trim()) return node;

    const queryLower = query.toLowerCase();
    const labelMatches = node.label.toLowerCase().includes(queryLower);
    const keywordsMatch = node.keywords?.some(k => 
      k.label.toLowerCase().includes(queryLower) ||
      k.description.toLowerCase().includes(queryLower) ||
      k.category.toLowerCase().includes(queryLower)
    );

    const filteredChildren = node.children?.map(child => filterTree(child, query)).filter(Boolean) as TreeNode[] | undefined;
    const filteredKeywords = node.keywords?.filter(k =>
      k.label.toLowerCase().includes(queryLower) ||
      k.description.toLowerCase().includes(queryLower) ||
      k.category.toLowerCase().includes(queryLower)
    );

    if (labelMatches || keywordsMatch || (filteredChildren && filteredChildren.length > 0) || (filteredKeywords && filteredKeywords.length > 0)) {
      return {
        ...node,
        children: filteredChildren,
        keywords: filteredKeywords,
      };
    }

    return null;
  };

  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return knowledgeTree;
    return filterTree(knowledgeTree, searchQuery);
  }, [knowledgeTree, searchQuery]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const toggleKeywordExpansion = (keywordId: string) => {
    setExpandedKeywords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keywordId)) {
        newSet.delete(keywordId);
      } else {
        newSet.add(keywordId);
      }
      return newSet;
    });
  };

  const handleKeywordClick = (keyword: Keyword, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (keyword.relatedKeywords && keyword.relatedKeywords.length > 0) {
      toggleKeywordExpansion(keyword.id);
    }
  };

  const getRelatedKeywords = (keyword: Keyword): Keyword[] => {
    if (!keyword.relatedKeywords || keyword.relatedKeywords.length === 0) {
      return [];
    }
    return keyword.relatedKeywords
      .map(id => allKeywordsMap[id])
      .filter(Boolean) as Keyword[];
  };

  const renderKeyword = (keyword: Keyword, level: number = 0): JSX.Element => {
    const isExpanded = expandedKeywords.has(keyword.id);
    const relatedKeywords = getRelatedKeywords(keyword);
    const hasRelated = relatedKeywords.length > 0;

    return (
      <div key={keyword.id} className="relative group">
        <div className="flex items-center">
          {/* Vertical line */}
          {level > 0 && (
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300" style={{ left: `${level * 24 - 12}px` }} />
          )}
          {/* Horizontal connector */}
          {level > 0 && (
            <div className="absolute left-0 top-1/2 w-3 h-0.5 bg-gray-300" style={{ left: `${level * 24 - 12}px`, top: '50%' }} />
          )}
          
          <div
            className={`flex items-center gap-2 py-1.5 px-3 rounded-md text-sm transition-all cursor-pointer ${
              hasRelated 
                ? "hover:bg-blue-50 hover:border-blue-200 border border-transparent" 
                : "hover:bg-gray-50"
            } ${
              level === 0 ? "text-gray-900 font-medium" : "text-gray-700"
            }`}
            style={{ marginLeft: `${level * 24}px` }}
            onClick={(e) => handleKeywordClick(keyword, e)}
            onMouseEnter={() => handleKeywordHover(keyword)}
            onMouseLeave={() => handleKeywordHover(null)}
          >
            {hasRelated && (
              <span className={`text-xs font-bold w-4 h-4 flex items-center justify-center rounded ${
                isExpanded 
                  ? "text-blue-600 bg-blue-100" 
                  : "text-gray-600 bg-gray-100"
              }`}>
                {isExpanded ? "−" : "+"}
              </span>
            )}
            {!hasRelated && (
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            )}
            <span className="flex-1">{keyword.label}</span>
            {hasRelated && (
              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {relatedKeywords.length}
              </span>
            )}
          </div>
        </div>
        
        {isExpanded && hasRelated && (
          <div className="relative">
            {relatedKeywords.map(relatedKw => renderKeyword(relatedKw, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderTreeNode = (node: TreeNode, level: number = 0): JSX.Element | null => {
    if (!node) return null;

    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const hasKeywords = node.keywords && node.keywords.length > 0;
    const isExpandable = hasChildren || hasKeywords;

    return (
      <div key={node.id} className="relative group">
        {/* Vertical line for children */}
        {level > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300" style={{ left: `${level * 24 - 12}px` }} />
        )}
        {/* Horizontal connector */}
        {level > 0 && (
          <div className="absolute left-0 top-1/2 w-3 h-0.5 bg-gray-300" style={{ left: `${level * 24 - 12}px`, top: '50%' }} />
        )}

        <div
          className={`flex items-center gap-2 py-2 px-3 rounded-md transition-all ${
            isExpandable ? "cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 border border-transparent" : "cursor-default"
          } ${
            level === 0 
              ? "font-semibold text-gray-900 text-base bg-gray-50 border-gray-200" 
              : level === 1 
              ? "font-medium text-gray-800 text-sm" 
              : "text-gray-700 text-sm"
          }`}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => isExpandable && toggleNode(node.id)}
        >
          {isExpandable && (
            <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded ${
              isExpanded 
                ? "text-indigo-600 bg-indigo-100" 
                : "text-gray-600 bg-gray-100"
            }`}>
              {isExpanded ? "−" : "+"}
            </span>
          )}
          {!isExpandable && (
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          )}
          <span className="flex-1">{node.label}</span>
          {hasKeywords && node.keywords && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-medium">
              ({node.keywords.length})
            </span>
          )}
        </div>

        {isExpanded && (
          <div className="relative">
            {node.children?.map(child => renderTreeNode(child, level + 1))}
            {node.keywords && node.keywords.length > 0 && (
              <div>
                {node.keywords.map(keyword => renderKeyword(keyword, level + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search keywords (treatments, medications, patient data, research)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
              <button 
                onClick={() => {
                  setIsAIPanelOpen(true);
                  setTimeout(() => setIsAIPanelVisible(true), 10);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Ask AI
              </button>
            </div>
          </div>

          {/* Info Panels */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold mb-2">How to Use</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Click on any keyword node to expand/collapse nested keywords</li>
                    <li>• Hover over keywords to view detailed information in the bottom right</li>
                    <li>• Nodes with + symbol have expandable children</li>
                    <li>• Lines show hierarchical relationships between concepts</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold mb-2">AI-Generated Keywords</h3>
                  <p className="text-sm text-gray-700">
                    This knowledge graph is dynamically generated by AI to help oncologists explore relationships between treatments, medications, patient histories, and research data. Each keyword includes an AI confidence score and metadata for clinical decision support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="px-8 py-6">
          <h2 className="text-gray-900 text-xl font-semibold mb-6">Interactive Knowledge Tree</h2>
          {filteredTree ? (
            <div className="w-full">
              {renderTreeNode(filteredTree)}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Keyword Details Popup - Bottom Right */}
      {hoveredKeyword && (
        <div
          className="fixed bottom-6 right-6 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-200"
          onMouseEnter={() => handleKeywordHover(hoveredKeyword)}
          onMouseLeave={() => handleKeywordHover(null)}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-semibold text-gray-900">{hoveredKeyword.label}</h3>
              <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ml-2 ${getKeywordColor(hoveredKeyword.color)}`}>
                {hoveredKeyword.category}
              </span>
            </div>
            {hoveredKeyword.confidence && (
              <div className="text-xs text-gray-500">
                AI Confidence: {(hoveredKeyword.confidence * 100).toFixed(0)}%
              </div>
            )}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-1">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{hoveredKeyword.description}</p>
            </div>
            {hoveredKeyword.relatedKeywords && hoveredKeyword.relatedKeywords.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Related Keywords</h4>
                <div className="flex flex-wrap gap-1.5">
                  {hoveredKeyword.relatedKeywords.slice(0, 6).map(relatedId => {
                    const relatedKw = allKeywordsMap[relatedId];
                    if (!relatedKw) return null;
                    return (
                      <span
                        key={relatedId}
                        className={`px-2 py-0.5 rounded-full text-xs border ${getKeywordColor(relatedKw.color)}`}
                      >
                        {relatedKw.label}
                      </span>
                    );
                  })}
                  {hoveredKeyword.relatedKeywords.length > 6 && (
                    <span className="px-2 py-0.5 text-xs text-gray-500">
                      +{hoveredKeyword.relatedKeywords.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Category:</span>
                  <span className="ml-1 text-gray-700 font-medium">{hoveredKeyword.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">ID:</span>
                  <span className="ml-1 text-gray-700 font-mono text-xs">{hoveredKeyword.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Side Panel */}
      {isAIPanelOpen && (
        <>
          {/* Overlay */}
          <div 
            className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
              isAIPanelVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => {
              setIsAIPanelVisible(false);
              setTimeout(() => setIsAIPanelOpen(false), 300);
            }}
          />
          
          {/* Side Panel */}
          <div className={`fixed right-0 top-0 h-full bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
            isAIPanelVisible ? "translate-x-0" : "translate-x-full"
          }`} style={{ width: '576px' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                <h2 className="text-gray-900">Clinical AI</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  title="Chat history"
                >
                  <History className="w-5 h-5" />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  title="Upload document"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsVoiceMode(!isVoiceMode)}
                  className={`p-2 rounded-lg transition-all ${
                    isVoiceMode 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                  title={isVoiceMode ? "Switch to text mode" : "Switch to voice mode"}
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsAIPanelVisible(false);
                    setTimeout(() => setIsAIPanelOpen(false), 300);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 px-6 py-4">
              {isVoiceMode ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <button
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                    onClick={() => {
                      const aiResponse = {
                        id: String(messages.length + 1),
                        role: "assistant",
                        content: "Voice mode is active. In a production environment, this would record your voice, transcribe it, and provide a spoken response."
                      };
                      setMessages([...messages, aiResponse]);
                    }}
                  >
                    <Mic className="w-8 h-8 text-white" />
                  </button>
                  <p className="text-gray-500 text-sm mt-3">Tap to speak</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!chatInput.trim()) return;

                    const userMessage = {
                      id: String(messages.length + 1),
                      role: "user" as const,
                      content: chatInput
                    };

                    setMessages([...messages, userMessage]);
                    setChatInput("");

                    // Simulate AI response
                    setTimeout(() => {
                      const aiResponse = {
                        id: String(messages.length + 2),
                        role: "assistant" as const,
                        content: "I understand your question about the knowledge tree. In a production environment, this would analyze the keyword relationships, search the knowledge graph, and provide insights based on the patient's data and the keyword connections you're exploring."
                      };
                      setMessages(prev => [...prev, aiResponse]);
                    }, 1000);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask about keywords, treatments, or relationships..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="Attach"
                    >
                      <Paperclip className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
