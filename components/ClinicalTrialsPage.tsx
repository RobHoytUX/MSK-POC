import { useState } from "react";
import { Search, X, ExternalLink, MapPin, Users, Calendar, FileText, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface ClinicalTrial {
  id: string;
  nctId: string;
  title: string;
  phase: string;
  status: "Recruiting" | "Active, not recruiting" | "Completed" | "Not yet recruiting";
  condition: string;
  intervention: string;
  sponsor: string;
  location: string;
  enrollmentCount: number;
  startDate: string;
  completionDate: string;
  eligibility: {
    minAge: string;
    maxAge: string;
    gender: string;
    criteria: string[];
  };
  description: string;
  primaryOutcome: string;
  secondaryOutcomes: string[];
  contactInfo: string;
  keywords: {
    id: string;
    label: string;
    category: string;
    description: string;
    color: string;
  }[];
}

const clinicalTrialsData: ClinicalTrial[] = [
  {
    id: "trial-1",
    nctId: "NCT05234567",
    title: "Phase II Study of Pembrolizumab Combined With Chemotherapy in HER2-Negative Breast Cancer",
    phase: "Phase 2",
    status: "Recruiting",
    condition: "HER2-Negative Breast Cancer",
    intervention: "Drug: Pembrolizumab, Paclitaxel, Carboplatin",
    sponsor: "National Cancer Institute",
    location: "Multiple Sites, United States",
    enrollmentCount: 180,
    startDate: "January 2024",
    completionDate: "December 2026",
    eligibility: {
      minAge: "18 years",
      maxAge: "75 years",
      gender: "All",
      criteria: [
        "Histologically confirmed HER2-negative breast cancer",
        "ECOG performance status 0-1",
        "Adequate organ function",
        "No prior immunotherapy treatment",
        "Measurable disease per RECIST 1.1 criteria"
      ]
    },
    description: "This phase II trial studies how well pembrolizumab works when given together with chemotherapy in treating patients with HER2-negative breast cancer. Immunotherapy with monoclonal antibodies, such as pembrolizumab, may help the body's immune system attack the cancer, and may interfere with the ability of tumor cells to grow and spread. Drugs used in chemotherapy work in different ways to stop the growth of tumor cells.",
    primaryOutcome: "Objective Response Rate (ORR) at 24 weeks",
    secondaryOutcomes: [
      "Progression-free survival (PFS)",
      "Overall survival (OS)",
      "Duration of response",
      "Safety and tolerability profile",
      "Quality of life assessments"
    ],
    contactInfo: "Study Coordinator: trials@nci.gov | Phone: 1-800-422-6237",
    keywords: [
      {
        id: "kw-t1-1",
        label: "Pembrolizumab",
        category: "Drug",
        description: "PD-1 checkpoint inhibitor immunotherapy that helps the immune system recognize and attack cancer cells.",
        color: "blue"
      },
      {
        id: "kw-t1-2",
        label: "HER2-Negative",
        category: "Biomarker",
        description: "Breast cancer subtype that does not overexpress HER2 protein, requiring alternative treatment approaches.",
        color: "purple"
      },
      {
        id: "kw-t1-3",
        label: "RECIST 1.1",
        category: "Criteria",
        description: "Response Evaluation Criteria In Solid Tumors - standardized way to measure tumor response to treatment.",
        color: "emerald"
      }
    ]
  },
  {
    id: "trial-2",
    nctId: "NCT05189432",
    title: "Neoadjuvant CDK4/6 Inhibitor With Aromatase Inhibitor in HR-Positive, HER2-Negative Breast Cancer",
    phase: "Phase 3",
    status: "Active, not recruiting",
    condition: "Hormone Receptor-Positive Breast Cancer",
    intervention: "Drug: Ribociclib, Letrozole",
    sponsor: "Alliance for Clinical Trials in Oncology",
    location: "200+ Centers, Worldwide",
    enrollmentCount: 350,
    startDate: "March 2023",
    completionDate: "September 2025",
    eligibility: {
      minAge: "18 years",
      maxAge: "N/A",
      gender: "All",
      criteria: [
        "ER-positive and/or PR-positive breast cancer",
        "HER2-negative status confirmed",
        "Stage II or III disease",
        "Postmenopausal or premenopausal on ovarian suppression",
        "No prior systemic therapy for current diagnosis"
      ]
    },
    description: "This randomized phase III trial compares the effect of adding ribociclib to letrozole versus letrozole alone as neoadjuvant therapy in treating patients with hormone receptor-positive, HER2-negative breast cancer. CDK4/6 inhibitors like ribociclib may stop the growth of tumor cells by blocking enzymes needed for cell growth.",
    primaryOutcome: "Pathological Complete Response (pCR) rate",
    secondaryOutcomes: [
      "Clinical response rate",
      "Breast conservation surgery rate",
      "Event-free survival",
      "Biomarker analysis of Ki-67 suppression",
      "Adverse events incidence"
    ],
    contactInfo: "Alliance Coordinator: alliance@alliance.org | Phone: 1-888-651-3789",
    keywords: [
      {
        id: "kw-t2-1",
        label: "CDK4/6 Inhibitor",
        category: "Drug Class",
        description: "Medications that block cyclin-dependent kinases 4 and 6, which regulate cell division in cancer cells.",
        color: "blue"
      },
      {
        id: "kw-t2-2",
        label: "Neoadjuvant",
        category: "Treatment Timing",
        description: "Treatment given before the main treatment (usually surgery) to shrink tumors and improve outcomes.",
        color: "emerald"
      },
      {
        id: "kw-t2-3",
        label: "ER+/PR+",
        category: "Biomarker",
        description: "Estrogen and/or Progesterone receptor positive - tumors that grow in response to these hormones.",
        color: "purple"
      },
      {
        id: "kw-t2-4",
        label: "Ki-67",
        category: "Biomarker",
        description: "Protein marker that indicates how quickly cancer cells are dividing; used to predict treatment response.",
        color: "purple"
      }
    ]
  },
  {
    id: "trial-3",
    nctId: "NCT05298765",
    title: "PARP Inhibitor Maintenance Therapy in BRCA-Mutated Metastatic Breast Cancer",
    phase: "Phase 2/3",
    status: "Recruiting",
    condition: "BRCA-Mutated Metastatic Breast Cancer",
    intervention: "Drug: Olaparib",
    sponsor: "ECOG-ACRIN Cancer Research Group",
    location: "150+ Sites, North America and Europe",
    enrollmentCount: 220,
    startDate: "June 2024",
    completionDate: "June 2028",
    eligibility: {
      minAge: "21 years",
      maxAge: "N/A",
      gender: "All",
      criteria: [
        "Germline BRCA1 or BRCA2 mutation confirmed",
        "Metastatic breast cancer with response to platinum-based chemotherapy",
        "No progression during or within 3 months of platinum therapy",
        "Adequate bone marrow and organ function",
        "Life expectancy greater than 16 weeks"
      ]
    },
    description: "This study evaluates olaparib as maintenance therapy in patients with BRCA-mutated metastatic breast cancer who have responded to platinum-based chemotherapy. Olaparib is a PARP inhibitor that may stop tumor cells from repairing damaged DNA, leading to cell death. This targeted therapy exploits the DNA repair deficiency in BRCA-mutated cancers.",
    primaryOutcome: "Progression-free survival (PFS)",
    secondaryOutcomes: [
      "Overall survival (OS)",
      "Time to first subsequent therapy",
      "Time to second progression",
      "Health-related quality of life",
      "Safety and adverse event monitoring"
    ],
    contactInfo: "ECOG-ACRIN: ecog@ecog.org | Phone: 1-617-632-3012",
    keywords: [
      {
        id: "kw-t3-1",
        label: "PARP Inhibitor",
        category: "Drug Class",
        description: "Poly (ADP-ribose) polymerase inhibitors that prevent cancer cells from repairing DNA damage.",
        color: "blue"
      },
      {
        id: "kw-t3-2",
        label: "BRCA Mutation",
        category: "Genetic Marker",
        description: "Inherited genetic mutations that significantly increase breast and ovarian cancer risk and affect treatment options.",
        color: "purple"
      },
      {
        id: "kw-t3-3",
        label: "Platinum-Based",
        category: "Prior Treatment",
        description: "Chemotherapy containing platinum compounds like carboplatin or cisplatin, often effective in BRCA-mutated cancers.",
        color: "amber"
      }
    ]
  },
  {
    id: "trial-4",
    nctId: "NCT05345678",
    title: "Sacituzumab Govitecan in Triple-Negative Breast Cancer After Relapse",
    phase: "Phase 3",
    status: "Recruiting",
    condition: "Triple-Negative Breast Cancer",
    intervention: "Drug: Sacituzumab Govitecan",
    sponsor: "Gilead Sciences",
    location: "Global, 300+ Centers",
    enrollmentCount: 468,
    startDate: "February 2024",
    completionDate: "February 2027",
    eligibility: {
      minAge: "18 years",
      maxAge: "N/A",
      gender: "All",
      criteria: [
        "Triple-negative breast cancer (ER-, PR-, HER2-)",
        "Metastatic or unresectable locally advanced disease",
        "Received at least 2 prior lines of chemotherapy",
        "ECOG performance status 0-2",
        "Measurable disease present"
      ]
    },
    description: "This phase III study evaluates sacituzumab govitecan, an antibody-drug conjugate, in patients with triple-negative breast cancer who have relapsed after standard therapies. The medication combines a monoclonal antibody targeting Trop-2 with a topoisomerase inhibitor payload, delivering chemotherapy directly to cancer cells while sparing normal tissue.",
    primaryOutcome: "Overall Survival (OS)",
    secondaryOutcomes: [
      "Progression-free survival (PFS)",
      "Objective response rate (ORR)",
      "Duration of response (DOR)",
      "Clinical benefit rate",
      "Safety and tolerability"
    ],
    contactInfo: "Gilead Medical Information: 1-800-445-3235",
    keywords: [
      {
        id: "kw-t4-1",
        label: "Triple-Negative",
        category: "Subtype",
        description: "Aggressive breast cancer subtype lacking ER, PR, and HER2 expression, with limited targeted therapy options.",
        color: "purple"
      },
      {
        id: "kw-t4-2",
        label: "Antibody-Drug Conjugate",
        category: "Drug Class",
        description: "Targeted therapy combining antibody specificity with chemotherapy payload for precise drug delivery.",
        color: "blue"
      },
      {
        id: "kw-t4-3",
        label: "Trop-2",
        category: "Target",
        description: "Trophoblast cell-surface antigen 2, highly expressed in many cancers including triple-negative breast cancer.",
        color: "emerald"
      }
    ]
  },
  {
    id: "trial-5",
    nctId: "NCT05412398",
    title: "Atezolizumab Plus Chemotherapy in Early Triple-Negative Breast Cancer (IMpassion031)",
    phase: "Phase 3",
    status: "Completed",
    condition: "Early-Stage Triple-Negative Breast Cancer",
    intervention: "Drug: Atezolizumab, Nab-paclitaxel, Doxorubicin, Cyclophosphamide",
    sponsor: "Hoffmann-La Roche",
    location: "Worldwide, 200+ Sites",
    enrollmentCount: 455,
    startDate: "August 2020",
    completionDate: "November 2024",
    eligibility: {
      minAge: "18 years",
      maxAge: "N/A",
      gender: "All",
      criteria: [
        "Previously untreated triple-negative breast cancer",
        "Stage II or III disease",
        "Candidate for neoadjuvant chemotherapy",
        "No prior cancer therapy for current diagnosis",
        "Adequate baseline organ function"
      ]
    },
    description: "This completed phase III trial evaluated whether adding atezolizumab (an immune checkpoint inhibitor) to neoadjuvant chemotherapy improves pathological complete response rates in early-stage triple-negative breast cancer. Results demonstrated significant improvement in pCR rates, particularly in PD-L1 positive tumors.",
    primaryOutcome: "Pathological Complete Response (pCR) rate in intent-to-treat population",
    secondaryOutcomes: [
      "pCR rate in PD-L1 positive population",
      "Event-free survival",
      "Overall survival",
      "Safety profile",
      "Biomarker correlative studies"
    ],
    contactInfo: "Roche Trial Information: global.rochegenentechtrials.com",
    keywords: [
      {
        id: "kw-t5-1",
        label: "Atezolizumab",
        category: "Drug",
        description: "PD-L1 checkpoint inhibitor immunotherapy that blocks proteins preventing immune system from attacking cancer.",
        color: "blue"
      },
      {
        id: "kw-t5-2",
        label: "PD-L1 Positive",
        category: "Biomarker",
        description: "Tumors expressing programmed death-ligand 1, indicating potential better response to immunotherapy.",
        color: "purple"
      },
      {
        id: "kw-t5-3",
        label: "Pathological Complete Response",
        category: "Outcome",
        description: "No remaining invasive cancer in breast and lymph nodes after treatment - strong predictor of survival.",
        color: "emerald"
      }
    ]
  },
  {
    id: "trial-6",
    nctId: "NCT05523901",
    title: "CAR T-Cell Therapy Targeting HER2 in Advanced Breast Cancer",
    phase: "Phase 1",
    status: "Not yet recruiting",
    condition: "HER2-Positive Metastatic Breast Cancer",
    intervention: "Biological: HER2-CAR T-cells",
    sponsor: "MD Anderson Cancer Center",
    location: "Houston, TX; New York, NY; Boston, MA",
    enrollmentCount: 30,
    startDate: "March 2025",
    completionDate: "March 2029",
    eligibility: {
      minAge: "18 years",
      maxAge: "70 years",
      gender: "All",
      criteria: [
        "HER2-positive metastatic breast cancer",
        "Failed at least 2 prior HER2-targeted therapies",
        "Adequate cardiac, liver, and kidney function",
        "No active CNS metastases",
        "Willing to undergo leukapheresis"
      ]
    },
    description: "This first-in-human phase I study investigates chimeric antigen receptor (CAR) T-cell therapy targeting HER2 in patients with advanced breast cancer who have exhausted standard treatment options. Patient's own T-cells are genetically modified to recognize and attack HER2-positive cancer cells. This innovative approach represents a potential breakthrough in treating resistant HER2-positive disease.",
    primaryOutcome: "Safety, tolerability, and maximum tolerated dose",
    secondaryOutcomes: [
      "CAR T-cell expansion and persistence",
      "Objective response rate",
      "Duration of response",
      "Cytokine release syndrome incidence",
      "Quality of life measures"
    ],
    contactInfo: "MD Anderson Clinical Trials: askmdanderson.org | 1-877-632-6789",
    keywords: [
      {
        id: "kw-t6-1",
        label: "CAR T-Cell",
        category: "Therapy Type",
        description: "Chimeric Antigen Receptor T-cell therapy - personalized treatment using genetically modified immune cells.",
        color: "blue"
      },
      {
        id: "kw-t6-2",
        label: "HER2-Positive",
        category: "Biomarker",
        description: "Breast cancer with HER2 protein overexpression, targetable with specific therapies.",
        color: "purple"
      },
      {
        id: "kw-t6-3",
        label: "Leukapheresis",
        category: "Procedure",
        description: "Process of collecting white blood cells from blood for CAR T-cell manufacturing.",
        color: "emerald"
      },
      {
        id: "kw-t6-4",
        label: "Cytokine Release Syndrome",
        category: "Side Effect",
        description: "Immune system reaction that can occur with CAR T-cell therapy, requiring monitoring and management.",
        color: "amber"
      }
    ]
  }
];

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

const getStatusColor = (status: string) => {
  const colors = {
    "Recruiting": "bg-green-100 text-green-700 border-green-200",
    "Active, not recruiting": "bg-blue-100 text-blue-700 border-blue-200",
    "Completed": "bg-gray-100 text-gray-700 border-gray-200",
    "Not yet recruiting": "bg-amber-100 text-amber-700 border-amber-200"
  };
  return colors[status as keyof typeof colors] || colors["Recruiting"];
};

interface ClinicalTrialsPageProps {
  onClose: () => void;
}

export default function ClinicalTrialsPage({}: ClinicalTrialsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrial, setSelectedTrial] = useState<ClinicalTrial | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  const filteredTrials = clinicalTrialsData.filter(trial => {
    const query = searchQuery.toLowerCase();
    return (
      trial.title.toLowerCase().includes(query) ||
      trial.nctId.toLowerCase().includes(query) ||
      trial.condition.toLowerCase().includes(query) ||
      trial.intervention.toLowerCase().includes(query) ||
      trial.sponsor.toLowerCase().includes(query)
    );
  });

  const handleTrialClick = (trial: ClinicalTrial) => {
    setSelectedTrial(trial);
    setTimeout(() => setIsPanelVisible(true), 10);
  };

  const handleClosePanel = () => {
    setIsPanelVisible(false);
    setTimeout(() => setSelectedTrial(null), 300);
  };

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-gray-900 mb-1">Clinical Trials</h1>
                <p className="text-gray-500">Explore relevant breast cancer clinical trials and research studies</p>
              </div>
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by trial ID, condition, intervention, or sponsor..."
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
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
          <p className="text-gray-600 text-sm">
            Showing <span className="font-semibold text-gray-900">{filteredTrials.length}</span> clinical trial{filteredTrials.length !== 1 ? 's' : ''}
            {searchQuery && <span> matching "{searchQuery}"</span>}
          </p>
        </div>

        {/* Trials List */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="space-y-4">
            {filteredTrials.map((trial) => (
              <div
                key={trial.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer"
                onClick={() => handleTrialClick(trial)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-indigo-600 font-mono text-sm">{trial.nctId}</span>
                      <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(trial.status)}`}>
                        {trial.status}
                      </span>
                      <span className="text-xs px-2 py-1 rounded border bg-purple-50 text-purple-700 border-purple-200">
                        {trial.phase}
                      </span>
                    </div>
                    <h3 className="text-gray-900 mb-2">{trial.title}</h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{trial.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{trial.enrollmentCount} participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{trial.startDate} - {trial.completionDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span>{trial.sponsor}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {trial.keywords.slice(0, 3).map((keyword) => (
                    <span
                      key={keyword.id}
                      className={`text-xs px-2 py-1 rounded-full border ${getKeywordColor(keyword.color)}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {keyword.label}
                    </span>
                  ))}
                  {trial.keywords.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      +{trial.keywords.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trial Details Side Panel */}
      {selectedTrial && (
        <>
          {/* Overlay */}
          <div 
            className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
              isPanelVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleClosePanel}
          />
          
          {/* Side Panel */}
          <div className={`fixed right-0 top-0 h-full w-1/2 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
            isPanelVisible ? "translate-x-0" : "translate-x-full"
          }`}>
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-indigo-600 font-mono text-sm">{selectedTrial.nctId}</span>
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(selectedTrial.status)}`}>
                    {selectedTrial.status}
                  </span>
                  <span className="text-xs px-2 py-1 rounded border bg-purple-50 text-purple-700 border-purple-200">
                    {selectedTrial.phase}
                  </span>
                </div>
                <h2 className="text-gray-900 text-xl">{selectedTrial.title}</h2>
              </div>
              <button
                onClick={handleClosePanel}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="space-y-6">
                {/* Overview Section */}
                <div>
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Overview
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed text-sm">{selectedTrial.description}</p>
                  </div>
                </div>

                {/* Trial Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-blue-600 text-xs mb-1">Condition</p>
                    <p className="text-gray-900 text-sm">{selectedTrial.condition}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <p className="text-purple-600 text-xs mb-1">Intervention</p>
                    <p className="text-gray-900 text-sm">{selectedTrial.intervention}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <p className="text-emerald-600 text-xs mb-1">Sponsor</p>
                    <p className="text-gray-900 text-sm">{selectedTrial.sponsor}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                    <p className="text-amber-600 text-xs mb-1">Location</p>
                    <p className="text-gray-900 text-sm">{selectedTrial.location}</p>
                  </div>
                </div>

                {/* Eligibility Criteria */}
                <div>
                  <h3 className="text-gray-900 mb-3">Eligibility Criteria</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Age Range</p>
                        <p className="text-gray-900 text-sm">{selectedTrial.eligibility.minAge} - {selectedTrial.eligibility.maxAge}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Gender</p>
                        <p className="text-gray-900 text-sm">{selectedTrial.eligibility.gender}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Enrollment</p>
                        <p className="text-gray-900 text-sm">{selectedTrial.enrollmentCount} participants</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-700 text-sm mb-2">Inclusion Criteria:</p>
                      <ul className="space-y-1">
                        {selectedTrial.eligibility.criteria.map((criterion, idx) => (
                          <li key={idx} className="text-gray-600 text-xs flex items-start gap-2">
                            <span className="text-indigo-600 mt-0.5">•</span>
                            <span>{criterion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Outcomes */}
                <div>
                  <h3 className="text-gray-900 mb-3">Study Outcomes</h3>
                  <div className="space-y-3">
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                      <p className="text-indigo-600 text-xs mb-1">Primary Outcome</p>
                      <p className="text-gray-900 text-sm">{selectedTrial.primaryOutcome}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm mb-2">Secondary Outcomes:</p>
                      <ul className="space-y-1">
                        {selectedTrial.secondaryOutcomes.map((outcome, idx) => (
                          <li key={idx} className="text-gray-600 text-xs flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Smart Keywords */}
                <div>
                  <h3 className="text-gray-900 mb-3">Smart Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrial.keywords.map((keyword) => (
                      <Popover key={keyword.id}>
                        <PopoverTrigger asChild>
                          <button
                            className={`px-3 py-1.5 rounded-full text-xs border transition-all ${getKeywordColor(keyword.color)}`}
                          >
                            {keyword.label}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" side="left" align="start">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-gray-900 text-sm">{keyword.label}</h4>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {keyword.category}
                              </span>
                            </div>
                            <p className="text-gray-600 text-xs leading-relaxed">{keyword.description}</p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                  <h3 className="text-indigo-900 text-sm mb-2">Contact Information</h3>
                  <p className="text-indigo-700 text-xs">{selectedTrial.contactInfo}</p>
                </div>

                {/* View on PubMed */}
                <div className="flex justify-end">
                  <a
                    href={`https://clinicaltrials.gov/study/${selectedTrial.nctId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on PubMed
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}