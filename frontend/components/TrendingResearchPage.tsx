import { useState } from "react";
import { Search, X, ExternalLink, TrendingUp, Users, FileText, Hash, Sparkles, UserRound, Send } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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
        label: "Liquid Biopsy",
        category: "Diagnostics",
        description: "Blood test that detects cancer DNA circulating in the bloodstream, enabling non-invasive monitoring.",
        color: "blue"
      },
      {
        id: "kw-r3-2",
        label: "Minimal Residual Disease",
        category: "Concept",
        description: "Small numbers of cancer cells that remain after treatment, undetectable by standard methods but trackable with ctDNA.",
        color: "purple"
      },
      {
        id: "kw-r3-3",
        label: "Surveillance",
        category: "Care Phase",
        description: "Regular monitoring after treatment completion to detect recurrence as early as possible.",
        color: "emerald"
      }
    ]
  },
  {
    id: "research-4",
    pmid: "PMID: 38245123",
    title: "Novel CDK4/6 Inhibitor Combination Doubles Progression-Free Survival in Advanced HR+ Breast Cancer",
    authors: ["Martínez-Ruiz A", "Kim JH", "Anderson P", "et al."],
    journal: "New England Journal of Medicine",
    publicationDate: "October 2024",
    doi: "10.1056/NEJMoa2412345",
    category: "Targeted Therapy",
    trending: {
      score: 99,
      citations: 312,
      views: "24.1K"
    },
    abstract: "Phase III trial results show that combining a next-generation CDK4/6 inhibitor with fulvestrant and an AKT inhibitor achieves unprecedented progression-free survival in patients with hormone receptor-positive, HER2-negative metastatic breast cancer who progressed on prior endocrine therapy. The triple combination extended median PFS to 18.4 months versus 9.1 months with fulvestrant alone. The regimen was particularly effective in PIK3CA-mutated tumors, a historically difficult-to-treat subset representing 40% of HR+ breast cancers.",
    keyFindings: [
      "Median PFS 18.4 months vs 9.1 months with standard therapy (HR 0.51, p<0.0001)",
      "Overall response rate 58% vs 22% with single-agent fulvestrant",
      "Benefit maintained across all subgroups including visceral metastases",
      "PIK3CA-mutated tumors showed even greater benefit (median PFS 21.2 months)",
      "Manageable toxicity profile with dose optimization strategies"
    ],
    relevance: "Major advance for HR+ metastatic patients, especially those with PIK3CA mutations - new standard of care likely.",
    keywords: [
      {
        id: "kw-r4-1",
        label: "Triple Combination",
        category: "Strategy",
        description: "Using three different drugs simultaneously to target multiple cancer pathways and overcome resistance.",
        color: "blue"
      },
      {
        id: "kw-r4-2",
        label: "PIK3CA Mutation",
        category: "Genetic Marker",
        description: "Common mutation in HR+ breast cancer affecting cell growth pathways, targetable with specific inhibitors.",
        color: "purple"
      },
      {
        id: "kw-r4-3",
        label: "Endocrine Resistance",
        category: "Challenge",
        description: "When hormone-positive cancers stop responding to hormone therapy, requiring alternative treatment approaches.",
        color: "amber"
      }
    ]
  },
  {
    id: "research-5",
    pmid: "PMID: 38212456",
    title: "Exercise and Nutrition Intervention Reduces Breast Cancer Recurrence Risk by 35% in Overweight Survivors",
    authors: ["Williams KE", "Johnson MT", "Patel AS", "et al."],
    journal: "Journal of Clinical Oncology",
    publicationDate: "September 2024",
    doi: "10.1200/JCO.24.01234",
    category: "Survivorship",
    trending: {
      score: 91,
      citations: 167,
      views: "22.8K"
    },
    abstract: "Comprehensive lifestyle intervention study demonstrates significant reduction in breast cancer recurrence among overweight and obese survivors. The randomized trial enrolled 1,340 early-stage breast cancer survivors and compared intensive lifestyle intervention (diet modification, supervised exercise, behavioral counseling) to standard care. After 5 years, the intervention group showed 35% reduction in recurrence risk, along with improvements in cardiovascular health, quality of life, and treatment-related side effects. Weight loss of 10% or more was associated with the greatest benefit.",
    keyFindings: [
      "35% reduction in recurrence risk with comprehensive lifestyle intervention (HR 0.65, p=0.003)",
      "Intervention included 150 minutes/week exercise plus Mediterranean-style diet",
      "Weight loss ≥10% associated with 47% recurrence reduction",
      "Improvements in insulin sensitivity, inflammation markers, and adipokine levels",
      "Quality of life scores improved across all domains including fatigue and sleep"
    ],
    relevance: "Empowering for all survivors - demonstrates modifiable lifestyle factors significantly impact outcomes.",
    keywords: [
      {
        id: "kw-r5-1",
        label: "Lifestyle Medicine",
        category: "Intervention",
        description: "Evidence-based approach using diet, exercise, and behavioral changes as therapeutic interventions.",
        color: "emerald"
      },
      {
        id: "kw-r5-2",
        label: "Metabolic Health",
        category: "Risk Factor",
        description: "Insulin resistance, inflammation, and obesity-related factors that influence cancer recurrence risk.",
        color: "amber"
      },
      {
        id: "kw-r5-3",
        label: "Secondary Prevention",
        category: "Strategy",
        description: "Actions taken after cancer diagnosis to prevent recurrence and improve long-term health outcomes.",
        color: "blue"
      }
    ]
  },
  {
    id: "research-6",
    pmid: "PMID: 38289734",
    title: "Genetic Risk Assessment in Young Women: Multi-gene Panel Testing Identifies Actionable Mutations in 28%",
    authors: ["Cohen RA", "Taylor SL", "Wu F", "et al."],
    journal: "Genetics in Medicine",
    publicationDate: "November 2024",
    doi: "10.1016/j.gim.2024.101234",
    category: "Prevention",
    trending: {
      score: 88,
      citations: 134,
      views: "9.6K"
    },
    abstract: "Large-scale study of multi-gene panel testing in women diagnosed with breast cancer before age 50 reveals that 28% carry actionable germline mutations beyond BRCA1/2. The research analyzed 3,847 young breast cancer patients using a 48-gene panel and identified mutations in PALB2, CHEK2, ATM, and other genes that impact treatment decisions and family screening recommendations. Importantly, 11% of mutations would have been missed by BRCA-only testing, highlighting the clinical value of expanded genetic testing.",
    keyFindings: [
      "28% of young breast cancer patients had actionable germline mutations",
      "PALB2 mutations found in 4.2% of patients (similar risk to BRCA2)",
      "Multi-gene panel identified 11% more at-risk patients than BRCA testing alone",
      "Genetic findings changed surgical decisions in 37% of mutation carriers",
      "Cascade testing identified high-risk family members in 64% of families"
    ],
    relevance: "Essential for young patients and those with family history - expanded testing may reveal important genetic risks.",
    keywords: [
      {
        id: "kw-r6-1",
        label: "Germline Testing",
        category: "Diagnostics",
        description: "Genetic testing of inherited DNA to identify mutations passed through families that increase cancer risk.",
        color: "purple"
      },
      {
        id: "kw-r6-2",
        label: "PALB2",
        category: "Gene",
        description: "Partner and localizer of BRCA2 - mutations confer moderate to high breast cancer risk, similar to BRCA2.",
        color: "blue"
      },
      {
        id: "kw-r6-3",
        label: "Cascade Testing",
        category: "Strategy",
        description: "Testing family members of mutation carriers to identify others at increased genetic risk.",
        color: "emerald"
      }
    ]
  }
];

const getCategoryColor = (category: string) => {
  const colors = {
    "Immunotherapy": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Targeted Therapy": "bg-purple-100 text-purple-700 border-purple-200",
    "Surgical Advances": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Biomarkers": "bg-blue-100 text-blue-700 border-blue-200",
    "Survivorship": "bg-amber-100 text-amber-700 border-amber-200",
    "Prevention": "bg-rose-100 text-rose-700 border-rose-200"
  };
  return colors[category as keyof typeof colors] || colors["Biomarkers"];
};


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

const getTrendingBadgeColor = (score: number) => {
  if (score >= 95) return "bg-rose-100 text-rose-700 border-rose-300";
  if (score >= 90) return "bg-orange-100 text-orange-700 border-orange-300";
  return "bg-amber-100 text-amber-700 border-amber-300";
};

interface TrendingResearchPageProps {
  onClose: () => void;
  selectedPatient?: { name: string; age: number; gender: string; diagnoses: string[]; mrn: string };
  onChangePatient?: () => void;
  onOpenChart?: () => void;
  onAskAI?: () => void;
}

export default function TrendingResearchPage({ selectedPatient, onChangePatient, onOpenChart, onAskAI }: TrendingResearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<ResearchArticle | null>(null);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const categories = ["Immunotherapy", "Targeted Therapy", "Surgical Advances", "Biomarkers", "Survivorship", "Prevention"];

  const filteredArticles = trendingResearchData.filter(article => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      article.title.toLowerCase().includes(query) ||
      article.authors.join(" ").toLowerCase().includes(query) ||
      article.journal.toLowerCase().includes(query) ||
      article.pmid.toLowerCase().includes(query) ||
      article.abstract.toLowerCase().includes(query);
    
    const matchesCategory = !filterCategory || article.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleArticleClick = (article: ResearchArticle) => {
    setSelectedArticle(article);
    setTimeout(() => setIsPanelVisible(true), 10);
  };

  const handleClosePanel = () => {
    setIsPanelVisible(false);
    setTimeout(() => setSelectedArticle(null), 300);
  };

  return (
    <>
      <div className="relative h-full min-h-0 overflow-hidden bg-[#f7f6f3] text-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#fbfaf6_0%,#f4f2ec_60%,#ecead1_100%)]" />
        <div
          className="pointer-events-none absolute inset-[-2000px] opacity-70"
          style={{
            backgroundImage: "radial-gradient(rgba(20,20,20,0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <aside className="absolute left-5 top-[84px] z-20 flex h-[min(540px,calc(100%_-_104px))] w-[380px] flex-col overflow-hidden rounded-[20px] border border-black/10 bg-white/85 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 shadow-[0_0_0_4px_#ece6ff]">
              <Sparkles className="h-4 w-4 animate-pulse text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[18px] font-semibold">Clinical Intelligence</p>
              <p className="truncate text-[16px] text-slate-500">
                {selectedPatient ? `Research context for ${selectedPatient.name}` : "Select a patient to begin"}
              </p>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-100">
              <p className="mb-2 font-mono text-[12px] font-semibold uppercase tracking-wide text-violet-600">
                Research Scope
              </p>
              <p className="text-[16px] leading-relaxed text-slate-700">
                {selectedPatient
                  ? `Trending oncology research relevant to ${selectedPatient.diagnoses[0]}.`
                  : "Review breakthrough studies and clinical signals across oncology topics."}
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {[
                `${filteredArticles.length} visible article${filteredArticles.length === 1 ? "" : "s"}`,
                filterCategory ? `Category filter: ${filterCategory}` : "All categories shown",
                searchQuery ? `Search: ${searchQuery}` : "No search filter active",
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-white/80 p-3 text-[16px] leading-relaxed text-slate-600 ring-1 ring-slate-100">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={onAskAI}
              className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-left text-[16px] text-slate-500 transition hover:border-violet-300 hover:text-violet-700"
            >
              <span className="min-w-0 flex-1 truncate">Ask about research...</span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white">
                <Send className="h-4 w-4" />
              </span>
            </button>
          </div>
        </aside>

        <div
          role="button"
          tabIndex={0}
          onClick={onOpenChart}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onOpenChart?.();
            }
          }}
          className="absolute right-5 top-5 z-40 w-[380px] rounded-[20px] border border-black/10 bg-white/85 p-4 text-left shadow-2xl backdrop-blur-xl transition hover:border-violet-200 hover:bg-white/95"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-300 text-[18px] font-semibold text-white">
              {selectedPatient?.name.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "PT"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[20px] font-semibold">{selectedPatient?.name ?? "No patient selected"}</p>
              <p className="truncate text-[16px] text-slate-500">
                {selectedPatient ? `${selectedPatient.age}yo ${selectedPatient.gender} · MRN ${selectedPatient.mrn}` : "Open patient selection"}
              </p>
            </div>
          </div>
          {selectedPatient ? (
            <div className="mt-3 flex items-end justify-between gap-3">
              <span className="inline-flex min-w-0 rounded-full bg-pink-100 px-3 py-1 text-[16px] font-medium text-pink-900">
                <span className="truncate">{selectedPatient.diagnoses[0]}</span>
              </span>
              {onChangePatient ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onChangePatient();
                  }}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-600 px-3 py-1.5 text-[14px] font-semibold text-white transition hover:bg-violet-700"
                >
                  <UserRound className="h-3.5 w-3.5" />
                  Change Patient
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <aside className="absolute left-[420px] right-[420px] top-5 z-40 flex min-h-[116px] flex-col justify-center overflow-hidden rounded-[20px] border border-black/10 bg-white/85 p-4 shadow-lg shadow-slate-900/10 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[18px] font-semibold">Research Filters</p>
              <p className="text-[16px] text-slate-500">
                Showing {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
                {filterCategory ? ` in ${filterCategory}` : ""}
              </p>
            </div>
            <div className="relative w-[min(430px,45%)] shrink-0">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-700" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, authors, journal, or keywords..."
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-10 text-[16px] focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-slate-100"
                    >
                  <X className="h-4 w-4 text-slate-600" />
                    </button>
                  )}
                </div>
            </div>
          <div className="flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <button
                  onClick={() => setFilterCategory(null)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[14px] font-medium transition-all ${
                    !filterCategory
                  ? "bg-violet-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilterCategory(category)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[14px] font-medium transition-all ${
                      filterCategory === category
                    ? "bg-violet-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
          </div>
        </aside>

        <main className="relative z-30 h-full overflow-y-auto pb-8 pl-[420px] pr-5 pt-[172px]">
          <div className="rounded-[28px] border border-black/10 bg-white/80 p-5 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">Trending Research</h1>
                <p className="mt-1 text-[16px] text-slate-500">Latest breakthrough studies relevant to diagnosis and treatment.</p>
              </div>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-[16px] font-semibold text-violet-700">
                {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                  className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-violet-300 hover:shadow-lg"
                onClick={() => handleArticleClick(article)}
              >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
                  <div>
                    {/* Header */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`text-[14px] px-2.5 py-1 rounded-full border ${getTrendingBadgeColor(article.trending.score)}`}>
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            Trending {article.trending.score}
                          </span>
                          <span className={`text-[14px] px-2.5 py-1 rounded-full border ${getCategoryColor(article.category)}`}>
                            {article.category}
                          </span>
                          <span className="text-[14px] text-gray-500">{article.publicationDate}</span>
                        </div>
                        <h3 className="mb-2 text-[20px] font-semibold leading-snug text-slate-950">{article.title}</h3>
                        <p className="text-[16px] text-gray-600 mb-2">{article.authors.join(", ")}</p>
                        <p className="text-[14px] text-indigo-600">{article.journal} • {article.pmid}</p>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="mb-4 flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-[16px] text-gray-600">{article.trending.citations} citations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-[16px] text-gray-600">{article.trending.views} views</span>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="flex flex-wrap gap-2">
                      {article.keywords.map((keyword) => (
                        <span
                          key={keyword.id}
                          className={`text-[14px] px-2 py-1 rounded-full border ${getKeywordColor(keyword.color)}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {keyword.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                    <p className="mb-2 text-[14px] font-semibold uppercase tracking-wide text-indigo-700">Why this matters</p>
                    <p className="text-[16px] leading-relaxed text-indigo-950">{article.relevance}</p>
                  </div>
                </div>
              </div>
              ))}
              {filteredArticles.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-[16px] text-slate-500">
                  No research articles match the current filters.
                </p>
              ) : null}
            </div>
          </div>
        </main>
      </div>

      {/* Article Details Side Panel */}
      {selectedArticle && (
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
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[14px] px-2.5 py-1 rounded-full border ${getTrendingBadgeColor(selectedArticle.trending.score)}`}>
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    Trending {selectedArticle.trending.score}
                  </span>
                  <span className={`text-[14px] px-2.5 py-1 rounded-full border ${getCategoryColor(selectedArticle.category)}`}>
                    {selectedArticle.category}
                  </span>
                </div>
                <h2 className="text-gray-900 text-[22px] mb-2">{selectedArticle.title}</h2>
                <p className="text-[16px] text-gray-600">{selectedArticle.authors.join(", ")}</p>
                <p className="text-[14px] text-indigo-600 mt-1">{selectedArticle.journal} • {selectedArticle.publicationDate}</p>
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
                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-blue-600 text-[14px] mb-1">Citations</p>
                    <p className="text-gray-900 text-[22px]">{selectedArticle.trending.citations}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <p className="text-purple-600 text-[14px] mb-1">Views</p>
                    <p className="text-gray-900 text-[22px]">{selectedArticle.trending.views}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                    <p className="text-emerald-600 text-[14px] mb-1">Trending Score</p>
                    <p className="text-gray-900 text-[22px]">{selectedArticle.trending.score}</p>
                  </div>
                </div>

                {/* Relevance */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <h3 className="text-indigo-900 text-[16px] mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Why This Matters to You
                  </h3>
                  <p className="text-indigo-800 text-[16px] leading-relaxed">{selectedArticle.relevance}</p>
                </div>

                {/* Abstract */}
                <div>
                  <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Abstract
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed text-[16px]">{selectedArticle.abstract}</p>
                  </div>
                </div>

                {/* Key Findings */}
                <div>
                  <h3 className="text-gray-900 mb-3">Key Findings</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {selectedArticle.keyFindings.map((finding, idx) => (
                        <li key={idx} className="text-gray-700 text-[16px] flex items-start gap-3">
                          <span className="text-indigo-600 mt-0.5 flex-shrink-0">✓</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Smart Keywords */}
                <div>
                  <h3 className="text-gray-900 mb-3">Smart Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.keywords.map((keyword) => (
                      <Popover key={keyword.id}>
                        <PopoverTrigger asChild>
                          <button
                            className={`px-3 py-1.5 rounded-full text-[14px] border transition-all ${getKeywordColor(keyword.color)}`}
                          >
                            {keyword.label}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" side="left" align="start">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-gray-900 text-[16px]">{keyword.label}</h4>
                              <span className="text-[14px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {keyword.category}
                              </span>
                            </div>
                            <p className="text-gray-600 text-[14px] leading-relaxed">{keyword.description}</p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                  </div>
                </div>

                {/* Publication Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-gray-900 text-[16px] mb-3">Publication Details</h3>
                  <div className="space-y-2 text-[16px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">PMID:</span>
                      <span className="text-gray-900 font-mono">{selectedArticle.pmid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">DOI:</span>
                      <span className="text-gray-900 font-mono text-[14px]">{selectedArticle.doi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Published:</span>
                      <span className="text-gray-900">{selectedArticle.publicationDate}</span>
                    </div>
                  </div>
                </div>

                {/* View on PubMed */}
                <div className="flex justify-end">
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${selectedArticle.pmid.replace('PMID: ', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors text-[16px]"
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