import { useState } from "react";
import { Search, X, MapPin, Users, Calendar, FileText, ChevronRight, TrendingUp, Sparkles } from "lucide-react";
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

interface ResearchArticle {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  pmid: string;
  doi: string;
  category: "Immunotherapy" | "Targeted Therapy" | "Surgical Advances" | "Biomarkers" | "Survivorship" | "Prevention";
  trending: {
    score: number;
    citations: number;
    views: string;
  };
  abstract: string;
  keyFindings: string[];
  relevance: string;
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
        description: "Hormone receptor-positive breast cancer that responds to endocrine therapy targeting estrogen and progesterone receptors.",
        color: "purple"
      }
    ]
  },
  {
    id: "trial-3",
    nctId: "NCT05298765",
    title: "Trastuzumab Deruxtecan vs Physician's Choice in HER2-Low Metastatic Breast Cancer (DESTINY-Breast06)",
    phase: "Phase 3",
    status: "Recruiting",
    condition: "HER2-Low Breast Cancer",
    intervention: "Drug: Trastuzumab deruxtecan",
    sponsor: "Daiichi Sankyo",
    location: "Global, 150+ Sites",
    enrollmentCount: 720,
    startDate: "June 2023",
    completionDate: "March 2027",
    eligibility: {
      minAge: "18 years",
      maxAge: "N/A",
      gender: "All",
      criteria: [
        "HER2-low status (IHC 1+ or IHC 2+/ISH-negative)",
        "Metastatic or unresectable breast cancer",
        "Prior treatment with chemotherapy in metastatic setting",
        "ECOG performance status 0-1",
        "Adequate hematologic and organ function"
      ]
    },
    description: "This phase III study evaluates trastuzumab deruxtecan, a novel antibody-drug conjugate, in patients with HER2-low metastatic breast cancer who have received prior treatments. The study aims to demonstrate superior efficacy compared to standard chemotherapy in this newly recognized breast cancer subtype.",
    primaryOutcome: "Progression-free survival (PFS) by blinded independent central review",
    secondaryOutcomes: [
      "Overall survival (OS)",
      "Objective response rate (ORR)",
      "Duration of response (DoR)",
      "Clinical benefit rate",
      "Patient-reported outcomes (PRO)"
    ],
    contactInfo: "Global Sponsor Contact: clinicaltrials@daiichisankyo.com | Phone: +1-908-992-6400",
    keywords: [
      {
        id: "kw-t3-1",
        label: "HER2-Low",
        category: "Biomarker",
        description: "Emerging breast cancer category with low HER2 expression (IHC 1+ or 2+/ISH-) that may benefit from HER2-targeted therapies.",
        color: "purple"
      },
      {
        id: "kw-t3-2",
        label: "ADC",
        category: "Drug Type",
        description: "Antibody-drug conjugate - targeted therapy that combines an antibody with a chemotherapy drug for precise delivery.",
        color: "blue"
      },
      {
        id: "kw-t3-3",
        label: "Metastatic",
        category: "Stage",
        description: "Cancer that has spread from the original site to other parts of the body.",
        color: "rose"
      }
    ]
  }
];

const trendingResearchData: ResearchArticle[] = [
  {
    id: "research-1",
    pmid: "PMID: 38234567",
    title: "Artificial Intelligence-Driven Prediction of Immunotherapy Response in Triple-Negative Breast Cancer",
    authors: ["Chen L", "Rodriguez M", "Yamamoto K", "et al."],
    journal: "Nature Medicine",
    publicationDate: "November 2024",
    doi: "10.1038/s41591-024-12345",
    category: "Immunotherapy",
    trending: {
      score: 98,
      citations: 147,
      views: "12.4K"
    },
    abstract: "This groundbreaking study demonstrates how machine learning algorithms can predict patient response to immune checkpoint inhibitors in triple-negative breast cancer with 87% accuracy. By analyzing multi-omic data including tumor mutational burden, PD-L1 expression, and immune cell infiltration patterns, researchers developed a predictive model that outperforms traditional biomarkers. The AI model identified novel immune signatures associated with durable responses, potentially transforming treatment selection for this aggressive breast cancer subtype.",
    keyFindings: [
      "Machine learning model achieved 87% accuracy in predicting immunotherapy response",
      "Integration of genomic, transcriptomic, and imaging data improved predictions",
      "Novel immune signatures identified that correlate with treatment durability",
      "Model validated across three independent patient cohorts (n=1,247)",
      "Clinical implementation could reduce ineffective treatments by 40%"
    ],
    relevance: "Highly relevant for TNBC patients considering immunotherapy - may help personalize treatment decisions and avoid ineffective therapies.",
    keywords: [
      {
        id: "kw-r1-1",
        label: "Machine Learning",
        category: "Technology",
        description: "AI algorithms that learn from data to make predictions and identify patterns in complex medical datasets.",
        color: "blue"
      },
      {
        id: "kw-r1-2",
        label: "Predictive Biomarkers",
        category: "Diagnostics",
        description: "Biological indicators that predict how well a patient will respond to a specific treatment.",
        color: "purple"
      },
      {
        id: "kw-r1-3",
        label: "Tumor Mutational Burden",
        category: "Biomarker",
        description: "Measure of the number of mutations in cancer cells, often associated with better immunotherapy response.",
        color: "emerald"
      }
    ]
  },
  {
    id: "research-2",
    pmid: "PMID: 38198432",
    title: "Long-term Outcomes of De-escalated Surgery in Low-Risk ER+ Breast Cancer: 10-Year Results",
    authors: ["Thompson SA", "Patel R", "O'Brien K", "et al."],
    journal: "The Lancet Oncology",
    publicationDate: "October 2024",
    doi: "10.1016/S1470-2045(24)00234-5",
    category: "Surgical Advances",
    trending: {
      score: 94,
      citations: 203,
      views: "18.2K"
    },
    abstract: "This landmark 10-year follow-up study confirms that carefully selected patients with low-risk, hormone receptor-positive breast cancer can safely undergo less extensive surgery without compromising survival. The multicenter trial enrolled 2,145 patients and found no significant difference in overall survival or disease-free survival between lumpectomy with endocrine therapy versus mastectomy in the genomically-defined low-risk group. Quality of life measures significantly favored breast-conserving therapy, with lower rates of anxiety, depression, and body image concerns.",
    keyFindings: [
      "No survival difference between lumpectomy and mastectomy in low-risk ER+ patients (10-year OS: 94.2% vs 94.1%)",
      "Genomic testing essential for patient selection - 21-gene recurrence score <11",
      "Quality of life scores 23% higher with breast-conserving therapy",
      "Local recurrence rates remained low in both groups (<3% at 10 years)",
      "Healthcare cost savings of $12,000 per patient with de-escalated approach"
    ],
    relevance: "Critical for newly diagnosed ER+ patients - supports less aggressive surgical options when genomic risk is low.",
    keywords: [
      {
        id: "kw-r2-1",
        label: "Breast Conservation",
        category: "Treatment",
        description: "Surgical approach that removes only the tumor and a margin of tissue, preserving most of the breast.",
        color: "emerald"
      },
      {
        id: "kw-r2-2",
        label: "Oncotype DX",
        category: "Test",
        description: "Genomic test that analyzes 21 genes to predict recurrence risk and chemotherapy benefit in ER+ breast cancer.",
        color: "purple"
      },
      {
        id: "kw-r2-3",
        label: "De-escalation",
        category: "Strategy",
        description: "Treatment approach using less intensive therapy when safe to do so, reducing side effects while maintaining outcomes.",
        color: "blue"
      }
    ]
  },
  {
    id: "research-3",
    pmid: "PMID: 38267891",
    title: "Circulating Tumor DNA Monitoring Predicts Relapse 8 Months Before Clinical Detection",
    authors: ["Zhang W", "Gupta S", "Nielsen T", "et al."],
    journal: "JAMA Oncology",
    publicationDate: "November 2024",
    doi: "10.1001/jamaoncol.2024.5678",
    category: "Biomarkers",
    trending: {
      score: 96,
      citations: 189,
      views: "15.7K"
    },
    abstract: "Revolutionary findings demonstrate that circulating tumor DNA (ctDNA) analysis can detect cancer recurrence an average of 8.3 months before conventional imaging or clinical symptoms appear. The prospective study followed 681 early-stage breast cancer patients post-treatment with serial ctDNA testing every 3 months. Patients who became ctDNA-positive had a 92% likelihood of developing detectable metastatic disease within 12 months. Early intervention based on ctDNA positivity led to improved treatment responses and progression-free survival.",
    keyFindings: [
      "ctDNA detected recurrence average 8.3 months before imaging (range: 4-15 months)",
      "Sensitivity of 92% and specificity of 94% for predicting relapse",
      "Early treatment intervention improved 2-year PFS from 31% to 58%",
      "Serial monitoring more effective than single post-treatment assessment",
      "Cost-effectiveness analysis supports integration into standard surveillance"
    ],
    relevance: "Game-changing for post-treatment monitoring - enables earlier detection and treatment of recurrence.",
    keywords: [
      {
        id: "kw-r3-1",
        label: "ctDNA",
        category: "Biomarker",
        description: "Circulating tumor DNA - fragments of cancer DNA found in the bloodstream that can be detected through blood tests.",
        color: "purple"
      },
      {
        id: "kw-r3-2",
        label: "Liquid Biopsy",
        category: "Test",
        description: "Non-invasive blood test that detects cancer biomarkers, replacing the need for tissue biopsies in some cases.",
        color: "blue"
      },
      {
        id: "kw-r3-3",
        label: "Early Detection",
        category: "Strategy",
        description: "Identifying cancer or recurrence at the earliest possible stage when treatment is most effective.",
        color: "emerald"
      }
    ]
  }
];

interface NewsFeedPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsFeedPanel({ isOpen, onClose }: NewsFeedPanelProps) {
  const [contentType, setContentType] = useState<"trials" | "research">("trials");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrial, setSelectedTrial] = useState<ClinicalTrial | null>(null);
  const [selectedResearch, setSelectedResearch] = useState<ResearchArticle | null>(null);

  const filteredTrials = clinicalTrialsData.filter(trial =>
    trial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trial.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trial.nctId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResearch = trendingResearchData.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.journal.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Recruiting":
        return "bg-green-100 text-green-700";
      case "Active, not recruiting":
        return "bg-blue-100 text-blue-700";
      case "Completed":
        return "bg-gray-100 text-gray-700";
      case "Not yet recruiting":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Immunotherapy":
        return "bg-purple-100 text-purple-700";
      case "Targeted Therapy":
        return "bg-blue-100 text-blue-700";
      case "Surgical Advances":
        return "bg-emerald-100 text-emerald-700";
      case "Biomarkers":
        return "bg-orange-100 text-orange-700";
      case "Survivorship":
        return "bg-pink-100 text-pink-700";
      case "Prevention":
        return "bg-teal-100 text-teal-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-30" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-1/2 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 bg-white shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-gray-900 mb-1">News Feed</h1>
                <p className="text-gray-500">Latest trials and research updates</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Content Type Switcher */}
            <div className="bg-gray-100 rounded-lg p-1 flex items-center gap-0 mb-4">
              <button
                onClick={() => {
                  setContentType("trials");
                  setSelectedTrial(null);
                  setSelectedResearch(null);
                }}
                className={`flex-1 px-4 py-2 rounded-md text-sm transition-all flex items-center justify-center gap-2 ${
                  contentType === "trials"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FileText className="w-4 h-4" />
                Clinical Trials
              </button>
              <button
                onClick={() => {
                  setContentType("research");
                  setSelectedTrial(null);
                  setSelectedResearch(null);
                }}
                className={`flex-1 px-4 py-2 rounded-md text-sm transition-all flex items-center justify-center gap-2 ${
                  contentType === "research"
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Research
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${contentType === "trials" ? "trials" : "research"}...`}
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
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {contentType === "trials" ? (
            <div className="p-8">
              {selectedTrial ? (
                // Trial Detail View
                <div>
                  <button
                    onClick={() => setSelectedTrial(null)}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to list
                  </button>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(selectedTrial.status)}`}>
                          {selectedTrial.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                          {selectedTrial.phase}
                        </span>
                      </div>
                      <h2 className="text-gray-900 mb-2">{selectedTrial.title}</h2>
                      <p className="text-sm text-gray-500">{selectedTrial.nctId}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm text-gray-900">{selectedTrial.location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Enrollment</p>
                          <p className="text-sm text-gray-900">{selectedTrial.enrollmentCount} participants</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Timeline</p>
                          <p className="text-sm text-gray-900">{selectedTrial.startDate} - {selectedTrial.completionDate}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-900 mb-2">Description</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedTrial.description}</p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-900 mb-2">Eligibility Criteria</h3>
                      <ul className="space-y-2">
                        {selectedTrial.eligibility.criteria.map((criterion, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                            {criterion}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-900 mb-2">Primary Outcome</h3>
                      <p className="text-sm text-gray-600">{selectedTrial.primaryOutcome}</p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-900 mb-3">Smart Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTrial.keywords.map((keyword) => (
                          <Popover key={keyword.id}>
                            <PopoverTrigger asChild>
                              <button className={`px-3 py-1 rounded-full text-xs bg-${keyword.color}-100 text-${keyword.color}-700 hover:bg-${keyword.color}-200 transition-colors`}>
                                {keyword.label}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm text-gray-900">{keyword.label}</h4>
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                    {keyword.category}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{keyword.description}</p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Trials List View
                <div className="space-y-4">
                  {filteredTrials.map((trial) => (
                    <button
                      key={trial.id}
                      onClick={() => setSelectedTrial(trial)}
                      className="w-full p-6 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(trial.status)}`}>
                            {trial.status}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">
                            {trial.phase}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <h3 className="text-gray-900 mb-2">{trial.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">{trial.nctId}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {trial.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {trial.enrollmentCount} participants
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8">
              {selectedResearch ? (
                // Research Detail View
                <div>
                  <button
                    onClick={() => setSelectedResearch(null)}
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to list
                  </button>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs ${getCategoryColor(selectedResearch.category)}`}>
                          {selectedResearch.category}
                        </span>
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                          <TrendingUp className="w-3 h-3" />
                          Score: {selectedResearch.trending.score}
                        </span>
                      </div>
                      <h2 className="text-gray-900 mb-2">{selectedResearch.title}</h2>
                      <p className="text-sm text-gray-500 mb-2">{selectedResearch.authors.join(", ")}</p>
                      <p className="text-sm text-gray-500">{selectedResearch.journal} • {selectedResearch.publicationDate}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-xs text-gray-500">Publication Details</p>
                      <p className="text-sm text-gray-900">{selectedResearch.pmid}</p>
                      <p className="text-sm text-gray-900">{selectedResearch.doi}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-200">
                        <span>{selectedResearch.trending.citations} citations</span>
                        <span>{selectedResearch.trending.views} views</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-900 mb-2">Abstract</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedResearch.abstract}</p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-900 mb-2">Key Findings</h3>
                      <ul className="space-y-2">
                        {selectedResearch.keyFindings.map((finding, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                            <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <h3 className="text-sm text-gray-900 mb-2">Clinical Relevance</h3>
                      <p className="text-sm text-gray-600">{selectedResearch.relevance}</p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-900 mb-3">Smart Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedResearch.keywords.map((keyword) => (
                          <Popover key={keyword.id}>
                            <PopoverTrigger asChild>
                              <button className={`px-3 py-1 rounded-full text-xs bg-${keyword.color}-100 text-${keyword.color}-700 hover:bg-${keyword.color}-200 transition-colors`}>
                                {keyword.label}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm text-gray-900">{keyword.label}</h4>
                                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                    {keyword.category}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{keyword.description}</p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Research List View
                <div className="space-y-4">
                  {filteredResearch.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedResearch(article)}
                      className="w-full p-6 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs ${getCategoryColor(article.category)}`}>
                            {article.category}
                          </span>
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-700">
                            <TrendingUp className="w-3 h-3" />
                            {article.trending.score}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <h3 className="text-gray-900 mb-2">{article.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{article.authors.join(", ")}</p>
                      <p className="text-sm text-gray-500 mb-3">{article.journal} • {article.publicationDate}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{article.trending.citations} citations</span>
                        <span>{article.trending.views} views</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}